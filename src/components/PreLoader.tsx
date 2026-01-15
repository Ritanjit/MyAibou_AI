// PreLoader Component - Fullscreen Sketchfab 3D Model
// Shows Gojo Satoru model as an intro animation before landing page

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

// Import the background music
import gojoMurasakiSong from "@/assets/songs/gojo_murasaki.mp3";

interface PreLoaderProps {
    onComplete: () => void;
    animationDuration?: number; // Duration in ms to wait AFTER iframe loads
}

const PreLoader = ({ onComplete, animationDuration = 30000 }: PreLoaderProps) => {
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
            // Cleanup audio on unmount
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Show skip button after 3 seconds
    useEffect(() => {
        const skipTimer = setTimeout(() => {
            setShowSkip(true);
        }, 3000);

        return () => clearTimeout(skipTimer);
    }, []);

    // Start the animation timer and play audio when iframe loads
    useEffect(() => {
        if (isIframeLoaded) {
            // Clear any existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Play background music
            if (audioRef.current) {
                audioRef.current.play().catch(err => {
                    console.log("Audio autoplay blocked:", err);
                });
            }

            // Start new timer for the animation duration
            timerRef.current = setTimeout(() => {
                handleComplete();
            }, animationDuration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isIframeLoaded, animationDuration]);

    // Fallback: if iframe doesn't load within 10 seconds, start the timer anyway
    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            if (!isIframeLoaded) {
                console.log("PreLoader: Fallback timer triggered (iframe load event not received)");
                setIsIframeLoaded(true);
            }
        }, 10000);

        return () => clearTimeout(fallbackTimer);
    }, [isIframeLoaded]);

    // Handle mute toggle
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

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
        // Wait for exit animation before calling onComplete
        setTimeout(onComplete, 600);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
                >
                    {/* Sketchfab Embed - Gojo Satoru Murasaki */}
                    <iframe
                        ref={iframeRef}
                        title="Gojo Satoru - Murasaki"
                        className="absolute inset-0 w-full h-full border-0"
                        src="https://sketchfab.com/models/efdf29937c5b4c9086b7c9bbf5a58976/embed?autostart=1&preload=1&ui_infos=0&ui_controls=0&ui_stop=0&ui_watermark=0"
                        allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                        onLoad={handleIframeLoad}
                    />

                    {/* Gradient overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

                    {/* Loading indicator & branding */}
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

                            {/* Loading bar */}
                            <div className="mt-4 w-48 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="h-full w-3/3 bg-gradient-to-r from-purple-500 to-blue-500"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Top controls */}
                    <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                        {/* Mute/Unmute button */}
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
                                    {isMuted ? (
                                        <VolumeX className="w-5 h-5" />
                                    ) : (
                                        <Volume2 className="w-5 h-5" />
                                    )}
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Skip button */}
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

