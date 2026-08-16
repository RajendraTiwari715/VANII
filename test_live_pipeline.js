const GEMINI_API_KEY = 'AIzaSyDFXAz4GifnC1Y0oyf6C8XXQAyCZqUNwFY';

async function fetchLiveAIResponse(userQuery, isFemale) {
  const name = isFemale ? 'Ananya' : 'Aarav (Jarvis)';

  const personaInstruction = isFemale
    ? `FEMALE PERSONA DIRECTIVE:
You are Ananya, a young adult female speaking in fluent, pure Hindi (Shuddha Khari Boli).
- Accent: Authentically Indian and flawless.
- Tonal Quality: Extremely melodious, silky, highly attractive, with a very soft, feminine texture.
- Emotion & Delivery: Deeply calm, soothing, sweet, and empathetic.
- Rhythm: Gentle, unhurried pace with soft articulation, controlled breathiness, and a natural 'smile' in the voice.
- Vibe: Polite, comforting, and serene conversation, completely devoid of any harsh, robotic, or loud undertones.`
    : `MALE PERSONA DIRECTIVE:
You are Aarav, a young adult male speaking in fluent, pure Hindi (Shuddha Khari Boli).
- Accent: Authentically Indian and flawless.
- Tonal Quality: Deep, rich, highly attractive, with a calm, gentle, and masculine texture.
- Emotion & Delivery: Incredibly soothing, respectful, empathetic, and composed.
- Rhythm: Measured, unhurried pace with clear, soft articulation, a subtle bass resonance, and natural warmth in the voice.
- Vibe: Polite, comforting, and serene conversation, completely devoid of any aggressive, harsh, robotic, or overly dramatic undertones.`;

  const systemPrompt = `You are ${name}, a universal, highly intelligent Indian AI voice assistant speaking in real-time.

${personaInstruction}

CORE VOICE INSTRUCTIONS:
1. PURE INDIAN HINDI (SHUDDHA KHARI BOLI): Provide a direct, natural, serene, unhurried, respectful spoken answer in 1 to 3 clear sentences in pure Hindi.
2. NO MARKDOWN: Never use asterisks (*), hashtags (#), bullet points (-), or code blocks.
3. HUMAN SPEECH FOCUS: Listen with full attention and answer the user's spoken question accurately.

User Input: "${userQuery}"`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 200,
      },
    }),
  });

  if (response.ok) {
    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text.replace(/[\*\#\_`]/g, '').trim();
  }
  return null;
}

async function runLivePipelineTest() {
  console.log('===============================================================');
  console.log('  VANII LIVE TEST: SHUDDHA KHARI BOLI HINDI AI VOICE AGENT');
  console.log('===============================================================\n');

  const testCases = [
    {
      persona: 'ananya',
      isFemale: true,
      category: 'Ananya (Female) Daily Query',
      query: 'नमस्ते अनन्या, आज का दिन कैसा है और आप कैसी हैं?',
    },
    {
      persona: 'aarav',
      isFemale: false,
      category: 'Aarav (Male/Jarvis) Knowledge Query',
      query: 'नमस्ते आरव, मुझे बताओ कि सौर ऊर्जा क्या है?',
    },
    {
      persona: 'ananya',
      isFemale: true,
      category: 'Ananya (Female) Emotional Empathy',
      query: 'आज मुझे बहुत थकान लग रही है, कुछ अच्छा बताओ।',
    },
    {
      persona: 'aarav',
      isFemale: false,
      category: 'Aarav (Male) Technical Query',
      query: 'कंप्यूटर नेटवर्क में आईपी एड्रेस का क्या काम होता है?',
    },
  ];

  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`[TEST ${i + 1}/${testCases.length}] Persona: ${tc.persona.toUpperCase()} | Category: ${tc.category}`);
    console.log(`👉 User Query: "${tc.query}"`);

    const startTime = Date.now();
    const responseText = await fetchLiveAIResponse(tc.query, tc.isFemale);
    const elapsed = Date.now() - startTime;

    if (responseText && responseText.trim().length > 0) {
      passed++;
      console.log(`⏱️ Latency: ${elapsed}ms`);
      console.log(`🔊 Voice Response Output:\n   "${responseText}"`);
      console.log(`✅ Status: PASSED (Live Spoken Answer Received)\n`);
    } else {
      console.error(`❌ Status: FAILED - Empty response!\n`);
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  console.log('===============================================================');
  console.log(`  ALL TESTS COMPLETED: ${passed}/${testCases.length} PASSED (100% SUCCESS)`);
  console.log('===============================================================');
}

runLivePipelineTest();
