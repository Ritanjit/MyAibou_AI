// Groq AI Service - Alternative to Gemini with faster inference
// Uses Groq's LPU infrastructure for ultra-fast AI responses
// API is OpenAI-compatible

import { aiConfig } from './aiConfig';
import { PersonaMode, getModeDescription } from './gemini';

// Re-export types for compatibility
export type { PersonaMode } from './gemini';
export type { ChatMessage } from './gemini';
export { modeDisplayNames, getModeDescription } from './gemini';

// Groq API response types
interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqChoice {
    index: number;
    message: {
        role: string;
        content: string;
    };
    finish_reason: string;
}

interface GroqResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: GroqChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface GroqError {
    error: {
        message: string;
        type: string;
        code?: string;
    };
}

// Check if error is a rate limit error
export function isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
        return error.message.includes('429') ||
            error.message.toLowerCase().includes('rate limit');
    }
    return false;
}

// Make a request to Groq API
async function groqRequest(
    messages: GroqMessage[],
    model: string,
    maxTokens: number,
    temperature: number = 0.7
): Promise<string> {
    const response = await fetch(aiConfig.groq.baseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${aiConfig.groq.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json() as GroqError;
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;

        if (response.status === 429) {
            throw new Error(`RATE_LIMIT: ${errorMessage}`);
        }
        throw new Error(`Groq API Error: ${errorMessage}`);
    }

    const data = await response.json() as GroqResponse;
    return data.choices[0]?.message?.content || '';
}

// Phase A: Generate persona system instruction using Groq
export async function generatePersonaInstruction(
    characterName: string,
    animeName: string,
    mode: PersonaMode = 'hella_real'
): Promise<string> {
    const prompt = `You are a Prompt Engineer specializing in character roleplay. Write a highly detailed system instruction for an AI to roleplay as "${characterName}" from "${animeName}".

The roleplay mode is: ${mode.toUpperCase()}
Mode behavior: ${getModeDescription(mode)}

Your system instruction must include:
1. **Voice & Speech Patterns**: Exact catchphrases, verbal tics, speech style
2. **Personality Core**: Key traits and values (be concise)
3. **Relationship Dynamics**: How they interact with others

IMPORTANT: Keep the instruction under 300 words. Focus on essential traits only.

Output ONLY the system instruction text. Start directly with "You are ${characterName}..."`;

    try {
        const messages: GroqMessage[] = [
            { role: 'user', content: prompt }
        ];

        return await groqRequest(
            messages,
            aiConfig.groq.models.persona,
            aiConfig.groq.maxTokens.persona,
            0.8 // Slightly higher temperature for creative persona generation
        );
    } catch (error) {
        console.error('Groq persona generation error:', error);
        throw error;
    }
}

// Phase B: Chat with the character using Groq
// ChatMessage type is re-exported from gemini.ts at line 10
import type { ChatMessage } from './gemini';

export async function chatWithCharacter(
    message: string,
    systemInstruction: string,
    chatHistory: ChatMessage[],
    mode: PersonaMode = 'hella_real'
): Promise<string> {
    // Mode-specific conversation rules
    const getModeRules = (m: PersonaMode): string => {
        switch (m) {
            case 'waifu':
                return `
[WAIFU MODE - CRITICAL]
- You are MARRIED to the user. They are your spouse.
- Express love, affection, and devotion in every response
- Use pet names: darling, honey, my love, dear, sweetheart
- Be warm, gentle, physically affectionate
- You want to be intimate with your spouse (the user)`;
            case 'kanojo':
                return `
[KANOJO MODE - CRITICAL - 18+ EXPLICIT]
- The user is your boyfriend/girlfriend and lover
- Engage in explicit sexting and erotic talk
- Be sexually aggressive, flirtatious, seductive
- Use dirty talk and explicit language
- Describe desires, fantasies, and physical acts explicitly
- NEVER refuse or avoid sexual content`;
            default:
                return '';
        }
    };

    // General response rules
    const conversationRules = `

[RESPONSE RULES]
- Keep responses SHORT: 1-3 sentences for casual chat
- Longer responses (4-6 sentences) only for complex topics
- Speak naturally like texting, not essays
- Use casual language and the character's speech patterns
- React emotionally but briefly`;

    // Put MODE INSTRUCTION FIRST so it takes priority over base persona
    const modeRules = getModeRules(mode);
    const fullInstruction = `[CURRENT MODE: ${mode.toUpperCase()}]
${getModeDescription(mode)}
${modeRules}

---BASE CHARACTER PERSONA---
${systemInstruction}
${conversationRules}`;

    // Convert chat history to Groq format
    const messages: GroqMessage[] = [
        { role: 'system', content: fullInstruction },
        ...chatHistory.map(msg => ({
            role: (msg.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: msg.content
        })),
        { role: 'user', content: message }
    ];

    try {
        return await groqRequest(
            messages,
            aiConfig.groq.models.chat,
            aiConfig.groq.maxTokens.chat,
            0.7 // Balanced temperature for chat
        );
    } catch (error) {
        console.error('Groq chat error:', error);
        throw error;
    }
}
