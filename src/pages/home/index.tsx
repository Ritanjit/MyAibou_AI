// Home Page - Landing page with Sketchfab 3D model and CTA
// Shows pre-loader first, then hero section with Mio model

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageCircle, Heart, Users, Volume2, VolumeX } from "lucide-react";
import PreLoader from "@/components/PreLoader";
import CharacterSelect from "@/components/CharacterSelect";
import { getCharacterPath } from "@/services/chatStorage";

// Import the landing page background music
import kawaiSong from "@/assets/songs/kawai.mp3";
import soothingSong from "@/assets/songs/soothing.mp3";

type AppState = "loading" | "landing" | "selecting";

const HomePage = () => {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>("loading");
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMuteButton, setShowMuteButton] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio(soothingSong);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play music when model loads and we're on landing page
  useEffect(() => {
    if (isModelLoaded && appState === "landing") {
      // Add a small delay for smoother transition from preloader
      const playDelay = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.log("Audio autoplay blocked:", err);
          });
          setShowMuteButton(true);
        }
      }, 1000);

      return () => clearTimeout(playDelay);
    }
  }, [isModelLoaded, appState]);

  // Handle mute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Note: Audio cleanup happens automatically when navigating away due to component unmount

  // Resume music when returning to landing
  useEffect(() => {
    if (appState === "landing" && isModelLoaded && audioRef.current && audioRef.current.paused) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(err => {
        console.log("Audio play blocked:", err);
      });
    }
  }, [appState, isModelLoaded]);

  const handlePreLoaderComplete = () => {
    setAppState("landing");
  };

  const handleOpenCharacterSelect = () => {
    setAppState("selecting");
  };

  const handleCharacterSelect = (name: string, anime: string) => {
    // Stop the landing page music before navigating
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Navigate to the dynamic chat route
    const path = getCharacterPath(anime, name);
    navigate(path);
  };

  const handleModelLoad = () => {
    console.log("Landing page: Mio model loaded");
    setIsModelLoaded(true);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Show pre-loader
  if (appState === "loading") {
    return <PreLoader onComplete={handlePreLoaderComplete} animationDuration={30000} />;
  }

  // Chat is now handled by the dedicated ChatPage component via routing

  // Landing page with character select modal
  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

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

      {/* Mute/Unmute button - Fixed position */}
      <AnimatePresence>
        {showMuteButton && appState === "landing" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMute}
            className="fixed top-6 right-6 z-30 p-3 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-purple-500/30 rounded-full text-white transition-all duration-300 cursor-pointer shadow-lg"
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

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">
                  Nakama • Tomodachi • Waifu
                </span>
              </motion.div>

              {/* Main heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Connect with your{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  favorite anime
                </span>{" "}
                characters
              </h1>

              {/* Tagline */}
              <p className="text-lg text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
                Experience deep conversations with AI-powered personas of your beloved characters.
                Friends, partners, or something more — the connection you've always dreamed of.
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenCharacterSelect}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Meet Your Nakama
                </span>
              </motion.button>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start"
              >
                {[
                  { icon: Heart, label: "Waifu Mode" },
                  { icon: Users, label: "15+ Anime Series" },
                  { icon: Sparkles, label: "Dynamic Personas" }
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50"
                  >
                    <feature.icon className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">{feature.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - Sketchfab Model */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Glow effect behind model */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-blue-500/30 rounded-3xl blur-2xl" />

              {/* Model container */}
              <div className="relative aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                {/* Sketchfab Embed - Mio Anime Girl */}
                <iframe
                  ref={iframeRef}
                  title="Mio - Anime Girl Character"
                  className="w-full h-full"
                  src="https://sketchfab.com/models/1e41cf5f9ef744739bc8095176e6d2ea/embed?autostart=1&transparent=1&ui_infos=0&ui_controls=0&ui_stop=0&ui_watermark=0"
                  allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                  style={{ border: 0 }}
                  onLoad={handleModelLoad}
                />

                {/* Loading indicator */}
                <AnimatePresence>
                  {!isModelLoaded && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-gray-900/80"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 text-sm">Loading 3D model...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-purple-400/50 rounded-full"
                      animate={{
                        y: [0, -20, 0],
                        x: [0, 10, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${60 + i * 5}%`
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Branding footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-0 left-0 right-0 py-4 text-center"
      >
        <p className="text-gray-600 text-sm">
          • Powered by MyAibou_AI
        </p>
      </motion.div>

      {/* Character Selection Modal */}
      <CharacterSelect
        isOpen={appState === "selecting"}
        onClose={() => setAppState("landing")}
        onSelect={handleCharacterSelect}
      />
    </div>
  );
};

export default HomePage;

