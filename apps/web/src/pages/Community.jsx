import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getCommunityMessages, sendCommunityMessage, getOnlineCount } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Generate consistent color from username
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

export default function Community() {
  const { t, speechCode } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Azure Speech-to-Text via shared hook
  const { isListening, isProcessing, isSupported, toggleListening, stopListening } = useSpeechRecognition({
    lang: speechCode || 'en-IN',
    onResult: (text) => setInput(text),
  });

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const data = await getCommunityMessages(50);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 5000);
    getOnlineCount().then(d => setOnlineCount(d.online_count || 1)).catch(() => {});
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  async function handleSend(e) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || sending) return;

    if (isListening) stopListening();
    setSending(true);
    setInput('');
    try {
      await sendCommunityMessage(msg);
      await loadMessages();
    } catch (err) {
      console.error('Send failed:', err);
      setInput(msg);
    }
    setSending(false);
  }

  function groupByDate(msgs) {
    const groups = {};
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }

  const grouped = groupByDate(messages);

  return (
    <div className="community-page">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>💬 {t('community_title') || 'Community Chat'}</h2>
          <span className="online-badge">
            <span className="online-dot"></span>
            {onlineCount} {t('community_online') || 'online'}
          </span>
        </div>
        <p className="chat-desc">{t('community_desc') || 'Connect with other farmers, share tips, and ask questions'}</p>
      </div>

      <div className="chat-messages">
        {loading && <div className="chat-loading">{t('community_loading') || 'Loading messages...'}</div>}
        {!loading && messages.length === 0 && (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <h3>{t('community_empty') || 'No messages yet'}</h3>
            <p>{t('community_emptyDesc') || 'Start the conversation!'}</p>
          </div>
        )}
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-divider"><span>{date}</span></div>
            {msgs.map(msg => {
              const isMe = user && msg.user_id === user.id;
              return (
                <div key={msg.id} className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                  {!isMe && (
                    <div className="bubble-avatar" style={{ background: hashColor(msg.user_name) }}>
                      {(msg.user_name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="bubble-content">
                    {!isMe && <div className="bubble-name" style={{ color: hashColor(msg.user_name) }}>{msg.user_name}</div>}
                    <div className="bubble-text">{msg.message}</div>
                    <div className="bubble-time">
                      {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input with Mic */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <button
          type="button"
          className={`chat-mic-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={toggleListening}
          title={isProcessing ? 'Processing...' : isListening ? 'Stop recording' : 'Voice input'}
          disabled={!user || isProcessing}
        >
          {isProcessing ? '...' : isListening ? '⏹️' : '🎤'}
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isProcessing ? 'Processing speech...' : (t('community_placeholder') || 'Type a message...')}
          maxLength={2000}
          disabled={!user}
        />
        <button type="submit" disabled={!input.trim() || sending || !user}>
          {sending ? '...' : '➤'}
        </button>
      </form>

      {(isListening || isProcessing) && (
        <div className="listening-indicator">
          <span className="listening-pulse"></span>
          {isProcessing ? 'Processing speech...' : 'Recording... Speak now'}
        </div>
      )}

      {!user && (
        <div className="login-notice">{t('community_loginRequired') || 'Please login to send messages'}</div>
      )}

      <style>{`
        .community-page {
          display: flex; flex-direction: column;
          height: calc(100vh - 130px); max-width: 800px;
          margin: 0 auto; padding: 0 1rem;
        }
        .chat-header {
          padding: 1rem 0 0.75rem; border-bottom: 1px solid var(--border, #eee);
        }
        .chat-header-info { display: flex; align-items: center; gap: 0.75rem; }
        .chat-header h2 { margin: 0; font-size: 1.3rem; color: var(--text-primary, #1a1a2e); }
        .online-badge {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.75rem; color: #43A047; font-weight: 600;
        }
        .online-dot { width: 8px; height: 8px; background: #43A047; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .chat-desc { margin: 0.25rem 0 0; font-size: 0.8rem; color: var(--text-secondary, #888); }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 1rem 0;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .chat-loading, .chat-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary, #888); }
        .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }

        .date-divider {
          display: flex; align-items: center; justify-content: center;
          margin: 1rem 0 0.5rem; position: relative;
        }
        .date-divider::before, .date-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border, #e0e0e0);
        }
        .date-divider span {
          padding: 0 0.75rem; font-size: 0.7rem; color: var(--text-secondary, #999);
          font-weight: 600; white-space: nowrap;
        }

        .chat-bubble {
          display: flex; gap: 0.5rem; max-width: 80%;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .chat-bubble.me { align-self: flex-end; flex-direction: row-reverse; }
        .chat-bubble.other { align-self: flex-start; }

        .bubble-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
        }
        .bubble-content {
          padding: 0.6rem 0.9rem; border-radius: 16px;
          max-width: 100%; word-break: break-word;
        }
        .chat-bubble.me .bubble-content {
          background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.other .bubble-content {
          background: var(--bg-secondary, #f0f0f0); color: var(--text-primary, #222);
          border-bottom-left-radius: 4px;
        }
        .bubble-name { font-size: 0.72rem; font-weight: 700; margin-bottom: 0.2rem; }
        .bubble-text { font-size: 0.88rem; line-height: 1.4; }
        .bubble-time { font-size: 0.65rem; opacity: 0.6; text-align: right; margin-top: 0.2rem; }

        .chat-input-bar {
          display: flex; gap: 0.5rem; padding: 0.75rem 0;
          border-top: 1px solid var(--border, #eee);
        }
        .chat-input-bar input {
          flex: 1; padding: 0.7rem 1rem; border: 1px solid var(--border, #ddd);
          border-radius: 24px; font-size: 0.9rem;
          background: var(--bg-secondary, #f5f5f5); color: var(--text-primary, #333);
          outline: none;
        }
        .chat-input-bar input:focus { border-color: #43A047; }
        .chat-input-bar button {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #1B5E20, #43A047);
          color: white; border: none; font-size: 1.2rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .chat-input-bar button:hover:not(:disabled) { transform: scale(1.05); }
        .chat-input-bar button:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-notice {
          text-align: center; padding: 0.5rem; font-size: 0.8rem;
          color: var(--text-secondary, #999);
        }

        .chat-mic-btn {
          width: 44px; height: 44px; border-radius: 50%;
          border: none; background: var(--bg-secondary, #f0f0f0);
          cursor: pointer; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .chat-mic-btn:hover:not(:disabled) { background: var(--green-50, #E8F5E9); }
        .chat-mic-btn.listening {
          background: #EF5350; color: white;
          animation: pulse-mic 1.5s infinite;
        }
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 83, 80, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 83, 80, 0); }
        }
        .chat-mic-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .chat-mic-btn.processing {
          background: #FF9800; color: white;
          animation: pulse-mic 1s infinite; opacity: 1;
        }

        .listening-indicator {
          display: flex; align-items: center; gap: 8px;
          justify-content: center; padding: 4px 0;
          font-size: 0.75rem; color: #EF5350; font-weight: 600;
        }
        .listening-pulse {
          width: 8px; height: 8px; background: #EF5350;
          border-radius: 50%; animation: pulse 1s infinite;
        }

        @media (max-width: 600px) {
          .community-page { height: calc(100vh - 180px); padding: 0 0.5rem; }
          .chat-bubble { max-width: 90%; }
        }
      `}</style>
    </div>
  );
}
