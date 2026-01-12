import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA990iSYKZ79J0kd1Ro884W9o5sH85PeWM'

const genAI = new GoogleGenerativeAI(API_KEY)

export async function analyzeAnswer(question, answer, tips) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `You are an English speaking coach. Analyze this student's spoken answer.

Question: "${question}"
Student's Answer: "${answer}"
Tips for this question: "${tips}"

Please provide feedback in this JSON format:
{
  "grammar": {
    "score": (0-100),
    "errors": ["list of grammar errors"],
    "corrections": ["corrected versions"]
  },
  "vocabulary": {
    "score": (0-100),
    "feedback": "vocabulary feedback",
    "suggestions": ["better word choices"]
  },
  "fluency": {
    "score": (0-100),
    "feedback": "fluency feedback"
  },
  "pronunciation_tips": ["tips for commonly mispronounced words"],
  "overall_score": (0-100),
  "encouragement": "positive feedback message",
  "improved_answer": "a better version of their answer"
}

Return ONLY valid JSON, no markdown.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean the response
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7)
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3)
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3)
    }
    
    return JSON.parse(cleanText.trim())
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}
