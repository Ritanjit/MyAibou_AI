// Anime Collection Page - Full-screen character browser
// Dedicated page for browsing and selecting anime characters

import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowLeft, Heart } from "lucide-react";
import { characterData, getAllCharacters } from "@/data/characterData";
import { getCharacterPath } from "@/services/chatStorage";

const AnimeCollectionPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

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
        const path = getCharacterPath(animeName, charName);
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gray-950 overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl" />
                
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px"
                    }}
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-xl border-b border-purple-500/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Back button */}
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>

                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                            <h1 className="text-xl md:text-2xl font-bold text-white">
                                Anime <span className="text-purple-400">Collection</span>
                            </h1>
                        </div>

                        {/* Character count */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-purple-300 text-sm font-medium">
                                {allCharacters.length} Characters
                            </span>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative mt-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search characters or anime series..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-8">
                {Object.keys(groupedCharacters).length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                            <Search className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-lg">No characters found</p>
                        <p className="text-gray-600 text-sm mt-2">Try a different search term</p>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedCharacters).map(([anime, chars], animeIdx) => (
                            <motion.section
                                key={anime}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: animeIdx * 0.1, duration: 0.5 }}
                            >
                                {/* Anime Section Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
                                    <h2 className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 font-semibold text-sm">
                                        {anime}
                                    </h2>
                                    <span className="text-gray-500 text-xs">{chars.length} characters</span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-purple-500/50 to-transparent" />
                                </div>

                                {/* Character Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {chars.map((char, charIdx) => (
                                        <motion.button
                                            key={`${char.name}-${charIdx}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: charIdx * 0.05, duration: 0.3 }}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleCharacterClick(char.name, char.anime)}
                                            className="group relative p-5 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-300 text-left overflow-hidden cursor-pointer"
                                        >
                                            {/* Hover glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
                                            
                                            {/* Avatar */}
                                            <div className="relative w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                                                {char.name.charAt(0)}
                                            </div>

                                            {/* Name */}
                                            <p className="relative text-white font-medium text-sm truncate group-hover:text-purple-300 transition-colors">
                                                {char.name}
                                            </p>

                                            {/* Group indicator */}
                                            {char.group && (
                                                <p className="relative text-gray-500 text-xs mt-1 capitalize truncate">
                                                    {char.group.replace(/_/g, " ")}
                                                </p>
                                            )}

                                            {/* Shine effect */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.section>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center border-t border-gray-800/50">
                <p className="text-gray-600 text-sm">
                    • Powered by MyAibou_AI
                </p>
            </footer>
        </div>
    );
};

export default AnimeCollectionPage;
