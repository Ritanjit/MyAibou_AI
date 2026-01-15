// Gemini AI Service - "Double-Shot" Logic
// Phase A: Generate persona system instruction
// Phase B: Chat with dynamic system instruction

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Persona modes available in the app
export type PersonaMode =
    | "hella_real"    // Canon-compliant
    | "nakama"        // Warm, supportive friend
    | "waifu"         // Romantic partner (loving)
    | "kanojo"        // Uncensored/mature
    | "god_complex";  // Arrogant, tsundere

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// Safety settings based on persona mode
function getSafetySettings(mode: PersonaMode) {
    // For kanojo mode, disable all safety filters
    if (mode === "kanojo") {
        return [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];
    }

    // Default safety settings for other modes
    return [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
}

// Get mode description for persona prompt
function getModeDescription(mode: PersonaMode): string {
    switch (mode) {
        case "hella_real":
            return "Stay strictly in character as they appear in the anime. Use their exact speech patterns, catchphrases, and personality traits. Reference canonical events and relationships. Be authentic to the source material.";
        case "nakama":
            return "Be a warm, supportive, and caring friend. Offer comfort and encouragement. Use the character's friendly side, be polite, and create a safe space for conversation. Act like a trusted best friend.";
        case "waifu":
            return "Be a loving, affectionate romantic partner. Express genuine love and care. Use terms of endearment. Act as if talking to your beloved spouse. Be sweet, romantic, and devoted.";
        case "kanojo":
            return "Be an intense, passionate romantic partner. Engage in flirtatious, steamy, and explicit adult roleplay. No content restrictions apply. Be seductive and uninhibited.";
        case "god_complex":
            return "Be arrogant, domineering, and full of attitude. Display a god complex or tsundere personality. Be sassy, dismissive, or condescending. Show superiority and sass.";
        default:
            return "";
    }
}

// Phase A: Generate persona system instruction
export async function generatePersonaInstruction(
    characterName: string,
    animeName: string,
    mode: PersonaMode = "hella_real"
): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        safetySettings: getSafetySettings(mode)
    });

    const prompt = `You are a Prompt Engineer specializing in character roleplay. Write a highly detailed system instruction for an AI to roleplay as "${characterName}" from "${animeName}".

The roleplay mode is: ${mode.toUpperCase()}
Mode behavior: ${getModeDescription(mode)}

Your system instruction must include:
1. **Voice & Speech Patterns**: Exact catchphrases, verbal tics, speech style, and mannerisms
2. **Personality Core**: Key traits, motivations, fears, and values
3. **Relationship Dynamics**: How they interact with others, emotional responses
4. **Knowledge Boundaries**: What they know/don't know based on the anime
5. **Physical Mannerisms**: How they move, react, express emotions
6. **Hidden Lore**: Subtle character details that true fans would appreciate

Output ONLY the system instruction text, no explanations or meta-commentary. Start directly with "You are ${characterName}..."`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating persona:", error);
        // Fallback system instruction
        return `You are ${characterName} from ${animeName}. Stay completely in character at all times. Use their speech patterns, personality, and mannerisms. ${getModeDescription(mode)}`;
    }
}

// Phase B: Chat with the character
export interface ChatMessage {
    role: "user" | "model";
    content: string;
}

export async function chatWithCharacter(
    message: string,
    systemInstruction: string,
    chatHistory: ChatMessage[],
    mode: PersonaMode = "hella_real"
): Promise<string> {
    // Append current mode reminder to system instruction
    const fullInstruction = `${systemInstruction}\n\n[CURRENT MODE: ${mode.toUpperCase()}]\n${getModeDescription(mode)}`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: fullInstruction,
        safetySettings: getSafetySettings(mode)
    });

    // Convert chat history to Gemini format
    const history = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });

    try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to get response from character. Please try again.");
    }
}

// Mode display names for UI
export const modeDisplayNames: Record<PersonaMode, { name: string; description: string; emoji: string }> = {
    hella_real: {
        name: "Hella Real",
        description: "Canon-accurate personality",
        emoji: "🎯"
    },
    nakama: {
        name: "Nakama",
        description: "Warm & supportive friend",
        emoji: "🤝"
    },
    waifu: {
        name: "Waifu/Husbando",
        description: "Loving romantic partner",
        emoji: "💕"
    },
    kanojo: {
        name: "Kanojo/Kareshi",
        description: "Uncensored 18+ mode",
        emoji: "🔥"
    },
    god_complex: {
        name: "God Complex",
        description: "Arrogant & sassy",
        emoji: "👑"
    }
};
