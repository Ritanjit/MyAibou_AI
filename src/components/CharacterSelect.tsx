// Character Selection Component
// Searchable grid of anime characters with filtering

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";
import { characterData, getAllCharacters } from "@/data/characterData";

interface CharacterSelectProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (characterName: string, animeName: string) => void;
}

const CharacterSelect = ({ isOpen, onClose, onSelect }: CharacterSelectProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAnime, setSelectedAnime] = useState<string | null>(null);

    // Get all characters flattened for search
    const allCharacters = useMemo(() => getAllCharacters(), []);

    // Filter characters based on search
    const filteredCharacters = useMemo(() => {
        if (!searchQuery.trim()) return allCharacters;
        const query = searchQuery.toLowerCase();
        return allCharacters.filter(
            char =>
                char.name.toLowerCase().includes(query) ||
                char.anime.toLowerCase().includes(query)
        );
    }, [searchQuery, allCharacters]);

    // Group filtered characters by anime
    const groupedCharacters = useMemo(() => {
        const groups: Record<string, typeof filteredCharacters> = {};
        for (const char of filteredCharacters) {
            if (!groups[char.anime]) {
                groups[char.anime] = [];
            }
            groups[char.anime].push(char);
        }
        return groups;
    }, [filteredCharacters]);

    const handleCharacterClick = (charName: string, animeName: string) => {
        // Only call onSelect - the parent component handles the state transition
        // which will automatically hide this modal
        onSelect(charName, animeName);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/20 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-400" />
                                    <h2 className="text-xl font-bold text-white">Choose Your Nakama</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search characters or anime..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Character Grid */}
                        <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
                            {Object.keys(groupedCharacters).length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No characters found</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedCharacters).map(([anime, chars]) => (
                                        <motion.div
                                            key={anime}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            {/* Anime Header */}
                                            <button
                                                onClick={() => setSelectedAnime(selectedAnime === anime ? null : anime)}
                                                className="flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                <span className="px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/30">
                                                    {anime}
                                                </span>
                                                <span className="text-gray-500 text-xs">{chars.length} characters</span>
                                            </button>

                                            {/* Character Cards */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {chars.map((char, idx) => (
                                                    <motion.button
                                                        key={`${char.name}-${idx}`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleCharacterClick(char.name, char.anime)}
                                                        className="relative group p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800 transition-all duration-300 text-left"
                                                    >
                                                        {/* Character avatar placeholder */}
                                                        <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                                                            {char.name.charAt(0)}
                                                        </div>

                                                        <p className="text-white font-medium text-sm truncate group-hover:text-purple-300 transition-colors">
                                                            {char.name}
                                                        </p>

                                                        {char.group && (
                                                            <p className="text-gray-500 text-xs mt-1 capitalize">
                                                                {char.group.replace(/_/g, " ")}
                                                            </p>
                                                        )}

                                                        {/* Hover glow */}
                                                        <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors pointer-events-none" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CharacterSelect;
