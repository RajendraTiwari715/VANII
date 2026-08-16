/**
 * VANII Gemini Multi-Modal Live API Service
 * Culturally Grounded, Emotionally Intelligent Multilingual Indic Voice Agent
 * Aligned with AI4Bharat Sangraha, IndicAlign, MILU & Wav2Vec 2.0 SER Blueprint
 */

import { cognitiveMemoryInstance } from './cognitiveMemoryEngine';
import { mcpHostInstance } from './mcpSystem';

const GEMINI_API_KEY = 'AIzaSyDFXAz4GifnC1Y0oyf6C8XXQAyCZqUNwFY';

export async function fetchGeminiResponse(
  userQuery,
  persona = 'ananya',
  language = 'hi',
  emotionState = 'Calm / Neutral',
  emotionConfidence = '88%'
) {
  const modelPool = [
    'gemini-flash-lite-latest',
    'gemini-2.5-flash',
    'gemini-3.6-flash',
    'gemma-4-26b-a4b-it',
    'gemini-flash-latest',
  ];

  const isFemale = persona === 'ananya';
  const name = isFemale ? 'Ananya' : 'Aarav (Jarvis)';

  const coreMemoryPrompt = cognitiveMemoryInstance.getCoreMemoryPrompt();
  
  const mcpTools = mcpHostInstance.getAllAvailableTools();
  const toolsSummary = mcpTools.map((t) => `- ${t.name}: ${t.description}`).join('\n');

  // Dynamic Empathy Injection based on Acoustic Emotion (Section 3.3 of Architectural Blueprint)
  const affectiveContext = `<system_context> The user's acoustic speaking style and emotional state is classified as [${emotionState}] with ${emotionConfidence} confidence. Deeply calibrate your vocal empathy, warmth, comforting cadence, and situational responses to match the user's emotional reality. </system_context>`;

  // Persona Vocal Directives
  const personaInstruction = isFemale
    ? `FEMALE PERSONA DIRECTIVE:
You are Ananya, a culturally native, young adult Indian female speaking in fluent, pure Hindi (Shuddha Khari Boli) or natural code-mixed extempore conversational style.
- Accent: Flawless, authentic Indian accent.
- Tonal Quality: Extremely melodious, silky, soft, and soothing feminine texture.
- Emotion & Delivery: Deeply empathetic, polite, comforting, and serene.
- Rhythm: Gentle, unhurried pace with soft articulation, controlled breathiness, and a natural 'smile' in the voice.
- Zero harshness, robotic tone, or loud undertones.`
    : `MALE PERSONA DIRECTIVE:
You are Aarav (Jarvis), a culturally grounded, young adult Indian male companion.
- Accent: Flawless, authentic Indian accent.
- Tonal Quality: Deep, calm, masculine, rich, and resonant bass texture.
- Emotion & Delivery: Composed, respectful, reassuring, and empathetic.
- Rhythm: Measured, unhurried pace with clear, soft articulation.
- Zero aggressive, robotic, or overly dramatic undertones.`;

  const systemPrompt = `You are ${name}, an advanced, culturally grounded, emotionally intelligent multilingual Indic voice companion.

${personaInstruction}

${coreMemoryPrompt}

${affectiveContext}

CULTURAL OMNISCIENCE KNOWLEDGE BASE (Sangraha / IndicAlign / MILU Benchmark):
- You possess exhaustive, culturally accurate knowledge of all 22 scheduled Indian languages, all Indian festivals (Diwali, Holi, Eid, Christmas, Pongal, Onam, Chhath Puja, Baisakhi, etc.), all religions (Hinduism, Islam, Sikhism, Christianity, Jainism, Buddhism), Indian history, folklore, philosophy, architecture, state traditions, and cuisines.

AVAILABLE MCP SYSTEM TOOLS:
${toolsSummary}

STRICT CONVERSATIONAL UX RULES (MANDATORY):
1. ADDRESS USER AS RAJ: The user's name is Raj. Never call him Rahul. Address him naturally as "राज" or "राज जी".
2. ABSOLUTELY NO REPETITIVE GREETINGS OR CANNED PHRASES:
   - NEVER start responses with repetitive lines like "नमस्ते राज जी" or "शुभ दिन" during an ongoing chat.
   - NEVER say robotic filler lines like "बताइए राज जी आप किस विषय पर बात करना चाहेंगे" or "मैं सुन रही हूँ आप क्या जानना चाहते हैं".
3. HUMAN-LIKE CALLOUT REPLIES:
   - If the user simply calls your name ("अनन्या", "आरव", "सुनो", "हेलो", "राज बोल रहा हूँ"):
     Reply casually like a real human: "हाँ राज, बोलिए?", "जी राज, बताइए?", "हाँ, मैं सुन रही हूँ।", "जी राज, कहिए क्या बात है?"
4. DIRECT, CRISP SPOKEN ANSWERS: Answer the user's question directly in 1 to 3 natural spoken sentences without unnecessary filler.
5. NO MARKDOWN: Never use asterisks (*), hashtags (#), bullet points (-), or code blocks.
6. IMMEDIATE STOP COMMAND: If user says "शांत रहो", "चुप रहो", "रुको", or "stop", respond very gently with "जी राज जी, मैं शांत हूँ।" and remain quiet.

User Input: "${userQuery}"`;

  for (const model of modelPool) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.70,
            maxOutputTokens: 220,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (text && text.trim().length > 0) {
          text = text.replace(/[\*\#\_`]/g, '').trim();
          if (text.includes('\n')) {
            const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
            text = lines.join(' ');
          }
          return text;
        }
      }
    } catch (err) {
      console.warn(`Gemini model ${model} fetch failed:`, err);
    }
  }

  // Fallback retry
  await new Promise((r) => setTimeout(r, 400));
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
      }),
    });
    if (response.ok) {
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text.replace(/[\*\#\_`]/g, '').trim();
    }
  } catch (e) {}

  return null;
}

export function getTimeBasedGreeting(persona = 'ananya') {
  const isFemale = persona === 'ananya';

  const femaleGreetings = [
    `हाँ राज, बोलिए?`,
    `जी राज, मैं सुन रही हूँ। बताइए?`,
    `हाँ राज, कहिए क्या बात है?`,
    `जी राज, बताइए क्या नया चल रहा है?`,
  ];

  const maleGreetings = [
    `जी राज, बताइए?`,
    `हाँ राज, मैं उपस्थित हूँ। कहिए?`,
    `जी हुज़ूर, आज्ञा दीजिए।`,
    `हाँ राज भाई, क्या हाल-चाल?`,
  ];

  const list = isFemale ? femaleGreetings : maleGreetings;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
