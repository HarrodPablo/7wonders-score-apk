import { motion } from 'framer-motion';
import { Moon, Play, Sun, Trophy } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo7Wonders from '../assets/icono/7wonders.svg';
import backgroundVideo from '../assets/video/video.mp4';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/theme.store';
import { useTournamentStore } from '../store/tournament.store';
import { useGameStore } from '../store/game.store';

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { isActive: isTournamentActive, endTournament } = useTournamentStore();
  const { endGame } = useGameStore();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-between h-[calc(100dvh-5rem)] w-full p-4 relative overflow-hidden"
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-2 bg-zinc-900/65 backdrop-blur-md rounded-full text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-zinc-800 hover:scale-110 transition-all z-50 border border-zinc-700/50"
        title={isDarkMode ? "Cambiar a Modo Día" : "Cambiar a Modo Noche"}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Background Video */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          defaultMuted
          playsInline
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-zinc-950/90 backdrop-blur-[1px]"></div>
      </div>

      <div className="w-full flex-1 flex flex-col justify-between max-w-md relative z-10 pt-4 pb-2">
        <div className="flex flex-col items-center">
          <img
            src={logo7Wonders}
            alt="7 Wonders"
            className="w-full max-w-[220px] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-500 hover:scale-105"
          />
        </div>

        <div className="flex flex-col w-full mt-auto pt-4 gap-2">
          <Button
            variant="primary"
            className="w-full py-2 text-base shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-shadow border border-yellow-600/30"
            onClick={() => {
              if (isTournamentActive) {
                if (window.confirm("Tienes un torneo activo. ¿Deseas cancelarlo para crear una partida libre?")) {
                  endTournament();
                  endGame();
                  navigate('/setup');
                }
              } else {
                endGame();
                navigate('/setup');
              }
            }}
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            NUEVA PARTIDA
          </Button>

          <Button
            variant="secondary"
            className="w-full py-2 text-sm shadow-md border-2 border-parchment-300 dark:border-zinc-700"
            onClick={() => {
              if (isTournamentActive) {
                navigate('/setup'); // Volver a la mesa del torneo
              } else {
                navigate('/setup-tournament');
              }
            }}
          >
            <Trophy className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-500" />
            {isTournamentActive ? "CONTINUAR TORNEO" : "NUEVO TORNEO"}
          </Button>

        </div>
      </div>
    </motion.div>
  );
}
