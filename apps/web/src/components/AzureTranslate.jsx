import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

// Global cache to prevent redundant API calls across component remounts
// Structure: { "hi": { "Hello world": "नमस्ते दुनिया" } }
const translationCache = {};

export function AzureTranslate({ text, className = "" }) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // STRICT RULE: If language is English, do not hit the API.
    if (language === 'en' || !text) {
      setTranslatedText(text);
      return;
    }

    // Check memory cache first
    if (!translationCache[language]) {
      translationCache[language] = {};
    }

    if (translationCache[language][text]) {
      setTranslatedText(translationCache[language][text]);
      return;
    }

    // Check sessionStorage cache
    const sessionKey = `translate_${language}_${text.substring(0, 50)}`;
    const stored = sessionStorage.getItem(sessionKey);
    if (stored) {
      translationCache[language][text] = stored; // populate memory cache
      setTranslatedText(stored);
      return;
    }

    // If not cached, fetch from Azure API
    const fetchTranslation = async () => {
      try {
        const res = await api.translateDynamicText([text], language);
        if (res && res.translations && res.translations.length > 0 && isMounted.current) {
          const finalTranslation = res.translations[0];
          setTranslatedText(finalTranslation);
          
          // Save to caches
          translationCache[language][text] = finalTranslation;
          sessionStorage.setItem(sessionKey, finalTranslation);
        }
      } catch (err) {
        console.error("Translation error fallback to English:", err);
        if (isMounted.current) {
          setTranslatedText(text); // Fallback to English
        }
      }
    };

    fetchTranslation();
  }, [text, language]);

  return <span className={className}>{translatedText}</span>;
}

export default AzureTranslate;
