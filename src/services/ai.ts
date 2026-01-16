// Unified AI Service - Abstraction layer with automatic fallback
// Primary: Groq (faster inference, better rate limits)
// Fallback: Gemini (reliable backup when Groq rate limits are hit)

import { aiConfig, isGroqConfigured, isGeminiConfigured } from './aiConfig';
import * as gemini from './gemini';
import * as groq from './groq';

// Re-export types and utilities
export type { PersonaMode, ChatMessage } from './gemini';
export { modeDisplayNames } from './gemini';

// Track current provider state
let currentProvider: 'groq' | 'gemini' = aiConfig.primaryProvider;
let lastFallbackTime: number | null = null;
const FALLBACK_COOLDOWN_MS = 60000; // Try Groq again after 1 minute

// Log provider switch
function logProviderSwitch(from: string, to: string, reason: string) {
    console.log(`[AI Service] Switching from ${from} to ${to}: ${reason}`);
}

// Check if we should try Groq again after fallback
function shouldRetryGroq(): boolean {
    if (currentProvider === 'groq') return true;
    if (!lastFallbackTime) return true;

    const timeSinceFallback = Date.now() - lastFallbackTime;
    if (timeSinceFallback > FALLBACK_COOLDOWN_MS) {
        logProviderSwitch('gemini', 'groq', 'Cooldown expired, retrying Groq');
        currentProvider = 'groq';
        lastFallbackTime = null;
        return true;
    }
    return false;
}

// Switch to fallback provider
function switchToFallback(reason: string) {
    if (currentProvider === 'groq' && isGeminiConfigured()) {
        logProviderSwitch('groq', 'gemini', reason);
        currentProvider = 'gemini';
        lastFallbackTime = Date.now();
    }
}

// Phase A: Generate persona system instruction
export async function generatePersonaInstruction(
    characterName: string,
    animeName: string,
    mode: gemini.PersonaMode = 'hella_real'
): Promise<string> {
    // Try primary provider if configured and not in cooldown
    if (isGroqConfigured() && shouldRetryGroq()) {
        try {
            console.log('[AI Service] Using Groq for persona generation');
            return await groq.generatePersonaInstruction(characterName, animeName, mode);
        } catch (error) {
            if (groq.isRateLimitError(error)) {
                switchToFallback('Rate limit hit');
            } else {
                console.error('[AI Service] Groq error:', error);
                switchToFallback('API error');
            }
        }
    }

    // Fallback to Gemini
    if (isGeminiConfigured()) {
        console.log('[AI Service] Using Gemini for persona generation (fallback)');
        return await gemini.generatePersonaInstruction(characterName, animeName, mode);
    }

    throw new Error('No AI provider configured. Please set VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY.');
}

// Phase B: Chat with the character
export async function chatWithCharacter(
    message: string,
    systemInstruction: string,
    chatHistory: gemini.ChatMessage[],
    mode: gemini.PersonaMode = 'hella_real'
): Promise<string> {
    // Try primary provider if configured and not in cooldown
    if (isGroqConfigured() && shouldRetryGroq()) {
        try {
            console.log('[AI Service] Using Groq for chat');
            return await groq.chatWithCharacter(message, systemInstruction, chatHistory, mode);
        } catch (error) {
            if (groq.isRateLimitError(error)) {
                switchToFallback('Rate limit hit');
            } else {
                console.error('[AI Service] Groq error:', error);
                switchToFallback('API error');
            }
        }
    }

    // Fallback to Gemini
    if (isGeminiConfigured()) {
        console.log('[AI Service] Using Gemini for chat (fallback)');
        return await gemini.chatWithCharacter(message, systemInstruction, chatHistory, mode);
    }

    throw new Error('No AI provider configured. Please set VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY.');
}

// Get current active provider (for debugging/UI)
export function getCurrentProvider(): 'groq' | 'gemini' {
    return currentProvider;
}

// Force a specific provider (for testing)
export function forceProvider(provider: 'groq' | 'gemini') {
    currentProvider = provider;
    lastFallbackTime = null;
    console.log(`[AI Service] Forced provider to: ${provider}`);
}
