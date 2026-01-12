import { useState, useRef } from 'react'
import { analyzeAnswer } from '../services/geminiService'
import { supabase } from '../services/supabase'

export default function Practice({ question, onBack, userId }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported. Please use Chrome or Edge.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript
      }
      setTranscript(finalTranscript)
    }

    recognitionRef.current.onerror = (event) => {
      setError('Error: ' + event.error)
      setIsRecording(false)
    }

    recognitionRef.current.start()
    setIsRecording(true)
    setError(null)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please record your answer first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await analyzeAnswer(
        question.question_text,
        transcript,
        question.tips || ''
      )
      setFeedback(result)

      // Save result to database
      await supabase.from('results').insert({
        user_id: userId,
        question_id: question.id,
        answer_text: transcript,
        grammar_score: result.grammar?.score || 0,
        vocabulary_score: result.vocabulary?.score || 0,
        fluency_score: result.fluency?.score || 0,
        overall_score: result.overall_score || 0,
        feedback: result,
      })
    } catch (err) {
      setError('Failed to analyze. Please try again. Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setTranscript('')
    setFeedback(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-white flex items-center gap-2">
            ← Back to questions
          </button>
        </div>
      </header>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{question.title}</h2>
          <p className="text-gray-600 text-lg">{question.question_text}</p>
          {question.tips && (
            <p className="mt-3 text-purple-600 text-sm">💡 Tip: {question.tips}</p>
          )}
        </div>

        {/* Recording Section */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Your Answer</h3>
          
          <div className="flex justify-center mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition ${
                isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
          </div>
          <p className="text-center text-gray-500 text-sm mb-4">
            {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
          </p>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your speech will appear here... Or type your answer"
            className="w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !transcript.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? '✨ Analyzing...' : '✨ Analyze My Answer'}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Your Feedback</h3>
            
            {/* Scores */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{feedback.overall_score}</div>
                <div className="text-sm text-gray-500">Overall</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{feedback.grammar?.score}</div>
                <div className="text-sm text-gray-500">Grammar</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{feedback.vocabulary?.score}</div>
                <div className="text-sm text-gray-500">Vocabulary</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{feedback.fluency?.score}</div>
                <div className="text-sm text-gray-500">Fluency</div>
              </div>
            </div>

            {/* Encouragement */}
            {feedback.encouragement && (
              <div className="p-4 bg-green-50 rounded-xl mb-4">
                <p className="text-green-700">🎉 {feedback.encouragement}</p>
              </div>
            )}

            {/* Grammar Errors */}
            {feedback.grammar?.errors?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Grammar Issues:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {feedback.grammar.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improved Answer */}
            {feedback.improved_answer && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-700 mb-2">💡 Improved Answer:</h4>
                <p className="text-blue-600">{feedback.improved_answer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
