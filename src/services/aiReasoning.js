/**
 * VANII Core AI Reasoning Engine (Jarvis 6-Layer Architecture)
 * Fully aligned with Next-Generation Blueprint & AI Life Companion Capabilities:
 * 1. 3D Embodied Avatar & Viseme Lip-Syncing Expression Controller.
 * 2. Home Assistant Native MCP & Context-Aware IoT Scene Automation ("Mujhe neend aa rahi hai").
 * 3. Multi-Agent Delegation: Asynchronous background sub-agent workers without voice blocking.
 * 4. Sleep-Phase Memory Consolidation & Ambient Acoustic Classification.
 * 5. Speaker Biometrics (Sim >= 0.78), Muted Observer, and Mem0 Cognitive Hierarchy.
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
import { speakerBiometricsInstance } from './speakerBiometrics';
import { proactiveDaemonInstance } from './proactiveHeartbeatDaemon';
import { langMemEngineInstance } from './langMemReflectionEngine';
import { edgeFailoverInstance } from './edgeFailoverWatchdog';
import { rrfEngineInstance } from './reciprocalRankFusion';
import { avatarLipSyncInstance } from './avatarLipSyncEngine';
import { homeAssistantInstance } from './homeAssistantMCP';
import { multiAgentDelegationInstance } from './multiAgentDelegationEngine';
import { sleepConsolidationInstance } from './sleepConsolidationEngine';

export class AIReasoningEngine {
  constructor() {
    this.isMutedObserver = false;
  }

  async generateResponse(userInput, acousticMetrics, persona = 'ananya', language = 'hi') {
    const startTime = Date.now();
    const isFemale = persona === 'ananya';
    const queryText = (userInput || 'Namaste').trim();
    const emotionState = acousticMetrics?.emotion || 'Calm / Neutral';
    const emotionConfidence = acousticMetrics?.confidence ? `${Math.round(acousticMetrics.confidence * 100)}%` : '85%';

    const qLower = queryText.toLowerCase().replace(/[\?\.\!\,]/g, '').trim();

    // Set Avatar Micro-Expression
    avatarLipSyncInstance.setExpression(emotionState);

    // 0. Speaker Identification & Biometrics Gating (Sim >= 0.78)
    const speakerAuth = speakerBiometricsInstance.verifySpeaker(acousticMetrics);
    if (!speakerAuth.isAuthorized && acousticMetrics?.energyRMS > 0.15) {
      return {
        isCrisis: false,
        responseText: '',
        emotionIntent: 'Calm / Neutral',
        latencyMs: Date.now() - startTime,
        rejectedAsBackgroundChatter: true,
      };
    }

    // 0.1 Muted Observer Mode Handling ("be quiet", "stop talking", "shant raho", "mute yourself")
    if (
      qLower === 'be quiet' ||
      qLower === 'stop talking' ||
      qLower === 'shant raho' ||
      qLower === 'शांत रहो' ||
      qLower === 'chup raho' ||
      qLower === 'चुप रहो' ||
      qLower === 'mute yourself' ||
      qLower === 'mute ho jao'
    ) {
      this.isMutedObserver = true;
      proactiveDaemonInstance.setMutedObserver(true);
      dialogueStateInstance.setPlaybackStatus('stopped');
      directStreamingInstance.pauseStream();
      return {
        isCrisis: false,
        responseText: isFemale ? 'जी राज, मैं म्यूटेड आब्जर्वर मोड में हूँ।' : 'जी राज, म्यूट मोड सक्रिय है।',
        emotionIntent: 'Calm / Neutral',
        latencyMs: Date.now() - startTime,
        isMutedObserver: true,
      };
    }

    // 0.2 Unmute / Wake from Muted Observer Mode
    if (
      qLower === 'resume speaking' ||
      qLower === 'start talking' ||
      qLower === 'unmute' ||
      qLower === 'boliye' ||
      qLower === 'बोलिए' ||
      qLower === 'baat karo' ||
      qLower === 'बात करो'
    ) {
      this.isMutedObserver = false;
      proactiveDaemonInstance.setMutedObserver(false);
      const ack = isFemale ? 'जी राज, ऑडियो चैनल पुनः सक्रिय है। आज्ञा दीजिए।' : 'जी हुज़ूर राज, मैं उपस्थित हूँ। कहिए।';
      return {
        isCrisis: false,
        responseText: ack,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
      };
    }

    if (this.isMutedObserver) {
      mem0EngineInstance.addMemory(`Silent observation: "${queryText}"`, 'observation');
      return { isCrisis: false, responseText: '', emotionIntent: 'Calm / Neutral', latencyMs: Date.now() - startTime };
    }

    // 0.3 Direct Human Callout Replies (Sub-5ms Bypass)
    const calloutResponse = this._getHumanCalloutReply(qLower, isFemale);
    if (calloutResponse) {
      dialogueStateInstance.recordTurn(queryText, calloutResponse);
      mem0EngineInstance.addMemory(`Raj called: "${queryText}"`, 'interaction');
      langMemEngineInstance.logTurn(queryText, calloutResponse, 'positive');
      return {
        isCrisis: false,
        responseText: calloutResponse,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
      };
    }

    // 0.4 Home Assistant Context-Aware Automation (e.g. "Mujhe neend aa rahi hai", "AC thanda karo", "Movie mode")
    const homeScene = homeAssistantInstance.evaluateContextScene(qLower);
    if (homeScene) {
      dialogueStateInstance.recordTurn(queryText, homeScene.spokenFeedback);
      mem0EngineInstance.addMemory(`Raj activated home scene: ${homeScene.sceneActivated}`, 'behavior');
      return {
        isCrisis: false,
        responseText: homeScene.spokenFeedback,
        emotionIntent: 'Calm / Neutral',
        latencyMs: Date.now() - startTime,
        toolExecuted: 'home_assistant_mcp',
      };
    }

    // 0.5 Multi-Agent Background Delegation (e.g. "Research karke report banao", "Sub-agent ko task do")
    if (
      qLower.includes('research karke') ||
      qLower.includes('report banao') ||
      qLower.includes('sub-agent') ||
      qLower.includes('background me task') ||
      qLower.includes('deep analysis karo')
    ) {
      const delegationResult = multiAgentDelegationInstance.delegateTask(queryText, 'Autonomous_Research_SubAgent');
      dialogueStateInstance.recordTurn(queryText, delegationResult.spokenAck);
      return {
        isCrisis: false,
        responseText: delegationResult.spokenAck,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
        toolExecuted: 'multi_agent_delegation',
      };
    }

    // 0.6 Short-Term State Tracking: Elliptical Turn Resolution ("chalu karo", "gana play karo", "pause karo", "dusra gana")
    const favoriteMusicPref = mem0EngineInstance.getFavoriteMusicPreference();
    const ellipticalRes = dialogueStateInstance.resolveEllipticalTurn(qLower, favoriteMusicPref);
    if (ellipticalRes.isElliptical) {
      if (ellipticalRes.action === 'PAUSE_PLAYBACK') {
        directStreamingInstance.pauseStream();
        const spoken = isFemale ? 'जी राज, मैंने गाना रोक दिया है।' : 'जी हुज़ूर राज जी, गाना पॉज़ कर दिया गया है।';
        dialogueStateInstance.recordTurn(queryText, spoken);
        return { isCrisis: false, responseText: spoken, emotionIntent: 'Calm / Neutral', latencyMs: Date.now() - startTime };
      }

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
      langMemEngineInstance.logTurn(queryText, spoken, 'positive');

      return {
        isCrisis: false,
        responseText: spoken,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
        toolExecuted: 'direct_media_stream',
      };
    }

    // 0.7 Strict Deterministic Tools (Direct YouTube Stream, WhatsApp, Weather, Time, Tools)
    const fastLocalActionResult = await this._handleStrictLocalIntent(qLower, isFemale);
    if (fastLocalActionResult) {
      const sanitizedResponse = guardrailsEngineInstance.evaluateOutputRails(fastLocalActionResult.spokenText);
      dialogueStateInstance.recordTurn(queryText, sanitizedResponse);
      mem0EngineInstance.addMemory(`Raj commanded action: ${fastLocalActionResult.toolName}`, 'behavior');
      langMemEngineInstance.logTurn(queryText, sanitizedResponse, 'positive');

      return {
        isCrisis: false,
        responseText: sanitizedResponse,
        emotionIntent: 'Joy / Enthusiasm',
        latencyMs: Date.now() - startTime,
        toolExecuted: fastLocalActionResult.toolName,
      };
    }

    // 0.8 Polymorphic Persona Intent Classifier
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

    // 2. LAYER 4: Mem0 Cognitive Memory Context + Sleep Consolidation + LangMem
    const mem0Context = mem0EngineInstance.getAffectiveSystemContext(
      dialogueStateInstance.activeMediaEntity,
      dialogueStateInstance.playbackStatus
    );
    const sleepInsights = sleepConsolidationInstance.getConsolidatedSummary();
    const proceduralContext = langMemEngineInstance.getReflectedInstructions();
    const unifiedSystemPromptAddon = `${mem0Context}\n\n[OVERNIGHT CONSOLIDATED INSIGHTS]\n${sleepInsights}\n\n[LANGMEM PROCEDURAL GUIDELINES]\n${proceduralContext}`;

    // 3. LAYER 1: Cloud Gemini Multimodal Live API with Affective Context
    let geminiResult = await fetchGeminiResponse(
      queryText,
      persona,
      language,
      emotionState,
      emotionConfidence,
      unifiedSystemPromptAddon
    );

    let finalResponse = '';
    if (geminiResult && geminiResult.trim().length > 0) {
      finalResponse = geminiResult;
    } else {
      finalResponse = isFemale
        ? 'हाँ राज, मैं सुन रही हूँ। बताइए क्या बात है?'
        : 'जी राज, मैं उपस्थित हूँ। कहिए क्या सेवा करूँ?';
    }

    // 4. LAYER 5: Colang 2.0 Output Guardrails Sanitization
    const sanitizedOutput = guardrailsEngineInstance.evaluateOutputRails(finalResponse);

    // 5. Update Dialogue State and Long-Term Memory
    dialogueStateInstance.recordTurn(queryText, sanitizedOutput);
    memoryStoreInstance.processUserInput(queryText, emotionState);
    langMemEngineInstance.logTurn(queryText, sanitizedOutput, 'neutral');

    return {
      isCrisis: false,
      responseText: sanitizedOutput,
      emotionIntent: emotionState,
      latencyMs: Date.now() - startTime,
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
    // 1. Explicit Direct Media Stream Command
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

    // 6. Explicit Memory Update Intent
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
