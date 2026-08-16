/**
 * VANII Empathic Prosodic Speech Synthesizer
 * 
 * Implements Blueprint Section 5:
 * Expressive Speech Synthesis via Rasa Dataset & Ekman Emotional Prosody Mapping
 * Zero Self-Echo Feedback Architecture with Global V8 Memory Defense
 */

import { speechRecognitionInstance } from './speechRecognitionService';

export class EmpathicSpeechSynthesizer {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentPersona = 'ananya'; // 'ananya' | 'aarav'
    this.isSpeaking = false;
    this.activeUtterance = null;
    this.safetyTimer = null;
    this.voices = [];
    this.lastSpokenText = '';

    this.onStartCallback = null;
    this.onEndCallback = null;

    this._initVoices();
    this._startChromeKeepAlive();
  }

  _initVoices() {
    if (!this.synth) return;
    const update = () => {
      this.voices = this.synth.getVoices() || [];
      if (typeof window !== 'undefined') {
        window.__vanii_voices = this.voices.map((v) => ({ name: v.name, lang: v.lang }));
      }
    };
    update();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = update;
    }
  }

  _startChromeKeepAlive() {
    if (typeof window === 'undefined') return;
    setInterval(() => {
      if (this.synth && this.synth.speaking) {
        try {
          this.synth.resume();
        } catch (e) {}
      }
    }, 800);
  }

  unmuteAudio() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.synth.resume();
      const dummy = new SpeechSynthesisUtterance(' ');
      dummy.volume = 0.01;
      this.synth.speak(dummy);
    } catch (e) {}
  }

  setPersona(persona) {
    this.currentPersona = persona;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-persona', persona);
    }
  }

  _getBestVoice() {
    if (!this.synth) return { voice: null, isHindiVoice: false };
    const allVoices = this.synth.getVoices() || this.voices || [];
    if (!allVoices.length) return { voice: null, isHindiVoice: false };

    const isAnanya = this.currentPersona === 'ananya';

    if (isAnanya) {
      // 1. Natural/Neural Hindi Female (Microsoft Swara, Google हिन्दी, Heera, Veena, Kalpana)
      const hindiFemale =
        allVoices.find(
          (v) =>
            (v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी')) &&
            (v.name.toLowerCase().includes('swara') ||
              v.name.toLowerCase().includes('heera') ||
              v.name.toLowerCase().includes('veena') ||
              v.name.toLowerCase().includes('kalpana') ||
              v.name.toLowerCase().includes('female') ||
              v.name.includes('महिला'))
        ) ||
        allVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('hi') ||
            v.lang.toLowerCase().includes('hi-in') ||
            v.lang.toLowerCase().includes('hi_in') ||
            v.name.toLowerCase().includes('hindi') ||
            v.name.includes('हिन्दी')
        );

      if (hindiFemale) return { voice: hindiFemale, isHindiVoice: true };

      // 2. Indian English Female (Microsoft Neerja, en-IN)
      const indianFemale = allVoices.find(
        (v) =>
          (v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('india')) &&
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('neerja'))
      );
      if (indianFemale) return { voice: indianFemale, isHindiVoice: false };

      // 3. Fallback female
      const fallbackFemale = allVoices.find(
        (v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira')
      );
      return { voice: fallbackFemale || allVoices[0], isHindiVoice: false };
    } else {
      // 1. Natural/Neural Hindi Male (Microsoft Madhur, Hemant, Prabhat, Google हिन्दी)
      const hindiMale =
        allVoices.find(
          (v) =>
            (v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी')) &&
            (v.name.toLowerCase().includes('madhur') ||
              v.name.toLowerCase().includes('hemant') ||
              v.name.toLowerCase().includes('prabhat') ||
              v.name.toLowerCase().includes('rishi') ||
              v.name.toLowerCase().includes('male') ||
              v.name.includes('पुरुष'))
        ) ||
        allVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('hi') ||
            v.lang.toLowerCase().includes('hi-in') ||
            v.lang.toLowerCase().includes('hi_in') ||
            v.name.toLowerCase().includes('hindi') ||
            v.name.includes('हिन्दी')
        );

      if (hindiMale) return { voice: hindiMale, isHindiVoice: true };

      // 2. Indian English Male (Microsoft Ravi, en-IN)
      const indianMale = allVoices.find(
        (v) =>
          (v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('india')) &&
          (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('ravi'))
      );
      if (indianMale) return { voice: indianMale, isHindiVoice: false };

      // 3. Fallback male
      const fallbackMale = allVoices.find(
        (v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david')
      );
      return { voice: fallbackMale || allVoices[0], isHindiVoice: false };
    }
  }

  cancel() {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    this.isSpeaking = false;
    this.activeUtterance = null;
    if (typeof window !== 'undefined') window.__vanii_utterance = null;

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    speechRecognitionInstance.resumeListening();
    if (this.onEndCallback) this.onEndCallback();
  }

  speak(text, emotionState = 'Calm / Neutral') {
    if (!text || typeof text !== 'string' || !this.synth) {
      this.isSpeaking = false;
      speechRecognitionInstance.resumeListening();
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    // 1. Strict Half-Duplex: Pause Mic Immediately
    speechRecognitionInstance.pauseListening();

    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }

    try {
      this.synth.cancel();
      this.synth.resume();
    } catch (e) {}

    const cleanText = this._normalizeIndianHindiText(text);
    if (!cleanText) {
      this.isSpeaking = false;
      speechRecognitionInstance.resumeListening();
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    this.lastSpokenText = cleanText;

    const { voice, isHindiVoice } = this._getBestVoice();

    let spokenContent = cleanText;
    if (!isHindiVoice && this._containsDevanagari(cleanText)) {
      spokenContent = this._toFluentIndianPhonetics(cleanText);
    }

    // 2. Strong Memory Reference to defeat V8 Garbage Collection
    const utterance = new SpeechSynthesisUtterance(spokenContent);
    this.activeUtterance = utterance;
    if (typeof window !== 'undefined') {
      window.__vanii_utterance = utterance;
    }

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || (isHindiVoice ? 'hi-IN' : 'en-US');
    } else {
      utterance.lang = isHindiVoice ? 'hi-IN' : 'en-US';
    }

    const isAnanya = this.currentPersona === 'ananya';

    /**
     * Rasa Expressive Emotion Prosodic Profiles (Ekman Emotional Taxonomy):
     */
    if (isAnanya) {
      switch (emotionState) {
        case 'Sadness / Depression':
        case 'Sad':
          utterance.pitch = isHindiVoice ? 1.01 : 1.12;
          utterance.rate = 0.84;
          utterance.volume = 0.90;
          break;
        case 'Joy / Enthusiasm':
        case 'Happy':
          utterance.pitch = isHindiVoice ? 1.08 : 1.22;
          utterance.rate = 0.91;
          utterance.volume = 1.0;
          break;
        case 'Angry':
        case 'Disgust':
          utterance.pitch = isHindiVoice ? 0.98 : 1.05;
          utterance.rate = 0.86;
          utterance.volume = 0.95;
          break;
        case 'Fear':
          utterance.pitch = isHindiVoice ? 1.03 : 1.15;
          utterance.rate = 0.86;
          utterance.volume = 0.92;
          break;
        case 'Surprise':
          utterance.pitch = isHindiVoice ? 1.09 : 1.24;
          utterance.rate = 0.90;
          utterance.volume = 1.0;
          break;
        default: // Calm / Neutral / Melodious
          utterance.pitch = isHindiVoice ? 1.05 : 1.16;
          utterance.rate = 0.88;
          utterance.volume = 1.0;
          break;
      }
    } else {
      switch (emotionState) {
        case 'Sadness / Depression':
        case 'Sad':
          utterance.pitch = isHindiVoice ? 0.85 : 0.82;
          utterance.rate = 0.86;
          utterance.volume = 0.90;
          break;
        case 'Joy / Enthusiasm':
        case 'Happy':
          utterance.pitch = isHindiVoice ? 0.94 : 0.92;
          utterance.rate = 0.95;
          utterance.volume = 1.0;
          break;
        case 'Angry':
        case 'Disgust':
          utterance.pitch = isHindiVoice ? 0.88 : 0.84;
          utterance.rate = 0.88;
          utterance.volume = 0.96;
          break;
        case 'Fear':
          utterance.pitch = isHindiVoice ? 0.89 : 0.85;
          utterance.rate = 0.88;
          utterance.volume = 0.92;
          break;
        case 'Surprise':
          utterance.pitch = isHindiVoice ? 0.95 : 0.92;
          utterance.rate = 0.94;
          utterance.volume = 1.0;
          break;
        default: // Calm / Neutral / Resonant
          utterance.pitch = isHindiVoice ? 0.90 : 0.88;
          utterance.rate = 0.92;
          utterance.volume = 1.0;
          break;
      }
    }

    const finish = () => {
      if (this.safetyTimer) {
        clearTimeout(this.safetyTimer);
        this.safetyTimer = null;
      }
      this.isSpeaking = false;
      this.activeUtterance = null;
      if (typeof window !== 'undefined') window.__vanii_utterance = null;

      if (this.onEndCallback) this.onEndCallback();

      // Resume Speech Recognition after acoustic settling buffer
      speechRecognitionInstance.resumeListening();
    };

    utterance.onstart = () => {
      this.isSpeaking = true;
      speechRecognitionInstance.pauseListening();
      if (this.onStartCallback) this.onStartCallback();
    };

    utterance.onend = () => {
      finish();
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis error:', err);
      finish();
    };

    // Safety watchdog timer: guarantees state release
    const maxDurationMs = Math.max(3500, Math.min(25000, spokenContent.length * 140));
    this.safetyTimer = setTimeout(() => {
      finish();
    }, maxDurationMs);

    this.isSpeaking = true;
    if (this.onStartCallback) this.onStartCallback();

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis speak failed:', e);
      finish();
    }
  }

  _containsDevanagari(str) {
    return /[\u0900-\u097F]/.test(str);
  }

  _toFluentIndianPhonetics(devText) {
    const commonWords = {
      'नमस्ते': 'Namaste',
      'प्रणाम': 'Pranaam',
      'राज': 'Raj',
      'जी': 'jee',
      'हाँ': 'haan',
      'नहीं': 'nahin',
      'धन्यवाद': 'Dhanyavaad',
      'शुक्रिया': 'Shukriya',
      'कृपया': 'Kripya',
      'आप': 'Aap',
      'मैं': 'Main',
      'अनन्या': 'Ananya',
      'आरव': 'Aarav',
      'सहायता': 'Sahayata',
      'मदद': 'Madad',
      'बताइए': 'Bataiye',
      'करूँगी': 'karoongi',
      'करूँगा': 'karoonga',
      'हूँ': 'hoon',
      'है': 'hai',
      'हैं': 'hain',
      'था': 'tha',
      'थी': 'thi',
      'थे': 'the',
      'क्या': 'kya',
      'कहाँ': 'kahaan',
      'कैसे': 'kaise',
      'क्यों': 'kyun',
      'अच्छा': 'Achha',
      'बहुत': 'Bahut',
      'शान्त': 'Shaant',
      'शांत': 'Shaant',
      'रहो': 'raho',
      'चुप': 'chup',
      'उत्तर': 'Uttar',
      'प्रश्न': 'Prashn',
      'दिन': 'din',
      'सुबह': 'subah',
      'दोपहर': 'dopahar',
      'शाम': 'shaam',
      'रात': 'raat',
    };

    let text = devText;
    for (const [k, v] of Object.entries(commonWords)) {
      text = text.replace(new RegExp(k, 'g'), v);
    }

    const vowelMap = {
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
      'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri',
      'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
      'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri',
      'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '',
    };

    const consMap = {
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
      'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
      'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
      'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
      'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
      'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
      'ष': 'sh', 'स': 's', 'ह': 'h', 'क़': 'q', 'ख़': 'kh',
      'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
    };

    let result = '';
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const next = chars[i + 1];

      if (consMap[c]) {
        result += consMap[c];
        if (next && (vowelMap[next] !== undefined || next === '्')) {
          // handled
        } else if (next && consMap[next]) {
          result += 'a';
        } else if (!next || next === ' ' || next === '।' || next === '.' || next === '?' || next === '!') {
          // end
        } else {
          result += 'a';
        }
      } else if (vowelMap[c] !== undefined) {
        result += vowelMap[c];
      } else if (c === '।') {
        result += '. ';
      } else {
        result += c;
      }
    }

    return result
      .replace(/Raj\s*jee/gi, 'Raj jee')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _normalizeIndianHindiText(text) {
    if (!text) return '';
    return text
      .replace(/[\*\#\_`]/g, '')
      .replace(/([0-9]+)\s*%/g, '$1 प्रतिशत')
      .replace(/₹\s*([0-9,]+)/g, '$1 रुपये')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const speechSynthesizerInstance = new EmpathicSpeechSynthesizer();
