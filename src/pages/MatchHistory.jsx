import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHistoryStore } from '../store/history.store';
import { usePlayersStore } from '../store/players.store';
import bgWallpaper from '../assets/fonts/7wonders-wallpaper.jpg';

export default function MatchHistory() {
  const games = useHistoryStore((state) => state.games);
  const tournaments = useHistoryStore((state) => state.tournaments);
  const players = usePlayersStore((state) => state.players);

  const allHistory = [
    ...games.map(g => ({ ...g, type: 'game' })),
    ...tournaments.map(t => ({ ...t, type: 'tournament' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div
      className="w-full min-h-[calc(100dvh-5rem)] bg-parchment-100 dark:bg-zinc-900 p-6 relative overflow-x-hidden transition-colors duration-300"
    >
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bgWallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="max-w-md mx-auto relative z-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full text-parchment-900 dark:text-parchment-200 shadow-sm hover:bg-white dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-extrabold text-parchment-950 dark:text-parchment-100">Historial</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        {allHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-parchment-300 dark:text-zinc-600 mb-4" />
            <p className="text-parchment-600 dark:text-parchment-400 font-medium">No hay historial registrado aún.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {allHistory.map((item) => {
              if (item.type === 'tournament') {
                const winner = players.find(p => p.id === item.winnerId);
                return (
                  <motion.div key={item.id} variants={itemVariant}>
                    <Link to={`/history/tournament/${item.id}`} className="block bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-zinc-800 p-4 rounded-2xl shadow-sm border-2 border-yellow-400 dark:border-yellow-600 hover:shadow-md hover:border-yellow-500 dark:hover:border-yellow-500 transition-all hover:scale-[1.02] transform duration-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-700/50 flex items-center gap-1.5">
                          <Trophy className="w-3 h-3" />
                          Torneo
                        </span>
                        <div className="flex items-center gap-1.5 text-parchment-700 dark:text-parchment-300 text-sm font-bold bg-parchment-100/50 dark:bg-zinc-700/50 px-3 py-1 rounded-full border border-parchment-200 dark:border-zinc-600">
                          <Clock className="w-4 h-4" />
                          {formatDate(item.date).split(',')[0]}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-parchment-500 dark:text-parchment-400 font-bold uppercase tracking-wide">Partidas Jugadas</p>
                          <p className="font-extrabold text-parchment-900 dark:text-parchment-100 text-lg leading-tight">{item.totalMatches}</p>
                        </div>
                        {winner && (
                          <div className="text-right">
                            <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-wide">Ganador</p>
                            <p className="font-black text-yellow-700 dark:text-yellow-400 text-xl leading-tight">{winner.name}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              }

              const winner = item.players?.find(p => p.position === 1);
              return (
                <motion.div key={item.id} variants={itemVariant}>
                  <Link to={`/history/${item.id}`} className="block bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-parchment-200/60 dark:border-zinc-700/60 hover:shadow-md hover:border-yellow-400 dark:hover:border-yellow-600 transition-all hover:scale-[1.02] transform duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-parchment-500 dark:text-parchment-400 uppercase tracking-wider bg-parchment-100/50 dark:bg-zinc-700/50 px-3 py-1 rounded-full border border-parchment-200 dark:border-zinc-600">
                        {formatDate(item.date)}
                      </span>
                      <div className="flex items-center gap-1.5 text-parchment-700 dark:text-parchment-300 text-sm font-bold bg-parchment-100/50 dark:bg-zinc-700/50 px-3 py-1 rounded-full border border-parchment-200 dark:border-zinc-600">
                        <Users className="w-4 h-4" />
                        {item.players?.length || 0}
                      </div>
                    </div>

                    {winner && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30">
                        <div className="p-2 bg-white dark:bg-zinc-800 text-yellow-500 rounded-full shadow-sm">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-yellow-700/80 dark:text-yellow-500/80 font-bold uppercase tracking-wide">Ganador</p>
                          <p className="font-extrabold text-yellow-950 dark:text-yellow-100 text-lg leading-tight">{winner.name}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-black text-yellow-600 dark:text-yellow-500 text-xl">{winner.totalScore}</p>
                          <p className="text-[9px] text-yellow-700/70 dark:text-yellow-600/70 font-bold uppercase tracking-widest mt-0.5">Pts</p>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
