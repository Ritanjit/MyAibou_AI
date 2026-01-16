// Chat Storage Service - LocalStorage persistence for chat history
// Stores conversations per character for offline access

import { ChatMessage } from "./ai";

interface StoredChat {
    characterName: string;
    animeName: string;
    messages: ChatMessage[];
    personaMode: string;
    systemInstruction: string;
    lastUpdated: number;
}

const STORAGE_KEY_PREFIX = "myaibou_chat_";
const CHAT_LIST_KEY = "myaibou_chat_list";

/**
 * Generate a storage key for a character
 */
export const getStorageKey = (animeName: string, characterName: string): string => {
    const animeSlug = animeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const charSlug = characterName.toLowerCase().split(" ")[0].replace(/[^a-z0-9]+/g, "-");
    return `${STORAGE_KEY_PREFIX}${animeSlug}_${charSlug}`;
};

/**
 * Generate a URL-safe slug from a string
 */
export const toSlug = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

/**
 * Get the first name from a full character name
 */
export const getFirstName = (fullName: string): string => {
    return fullName.split(" ")[0];
};

/**
 * Generate URL path for a character
 */
export const getCharacterPath = (animeName: string, characterName: string): string => {
    const animeSlug = toSlug(animeName);
    const firstName = toSlug(getFirstName(characterName));
    return `/${animeSlug}/${firstName}`;
};

/**
 * Save chat to localStorage
 */
export const saveChat = (
    animeName: string,
    characterName: string,
    messages: ChatMessage[],
    personaMode: string,
    systemInstruction: string
): void => {
    try {
        const key = getStorageKey(animeName, characterName);
        const chatData: StoredChat = {
            characterName,
            animeName,
            messages,
            personaMode,
            systemInstruction,
            lastUpdated: Date.now()
        };

        localStorage.setItem(key, JSON.stringify(chatData));

        // Update the chat list
        updateChatList(key, animeName, characterName);
    } catch (error) {
        console.error("Failed to save chat to localStorage:", error);
    }
};

/**
 * Load chat from localStorage
 */
export const loadChat = (animeName: string, characterName: string): StoredChat | null => {
    try {
        const key = getStorageKey(animeName, characterName);
        const stored = localStorage.getItem(key);

        if (stored) {
            return JSON.parse(stored) as StoredChat;
        }
        return null;
    } catch (error) {
        console.error("Failed to load chat from localStorage:", error);
        return null;
    }
};

/**
 * Load chat by URL path (anime slug and character first name)
 */
export const loadChatByPath = (animeSlug: string, characterSlug: string): StoredChat | null => {
    try {
        // Get all chats and find matching one
        const chatListStr = localStorage.getItem(CHAT_LIST_KEY);
        if (!chatListStr) return null;

        const chatList: { key: string; animeName: string; characterName: string }[] = JSON.parse(chatListStr);

        // Find matching chat by comparing slugs
        for (const chat of chatList) {
            const storedAnimeSlug = toSlug(chat.animeName);
            const storedCharSlug = toSlug(getFirstName(chat.characterName));

            if (storedAnimeSlug === animeSlug && storedCharSlug === characterSlug) {
                const stored = localStorage.getItem(chat.key);
                if (stored) {
                    return JSON.parse(stored) as StoredChat;
                }
            }
        }

        return null;
    } catch (error) {
        console.error("Failed to load chat by path:", error);
        return null;
    }
};

/**
 * Update the list of active chats
 */
const updateChatList = (key: string, animeName: string, characterName: string): void => {
    try {
        const listStr = localStorage.getItem(CHAT_LIST_KEY);
        let list: { key: string; animeName: string; characterName: string }[] = [];

        if (listStr) {
            list = JSON.parse(listStr);
        }

        // Check if already exists
        const exists = list.some(item => item.key === key);
        if (!exists) {
            list.push({ key, animeName, characterName });
            localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(list));
        }
    } catch (error) {
        console.error("Failed to update chat list:", error);
    }
};

/**
 * Clear chat for a specific character
 */
export const clearChat = (animeName: string, characterName: string): void => {
    try {
        const key = getStorageKey(animeName, characterName);
        localStorage.removeItem(key);

        // Update chat list
        const listStr = localStorage.getItem(CHAT_LIST_KEY);
        if (listStr) {
            const list = JSON.parse(listStr);
            const filtered = list.filter((item: { key: string }) => item.key !== key);
            localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(filtered));
        }
    } catch (error) {
        console.error("Failed to clear chat:", error);
    }
};

/**
 * Get all stored chats
 */
export const getAllChats = (): StoredChat[] => {
    try {
        const listStr = localStorage.getItem(CHAT_LIST_KEY);
        if (!listStr) return [];

        const list: { key: string }[] = JSON.parse(listStr);
        const chats: StoredChat[] = [];

        for (const item of list) {
            const stored = localStorage.getItem(item.key);
            if (stored) {
                chats.push(JSON.parse(stored));
            }
        }

        // Sort by last updated
        return chats.sort((a, b) => b.lastUpdated - a.lastUpdated);
    } catch (error) {
        console.error("Failed to get all chats:", error);
        return [];
    }
};

// ============================================
// Intro Preloader First-Visit Tracking
// ============================================

const INTRO_SEEN_KEY = "myaibou_intro_seen";

/**
 * Check if the user has seen the intro preloader
 */
export const hasSeenIntro = (): boolean => {
    try {
        return localStorage.getItem(INTRO_SEEN_KEY) === "true";
    } catch (error) {
        console.error("Failed to check intro seen status:", error);
        return false;
    }
};

/**
 * Mark the intro preloader as seen (call after preloader completes)
 */
export const markIntroAsSeen = (): void => {
    try {
        localStorage.setItem(INTRO_SEEN_KEY, "true");
    } catch (error) {
        console.error("Failed to mark intro as seen:", error);
    }
};
