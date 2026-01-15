// Chat Interface Component
// Main chat UI with persona mode selector and message bubbles

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Settings, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
    PersonaMode,
    modeDisplayNames,
    generatePersonaInstruction,
    chatWithCharacter,
    ChatMessage
} from "@/services/gemini";

interface ChatInterfaceProps {
    characterName: string;
    animeName: string;
    onBack: () => void;
}

const ChatInterface = ({ characterName, animeName, onBack }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPersona, setIsGeneratingPersona] = useState(true);
    const [systemInstruction, setSystemInstruction] = useState<string>("");
    const [currentMode, setCurrentMode] = useState<PersonaMode>("hella_real");
    const [showModeSelector, setShowModeSelector] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Generate persona on mount
    useEffect(() => {
        const initPersona = async () => {
            setIsGeneratingPersona(true);
            try {
                const instruction = await generatePersonaInstruction(characterName, animeName, currentMode);
                setSystemInstruction(instruction);
            } catch (error) {
                console.error("Failed to generate persona:", error);
            } finally {
                setIsGeneratingPersona(false);
            }
        };
        initPersona();
    }, [characterName, animeName]);

    // Regenerate persona when mode changes
    const handleModeChange = async (newMode: PersonaMode) => {
        setCurrentMode(newMode);
        setShowModeSelector(false);
        setIsGeneratingPersona(true);
        try {
            const instruction = await generatePersonaInstruction(characterName, animeName, newMode);
            setSystemInstruction(instruction);
        } catch (error) {
            console.error("Failed to regenerate persona:", error);
        } finally {
            setIsGeneratingPersona(false);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || isGeneratingPersona) return;

        const userMessage = inputValue.trim();
        setInputValue("");

        // Add user message
        const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await chatWithCharacter(
                userMessage,
                systemInstruction,
                newMessages.slice(0, -1), // Don't include the last user message in history
                currentMode
            );
            setMessages(prev => [...prev, { role: "model", content: response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [
                ...prev,
                { role: "model", content: "Gomen... I couldn't respond. Please try again." }
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-950 flex flex-col">
            {/* Header */}
            <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/20 px-4 py-3">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Character Avatar with breathing animation */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold animate-breathing">
                                {characterName.charAt(0)}
                            </div>
                            {isGeneratingPersona && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-3 h-3 text-black animate-spin" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-white font-semibold">{characterName}</h1>
                            <p className="text-gray-500 text-xs">{animeName}</p>
                        </div>
                    </div>

                    {/* Mode selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowModeSelector(!showModeSelector)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                        >
                            <span className="text-lg">{modeDisplayNames[currentMode].emoji}</span>
                            <span className="text-sm text-gray-300 hidden sm:inline">
                                {modeDisplayNames[currentMode].name}
                            </span>
                            <Settings className="w-4 h-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                            {showModeSelector && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden z-20"
                                >
                                    {(Object.keys(modeDisplayNames) as PersonaMode[]).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => handleModeChange(mode)}
                                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left ${currentMode === mode ? "bg-purple-500/20" : ""
                                                }`}
                                        >
                                            <span className="text-xl">{modeDisplayNames[mode].emoji}</span>
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {modeDisplayNames[mode].name}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {modeDisplayNames[mode].description}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-4">
                    {/* Persona loading state */}
                    {isGeneratingPersona && messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-800/50 rounded-2xl border border-purple-500/20">
                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                <span className="text-gray-300">
                                    Channeling {characterName}'s soul...
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Welcome message */}
                    {!isGeneratingPersona && messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl text-white font-bold animate-breathing">
                                {characterName.charAt(0)}
                            </div>
                            <h2 className="text-xl text-white font-semibold mb-2">
                                Start chatting with {characterName}
                            </h2>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Mode: <span className="text-purple-400">{modeDisplayNames[currentMode].name}</span>
                                <br />
                                Say hello and see how they respond!
                            </p>
                        </motion.div>
                    )}

                    {/* Chat messages */}
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === "user"
                                        ? "bg-purple-600 text-white rounded-br-md"
                                        : "bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700"
                                    }`}
                            >
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="px-4 py-3 bg-gray-800 rounded-2xl rounded-bl-md border border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/20 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isGeneratingPersona ? "Preparing character..." : `Message ${characterName}...`}
                        disabled={isGeneratingPersona}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading || isGeneratingPersona}
                        className="p-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
