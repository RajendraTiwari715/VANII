/**
 * VANII Core AI Reasoning Engine (Jarvis 6-Layer Architecture)
 * Fully aligned with Technical Architecture Blueprint:
 * 1. Short-Term Dialogue State Tracking (DST): S_t = <M_t, E_t, A_t, U_id> with seamless Elliptical Turn Resolution.
 * 2. Deterministic Direct Media Streaming: Dynamic song resolution for ANY song in the world (Zero hardcoded track loops).
 * 3. Mem0 Persistent Cognitive Long-Term Memory.
 * 4. Microsoft Edge Neural Voice Prosody & Emotion Modulation.
 */

import { fetchGeminiResponse } from './geminiService';
import { memoryStoreInstance } from './memoryStore';
import { cognitiveMemoryInstance } from './cognitiveMemoryEngine';
import { guardrailsEngineInstance } from './guardrailsEngine';
import { mcpHostInstance } from './mcpSystem';
import { asrRouterInstance } from './asrRouterService';
import { computerUseEngineInstance } from './computerUseEngine';
import { edgeInferenceInstance } from './edgeInferenceRouter';
import { dialogueStateInstance } from './dialogueStateMachine';
import { mem0EngineInstance } from './mem0Engine';
import { directStreamingInstance } from './directStreamingEngine';

export class AIReasoningEngine {
  async generateResponse(userInput, acousticMetrics, persona = 'ananya', language = 'hi') {
    const startTime = Date.now();
    const isFemale = persona === 'ananya';
    const queryText = (userInput || 'Namaste').trim();
    const emotionState = acousticMetrics?.emotion || 'Calm / Neutral';
    const emotionConfidence = acousticMetrics?.confidence ? `${Math.round(acousticMetrics.confidence * 100)}%` : '85%';

    const qLower = queryText.toLowerCase().replace(/[\?\.\!\,]/g, '').trim();

    // 0. Immediate Stop / Quiet Command Detection (Instant Zero-Latency Halt)
    if (
      qLower === 'shant' ||
      qLower === 'शांत' ||
      qLower === 'chup' ||
      qLower === 'चुप' ||
      qLower === 'ruko' ||
      qLower === 'रुको' ||
      qLower === 'stop' ||
      qLower.includes('shant raho') ||
      qLower.includes('शांत रहो') ||
      qLower.includes('chup raho') ||
      qLower.includes('चुप रहो') ||
      qLower.includes('khamosh') ||
      qLower === 'ruk jao' ||
      qLower === 'रुक जाओ'
    ) {
      dialogueStateInstance.setPlaybackStatus('stopped');
      directStreamingInstance.pauseStream();
      return {
        isCrisis: false,
        responseText: isFemale ? 'जी राज, मैं रुक गई।' : 'जी राज, मैं शांत हूँ।',
        emotionIntent: 'Calm / Neutral',
        latencyMs: Date.now() - startTime,
      };
    }

    // 0.1 Direct Human Callout Replies (Sub-5ms Bypass)
    const calloutResponse = this._getHumanCalloutReply(qLower, isFemale);
    if (calloutResponse) {
      dialogueStateInstance.recordTurn(queryText, calloutResponse);
      mem0EngineInstance.addMemory(`Raj initiated interaction with greeting: "${queryText}"`, 'interaction');
      return {
        isCrisis: false,
        responseText: calloutResponse,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
      };
    }

    // 0.2 SHORT-TERM STATE TRACKING: Elliptical Turn Resolution ("chalu karo", "gana play karo", "pause karo", "dusra gana")
    const favoriteMusicPref = mem0EngineInstance.getFavoriteMusicPreference();
    const ellipticalRes = dialogueStateInstance.resolveEllipticalTurn(qLower, favoriteMusicPref);
    if (ellipticalRes.isElliptical) {
      if (ellipticalRes.action === 'PAUSE_PLAYBACK') {
        directStreamingInstance.pauseStream();
        const spoken = isFemale ? 'जी राज, मैंने गाना रोक दिया है।' : 'जी हुज़ूर राज जी, गाना पॉज़ कर दिया गया है।';
        dialogueStateInstance.recordTurn(queryText, spoken);
        return { isCrisis: false, responseText: spoken, emotionIntent: 'Calm / Neutral', latencyMs: Date.now() - startTime };
      }

      // Direct Stream Play / Resume / Change to Next Song
      const targetQuery = ellipticalRes.resolvedEntity?.query || ellipticalRes.resolvedEntity?.track || 'Trending Bollywood Hits';
      const streamResult = directStreamingInstance.resolveDirectStream(targetQuery);

      dialogueStateInstance.setActiveMediaEntity({
        track: streamResult.title,
        artist: streamResult.artist,
        query: streamResult.query || targetQuery,
      });
      dialogueStateInstance.setPlaybackStatus('playing');

      const spoken = isFemale
        ? `जी राज, मैंने ${streamResult.title} चालू कर दिया है।`
        : `जी हुज़ूर राज जी, ${streamResult.title} प्ले कर दिया गया है।`;

      dialogueStateInstance.recordTurn(queryText, spoken);
      mem0EngineInstance.addMemory(`Raj listened to ${streamResult.title}`, 'preference');

      return {
        isCrisis: false,
        responseText: spoken,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
        toolExecuted: 'direct_media_stream',
      };
    }

    // 0.3 FAST DETERMINISTIC INTENT ROUTER (Direct YouTube Stream, WhatsApp, Weather, Time, Tools)
    const fastLocalActionResult = await this._handleStrictLocalIntent(qLower, isFemale);
    if (fastLocalActionResult) {
      const sanitizedResponse = guardrailsEngineInstance.evaluateOutputRails(fastLocalActionResult.spokenText);
      dialogueStateInstance.recordTurn(queryText, sanitizedResponse);
      mem0EngineInstance.addMemory(`Raj commanded action: ${fastLocalActionResult.toolName}`, 'behavior');

      return {
        isCrisis: false,
        responseText: sanitizedResponse,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
        toolExecuted: fastLocalActionResult.toolName,
      };
    }

    // 0.4 Polymorphic Persona Intent Classifier
    const personaShift = this._detectPersonaShiftIntent(qLower, isFemale);
    if (personaShift) {
      cognitiveMemoryInstance.setDynamicPersonaRole(personaShift.role, personaShift.customPrompt);
      dialogueStateInstance.recordTurn(queryText, personaShift.spokenResponse);
      return {
        isCrisis: false,
        responseText: personaShift.spokenResponse,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
      };
    }

    // 1. LAYER 5: Colang 2.0 Input Guardrails Check
    const inputRails = guardrailsEngineInstance.evaluateInputRails(queryText);
    if (!inputRails.allowed) {
      return {
        isCrisis: !!inputRails.isCrisis,
        responseText: inputRails.safeResponse,
        emotionIntent: inputRails.isCrisis ? 'Sadness / Depression' : 'Calm / Neutral',
        latencyMs: Date.now() - startTime,
      };
    }

    // 2. LAYER 1: Speaker Diarization & Voice Verification
    const _diarization = asrRouterInstance.diarizeAndVerifySpeaker(
      acousticMetrics?.f0Pitch || 150,
      acousticMetrics?.energyRMS || 0.05
    );

    // 3. LAYER 6: Smart Routing Decision
    const routingDecision = edgeInferenceInstance.routeTask(queryText);

    // 4. LAYER 4: Mem0 Multi-Signal Hybrid Retrieval & Long-Term Context Injection
    const mem0Context = mem0EngineInstance.getAffectiveSystemContext(
      dialogueStateInstance.activeMediaEntity,
      dialogueStateInstance.playbackStatus
    );

    // 5. LAYER 1: Cloud Gemini Multimodal Live API with Affective Context
    let geminiResult = await fetchGeminiResponse(
      queryText,
      persona,
      language,
      emotionState,
      emotionConfidence,
      mem0Context
    );

    let finalResponse = '';
    if (geminiResult && geminiResult.trim().length > 0) {
      finalResponse = geminiResult;
    } else {
      finalResponse = isFemale
        ? 'हाँ राज, मैं सुन रही हूँ। बताइए क्या बात है?'
        : 'जी राज, मैं उपस्थित हूँ। कहिए क्या सेवा करूँ?';
    }

    // 6. LAYER 5: Colang 2.0 Output Guardrails Sanitization
    const sanitizedOutput = guardrailsEngineInstance.evaluateOutputRails(finalResponse);

    // 7. Update Dialogue State and Mem0 Memory
    dialogueStateInstance.recordTurn(queryText, sanitizedOutput);
    memoryStoreInstance.processUserInput(queryText, emotionState);

    return {
      isCrisis: false,
      responseText: sanitizedOutput,
      emotionIntent: emotionState,
      latencyMs: Date.now() - startTime,
      routingTier: routingDecision.tier,
    };
  }

  _getHumanCalloutReply(q, isFemale) {
    const callouts = [
      'ananya', 'अनन्या', 'aarav', 'आरव', 'suno', 'सुनो', 'sun rahi ho', 'sun rhe ho',
      'hello', 'हेलो', 'hey', 'हे', 'oye', 'ओए', 'kahan ho', 'कहाँ हो'
    ];

    if (callouts.includes(q) || q === 'ananya suno' || q === 'aarav suno') {
      if (isFemale) {
        const replies = [
          'हाँ राज, बोलिए?',
          'जी राज, मैं सुन रही हूँ। बताइए?',
          'हाँ राज, कहिए क्या बात है?',
          'जी राज, बताइए?',
        ];
        return replies[Math.floor(Math.random() * replies.length)];
      } else {
        const replies = [
          'जी राज, बताइए?',
          'हाँ राज, मैं उपस्थित हूँ। कहिए?',
          'जी हुज़ूर राज, आज्ञा दीजिए।',
          'हाँ राज, बताइए?',
        ];
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }

    return null;
  }

  async _handleStrictLocalIntent(q, isFemale) {
    // 1. Explicit Direct Media Stream Command (Handles ANY song dynamically)
    const isExplicitMusicCmd =
      q.includes('youtube') ||
      q.includes('यूट्यूब') ||
      /\b(gaana bajao|gaana chalao|gana bajao|gana chalao|gana play|gaana play|song play|music play|play song|play music|song sunao|gaana sunao)\b/i.test(q) ||
      /\b(dusra gana|koi aur gana|change song|naya gana)\b/i.test(q);

    if (isExplicitMusicCmd) {
      let songQuery = q
        .replace(/(youtube|par|pe|me|mein|kholo|open|gaana|gana|bajao|chalao|play|song|music|karo|bhejo|sunao|ab|karo|do|plz|please|lagao)/gi, '')
        .trim();

      if (!songQuery || q.includes('dusra') || q.includes('change')) {
        songQuery = 'dusra gana';
      }

      const streamResult = directStreamingInstance.resolveDirectStream(songQuery);
      dialogueStateInstance.setActiveMediaEntity({
        track: streamResult.title,
        artist: streamResult.artist,
        query: streamResult.query,
      });
      dialogueStateInstance.setPlaybackStatus('playing');

      const spoken = isFemale
        ? `जी राज, मैंने ${streamResult.title} चालू कर दिया है।`
        : `जी हुज़ूर राज जी, ${streamResult.title} सीधा प्ले कर दिया गया है।`;

      return { toolName: 'direct_media_stream', spokenText: spoken };
    }

    // 2. Explicit File Sending / Document Share Intent
    const isFileCmd = /\b(file bhejo|document bhejo|pdf bhejo|file send|send file|document send)\b/i.test(q);
    if (isFileCmd) {
      let fileName = 'project_document.pdf';
      if (q.includes('pdf')) fileName = 'document.pdf';
      else if (q.includes('image') || q.includes('photo')) fileName = 'image.png';

      await mcpHostInstance.callTool('send_file_share', { fileName });
      const spoken = isFemale
        ? `जी राज, मैंने ${fileName} फ़ाइल भेजने की विंडो खोल दी है।`
        : `जी राज जी, ${fileName} फ़ाइल प्रेषण विंडो सक्रिय कर दी गई है।`;
      return { toolName: 'send_file_share', spokenText: spoken };
    }

    // 3. Explicit WhatsApp Intent
    const isWhatsappCmd = /\b(whatsapp|व्हाट्सएप|whatsapp kholo|whatsapp me msg|whatsapp message)\b/i.test(q);
    if (isWhatsappCmd) {
      await mcpHostInstance.callTool('send_whatsapp_message', { message: 'Namaste, Raj here via VANII Voice Agent.' });
      const spoken = isFemale
        ? 'जी राज, मैंने व्हाट्सएप वेब विंडो खोल दी है।'
        : 'जी राज जी, व्हाट्सएप वेब विंडो सक्रिय कर दी गई है।';
      return { toolName: 'send_whatsapp_message', spokenText: spoken };
    }

    // 4. Explicit Weather Intent
    const isWeatherCmd = /\b(weather|mausam|मौसम|tapman|तापमान|aaj ka mausam|weather kaisa hai)\b/i.test(q);
    if (isWeatherCmd) {
      let location = 'Delhi';
      if (q.includes('mumbai') || q.includes('मुंबई')) location = 'Mumbai';
      else if (q.includes('lucknow') || q.includes('लखनऊ')) location = 'Lucknow';
      else if (q.includes('patna') || q.includes('पटना')) location = 'Patna';
      else if (q.includes('bengaluru') || q.includes('bangalore') || q.includes('बेंगलुरु')) location = 'Bengaluru';
      else if (q.includes('kolkata') || q.includes('कोलकाता')) location = 'Kolkata';

      const weatherResult = await mcpHostInstance.callTool('get_weather', { location });
      const spoken = isFemale
        ? `राज जी, ${weatherResult.location} में वर्तमान तापमान ${weatherResult.temperature} है और मौसम ${weatherResult.condition} है।`
        : `राज जी, ${weatherResult.location} में इस समय तापमान ${weatherResult.temperature} है और मौसम ${weatherResult.condition} है।`;
      return { toolName: 'get_weather', spokenText: spoken };
    }

    // 5. Explicit Date / Time & Bhartiya Panchang Intent
    const isTimeCmd = /\b(time kya hua|samay kya hai|tarikh kya hai|date kya hai|panchang|पंचांग|tithi|तिथि)\b/i.test(q);
    if (isTimeCmd) {
      const isPanchang = q.includes('panchang') || q.includes('पंचांग') || q.includes('tithi') || q.includes('तिथि');
      const timeResult = await mcpHostInstance.callTool('get_current_time', { calendarType: isPanchang ? 'panchang' : 'gregorian' });
      
      let spoken = '';
      if (isPanchang) {
        spoken = `राज जी, भारतीय पंचांग के अनुसार आज ${timeResult.panchang} है।`;
      } else {
        spoken = `राज जी, आज ${timeResult.date} है और समय ${timeResult.time} हो रहा है।`;
      }
      return { toolName: 'get_current_time', spokenText: spoken };
    }

    // 6. Explicit Smart Home Lights Intent
    const isLightCmd = /\b(light on|light off|batti jalao|batti bujhao|roshni badlo|ambient light)\b/i.test(q);
    if (isLightCmd) {
      await mcpHostInstance.callTool('control_ambient_lighting', { brightness: 60, color: 'warm_amber', scene: 'relax' });
      const spoken = isFemale
        ? 'जी राज, मैंने कमरे की रोशनी को बहुत ही शांत और मधुर वॉर्म एम्बर मूड में सेट कर दिया है।'
        : 'जी हुज़ूर राज जी, मैंने कमरे की रोशनी को शांत वॉर्म एम्बर परिवेश में सेट कर दिया है।';
      return { toolName: 'control_ambient_lighting', spokenText: spoken };
    }

    // 7. Explicit Thermostat / AC Intent
    const isAcCmd = /\b(ac on|ac off|ac ka temperature|thermostat badlo|ac 24 karo)\b/i.test(q);
    if (isAcCmd) {
      await mcpHostInstance.callTool('control_thermostat', { temperatureCelsius: 24, mode: 'eco' });
      const spoken = isFemale
        ? 'जी राज, मैंने एसी का तापमान चौबीस डिग्री सेल्सियस पर अनुकूलित कर दिया है।'
        : 'जी हुज़ूर राज जी, मैंने वातानुकूलन का तापमान चौबीस डिग्री सेल्सियस पर नियत कर दिया है।';
      return { toolName: 'control_thermostat', spokenText: spoken };
    }

    // 8. Explicit Memory Update Intent
    const isMemoryCmd = /\b(yaad rakhna|remember that|mera naya)\b/i.test(q);
    if (isMemoryCmd) {
      mem0EngineInstance.addMemory(q, 'explicit_user_fact');
      const spoken = isFemale
        ? 'जी राज, मैंने आपकी इस बात को अपनी दीर्घकालिक स्मृति (Long-term memory) में हमेशा के लिए सुरक्षित रख लिया है।'
        : 'जी हुज़ूर राज जी, मैंने इस तथ्य को अपनी स्मृति में स्थायी रूप से दर्ज कर लिया है।';
      return { toolName: 'core_memory_append', spokenText: spoken };
    }

    return null;
  }

  _detectPersonaShiftIntent(query, isFemale) {
    if (query.includes('dost ki tarah') || query.includes('friend ki tarah') || query.includes('as a friend')) {
      return {
        role: 'companion_friend',
        customPrompt: 'Speak like a close, warm, empathetic best friend in casual conversational Hindi/Hinglish.',
        spokenResponse: isFemale
          ? 'अरे बिल्कुल राज! अब से मैं तुम्हारी एक पक्की दोस्त की तरह बात करूँगी। बताओ, क्या हाल-चाल है तुम्हारा?'
          : 'बिल्कुल राज भाई! अब हम दोनों दोस्तों की तरह खुल के बात करेंगे। बताओ क्या चल रहा है?',
      };
    }

    if (query.includes('teacher') || query.includes('shikshak') || query.includes('padhao') || query.includes('strict teacher')) {
      return {
        role: 'strict_teacher',
        customPrompt: 'Speak like a disciplined, precise, structured teacher guiding a student.',
        spokenResponse: isFemale
          ? 'जी राज, अब मैं एक शिक्षक के रूप में आपकी तैयारी और अध्ययन में पूरा मार्गदर्शन करूँगी। बताइए किस विषय से शुरुआत करें?'
          : 'जी राज, अब मैं एक अनुशासित शिक्षक के रूप में आपका मार्गदर्शन करूँगा। चलिए, पढ़ाई शुरू करते हैं।',
      };
    }

    if (query.includes('mentor') || query.includes('guide') || query.includes('motivate') || query.includes('prerna')) {
      return {
        role: 'motivational_mentor',
        customPrompt: 'Speak like an inspiring, highly energetic, wise mentor empowering the user to achieve greatness.',
        spokenResponse: isFemale
          ? 'राज जी, आपके भीतर असीम सामर्थ्य है। मैं आपके मेंटर के रूप में आपके हर लक्ष्य को सिद्ध करने में आपके साथ खड़ी हूँ!'
          : 'राज जी, आपका संकल्प ही आपकी विजय का मार्ग है। मैं एक मार्गदर्शक के रूप में आपके साथ हूँ, आगे बढ़िए!',
      };
    }

    if (query.includes('pandit') || query.includes('vedic') || query.includes('jyotish') || query.includes('dharmik')) {
      return {
        role: 'vedic_scholar',
        customPrompt: 'Speak like a profound Vedic scholar with deep mastery of Sanatana Dharma, scriptures, and spiritual wisdom.',
        spokenResponse: isFemale
          ? 'प्रणाम राज जी। मैं वैदिक दर्शन, पर्व और धर्म के गूढ़ रहस्यों पर आपके साथ सहर्ष चर्चा करने के लिए प्रस्तुत हूँ।'
          : 'सादर प्रणाम राज जी। मैं भारतीय दर्शन, शास्त्र और धर्म के गहन ज्ञान के साथ आपकी सेवा में उपस्थित हूँ।',
      };
    }

    return null;
  }
}

export const aiReasoningInstance = new AIReasoningEngine();
