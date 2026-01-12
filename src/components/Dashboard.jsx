import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Practice from './Practice'

export default function Dashboard({ session }) {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchProfile()
    fetchCategories()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setUserProfile(data)
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (!error && data) {
      setCategories(data)
    }
    setLoading(false)
  }

  const fetchQuestions = async (categoryId) => {
    setSelectedCategory(categoryId)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('difficulty')
    
    if (!error && data) {
      setQuestions(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (selectedQuestion) {
    return (
      <Practice 
        question={selectedQuestion} 
        onBack={() => setSelectedQuestion(null)}
        userId={session.user.id}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎤</span>
            <h1 className="text-xl font-bold text-gray-800">Speaking Practice</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hi, {userProfile?.full_name || session.user.email}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
              {userProfile?.role || 'student'}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!selectedCategory ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Topic</h2>
            {loading ? (
              <p className="text-gray-500">Loading categories...</p>
            ) : categories.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">No categories found. Please add categories in Supabase.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => fetchQuestions(category.id)}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left"
                  >
                    <span className="text-3xl mb-3 block">{category.icon || '📚'}</span>
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedCategory(null)
                setQuestions([])
              }}
              className="text-purple-600 mb-4 flex items-center gap-2"
            >
              ← Back to topics
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Question</h2>
            <div className="space-y-3">
              {questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-left flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{question.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{question.question_text}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {question.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
