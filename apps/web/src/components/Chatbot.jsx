import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

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
          className="fixed bottom-20 md:bottom-8 right-5 z-[100] w-14 h-14 bg-primary hover:bg-primary-container text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:scale-105 animate-fade-in group"
          onClick={() => setIsOpen(true)}
          title={t('chat_title')}
          aria-label="Open chat"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          {/* Notification dot */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error rounded-full border-2 border-surface flex items-center justify-center">
            <span className="font-label text-[8px] text-white font-bold">1</span>
          </span>
          {/* Label tooltip */}
          <div className="absolute right-full mr-3 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Fasal Assistant
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-5 z-[100] w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-3xl shadow-2xl editorial-shadow-lg overflow-hidden animate-fade-in-scale flex flex-col" style={{ maxHeight: 'min(580px, calc(100vh - 120px))' }}>
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-white text-sm">{t('chat_title')}</h3>
                <p className="font-label text-[10px] text-white/70 uppercase tracking-wider">Gemini AI • Online</p>
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-white text-lg">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar bg-surface-container-low" style={{ minHeight: '200px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                )}
                <div className={`
                  max-w-[78%] px-4 py-2.5 text-[13px] leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-primary text-white rounded-2xl rounded-tr-md'
                    : 'bg-white text-on-surface rounded-2xl rounded-tl-md editorial-shadow'
                  }
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md editorial-shadow">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-surface-container-high/50">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-3 py-1.5">
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0
                  ${isListening ? 'bg-error text-white animate-pulse-soft' : isProcessing ? 'bg-tertiary text-white' : 'hover:bg-surface-container text-on-surface-variant/50'}
                `}
                onClick={toggleListening}
                title={isProcessing ? 'Processing...' : isListening ? t('chat_listening') : 'Voice input'}
                disabled={isProcessing}
              >
                <span className="material-symbols-outlined text-lg">
                  {isProcessing ? 'hourglass_empty' : isListening ? 'stop' : 'mic'}
                </span>
              </button>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none text-sm text-on-surface placeholder:text-on-surface-variant/40 py-2 focus:ring-0 focus:outline-none font-body"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat_placeholder')}
                disabled={isLoading}
              />
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0
                  ${input.trim() && !isLoading
                    ? 'bg-primary text-white hover:bg-primary-container'
                    : 'text-on-surface-variant/30 cursor-not-allowed'
                  }
                `}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
