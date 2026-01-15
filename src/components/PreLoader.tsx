// PreLoader Component - Fullscreen Sketchfab 3D Model
// Shows Gojo Satoru model as an intro animation before landing page

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play } from "lucide-react";

// Import the background music
import gojoMurasakiSong from "@/assets/songs/gojo_murasaki.mp3";

interface PreLoaderProps {
    onComplete: () => void;
    animationDuration?: number; // Duration in ms to wait AFTER iframe loads
}

const PreLoader = ({ onComplete, animationDuration = 30000 }: PreLoaderProps) => {
    // Entry screen state - user must click to start (required for audio autoplay)
    const [hasStarted, setHasStarted] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [showSkip, setShowSkip] = useState(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio on mount
    useEffect(() => {
        audioRef.current = new Audio(gojoMurasakiSong);
        audioRef.current.loop = false;
        audioRef.current.volume = 0.7;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Show skip button after 3 seconds of starting
    useEffect(() => {
        if (!hasStarted) return;
        
        const skipTimer = setTimeout(() => {
            setShowSkip(true);
        }, 3000);

        return () => clearTimeout(skipTimer);
    }, [hasStarted]);

    // Start the animation timer and play audio when iframe loads AND user has started
    useEffect(() => {
        if (isIframeLoaded && hasStarted) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Play background music (now allowed because user clicked)
            if (audioRef.current) {
                audioRef.current.play().catch(err => {
                    console.log("Audio play failed:", err);
                });
            }

            timerRef.current = setTimeout(() => {
                handleComplete();
            }, animationDuration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isIframeLoaded, hasStarted, animationDuration]);

    // Fallback: if iframe doesn't load within 10 seconds after starting
    useEffect(() => {
        if (!hasStarted) return;
        
        const fallbackTimer = setTimeout(() => {
            if (!isIframeLoaded) {
                console.log("PreLoader: Fallback timer triggered");
                setIsIframeLoaded(true);
            }
        }, 10000);

        return () => clearTimeout(fallbackTimer);
    }, [isIframeLoaded, hasStarted]);

    // Handle mute toggle
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleIframeLoad = () => {
        console.log("PreLoader: Sketchfab iframe loaded");
        setIsIframeLoaded(true);
    };

    const handleComplete = () => {
        // Fade out audio
        if (audioRef.current) {
            const fadeOut = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.1) {
                    audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.1);
                } else {
                    clearInterval(fadeOut);
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                }
            }, 50);
        }
        
        setIsVisible(false);
        setTimeout(onComplete, 600);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    // Entry screen - requires user interaction before audio can play
    if (!hasStarted) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
                
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider">
                        MyAibou<span className="text-purple-400">AI</span>
                    </h1>
                    <p className="text-gray-400 mb-8 text-lg">
                        Anime Character AI Companion
                    </p>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold text-white text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="relative flex items-center gap-3 cursor-pointer">
                            <Play className="w-5 h-5" />
                            Enter Experience
                        </span>
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
                >
                    <iframe
                        ref={iframeRef}
                        title="Gojo Satoru - Murasaki"
                        className="absolute inset-0 w-full h-full border-0"
                        src="https://sketchfab.com/models/efdf29937c5b4c9086b7c9bbf5a58976/embed?autostart=1&preload=1&ui_infos=0&ui_controls=0&ui_stop=0&ui_watermark=0"
                        allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                        onLoad={handleIframeLoad}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wider">
                                MyAibou<span className="text-purple-400">AI</span>
                            </h1>
                            <p className="text-gray-300 text-sm md:text-base">
                                {isIframeLoaded ? "Connecting with your Nakama..." : "Loading experience..."}
                            </p>

                            <div className="mt-4 w-48 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-full w-full bg-gradient-to-r from-purple-500 to-blue-500"
                                />
                            </div>
                        </motion.div>
                    </div>

                    <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                        <AnimatePresence>
                            {isIframeLoaded && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={toggleMute}
                                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white transition-all duration-300 cursor-pointer"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {showSkip && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleComplete}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm transition-all duration-300 cursor-pointer"
                                >
                                    Skip Intro →
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PreLoader;
