// AI Provider Configuration
// Central config for switching between Groq (primary) and Gemini (fallback)

export type AIProvider = 'groq' | 'gemini';

export const aiConfig = {
    // Primary provider - Groq for faster inference
    primaryProvider: 'groq' as AIProvider,
    // Fallback provider - Gemini when Groq rate limits are hit
    fallbackProvider: 'gemini' as AIProvider,

    groq: {
        apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        models: {
            // llama-3.3-70b-versatile for high-quality persona generation
            persona: 'llama-3.3-70b-versatile',
            // llama-3.1-8b-instant for fast chat responses with highest rate limits
            chat: 'llama-3.1-8b-instant',
        },
        // Max tokens configuration
        maxTokens: {
            persona: 5000,
            chat: 1000,
        },
    },

    gemini: {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'gemini-2.5-flash',
        maxTokens: {
            persona: 1000,
            chat: 500,
        },
    },
};

// Check if Groq is configured
export const isGroqConfigured = (): boolean => {
    return !!aiConfig.groq.apiKey;
};

// Check if Gemini is configured
export const isGeminiConfigured = (): boolean => {
    return !!aiConfig.gemini.apiKey;
};
