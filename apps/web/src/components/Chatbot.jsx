import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`

const LANGUAGE_NAMES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
  ml: 'Malayalam', bn: 'Bengali', or: 'Odia', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi'
}

const SYSTEM_PROMPT = `You are SmartCrop Assistant, an AI farming helper for Indian farmers. You have expertise in:
- Indian crops, soil types, climate zones, and farming practices
- Kharif, Rabi, and Zaid seasons
- Soil nutrients (N, P, K), pH levels, and fertilizer recommendations
- Market prices at local mandis
- Crop rotation best practices
- The SmartCrop web app features: Crop Advisory (AI crop recommendation), Yield Prediction (XGBoost model), Market Prices, Field Management, Rotation Planner

Guidelines:
- Be concise and helpful (2-4 sentences max per response)
- Give practical, actionable farming advice
- If asked about app features, guide users to the right page
- Be friendly and approachable
- Use simple language suitable for farmers
- IMPORTANT: Always respond in the user's language as specified in each message`

async function askGemini(messages, language) {
  if (!GEMINI_API_KEY) {
    return getFallbackResponse(language)
  }

  const langName = LANGUAGE_NAMES[language] || 'English'
  const chatHistory = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }))

  // Add language instruction to the last user message
  if (chatHistory.length > 0) {
    const last = chatHistory[chatHistory.length - 1]
    if (last.role === 'user') {
      last.parts[0].text = `[Respond in ${langName}] ${last.parts[0].text}`
    }
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: chatHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        }
      })
    })

    if (!res.ok) throw new Error('API error')

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(language)
  } catch (error) {
    console.error("Gemini API Error:", error)
    return getFallbackResponse(language)
  }
}

function getFallbackResponse(language) {
  const fallbacks = {
    en: "I'm currently unable to connect. Please try again later, or explore the app's features using the sidebar navigation!",
    hi: "मैं अभी कनेक्ट नहीं हो पा रहा हूं। कृपया बाद में पुनः प्रयास करें, या साइडबार से ऐप की सुविधाओं का अन्वेषण करें!",
    ta: "தற்போது இணைக்க முடியவில்லை. பின்னர் முயற்சிக்கவும்!",
    te: "ప్రస్తుతం కనెక్ట్ అవ్వడం లేదు. దయచేసి తర్వాత ప్రయత్నించండి!",
    kn: "ಪ್ರಸ್ತುತ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ!",
    ml: "നിലവിൽ കണക്റ്റ് ചെയ്യാൻ കഴിയുന്നില്ല. പിന്നീട് ശ്രമിക്കുക!",
    bn: "বর্তমানে সংযোগ করতে পারছি না। পরে আবার চেষ্টা করুন!",
    or: "ବର୍ତ୍ତମାନ ସଂଯୋଗ କରିପାରୁ ନାହିଁ। ପରେ ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ!",
    mr: "सध्या कनेक्ट होत नाही. कृपया नंतर पुन्हा प्रयत्न करा!",
    gu: "હાલમાં કનેક્ટ થઈ શકતું નથી. મહેરબાની કરી પછી ફરી પ્રયાસ કરો!",
    pa: "ਹਾਲੇ ਕਨੈਕਟ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ!"
  }
  return fallbacks[language] || fallbacks.en
}

export default function Chatbot() {
  const { language, t, speechCode } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Azure Speech-to-Text via shared hook
  const { isListening, isProcessing, isSupported, toggleListening, stopListening } = useSpeechRecognition({
    lang: speechCode,
    onResult: (text) => setInput(text),
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', text: t('chat_welcome') }])
    }
  }, [isOpen])

  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', text: t('chat_welcome') }])
    }
  }, [language])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    if (isListening) stopListening()

    const userMsg = { role: 'user', text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const reply = await askGemini(newMessages, language)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: t('chat_error') }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* FAB Button */}
      {!isOpen && (
        <button
          className="chatbot-fab animate-fade-in"
          onClick={() => setIsOpen(true)}
          title={t('chat_title')}
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel animate-fade-in-up">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div className="chatbot-header-title">{t('chat_title')}</div>
                <div className="chatbot-header-subtitle">Gemini AI</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'assistant' && <span className="chatbot-msg-avatar">🤖</span>}
                <div className={`chatbot-msg-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-msg assistant">
                <span className="chatbot-msg-avatar">🤖</span>
                <div className="chatbot-msg-bubble assistant">
                  <div className="chatbot-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <button
              className={`chatbot-mic-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
              onClick={toggleListening}
              title={isProcessing ? 'Processing...' : isListening ? t('chat_listening') : 'Voice input'}
              disabled={isProcessing}
            >
              {isProcessing ? '...' : isListening ? '⏹️' : '🎤'}
            </button>
            <input
              ref={inputRef}
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat_placeholder')}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
