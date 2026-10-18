import { motion } from 'framer-motion';
import { ArrowLeft, Award, Medal, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import leaderboardBg from '../assets/fonts/7wonders-wallpaper.jpg';
import { usePlayersStore } from '../store/players.store';

export default function Leaderboard() {
  const players = usePlayersStore((state) => state.players);

  // Sort players by Ranking Points, then First place wins, then Second
  const rankedPlayers = [...players].sort((a, b) => {
    const ptsA = a.stats.rankingPoints || 0;
    const ptsB = b.stats.rankingPoints || 0;
    if (ptsB !== ptsA) return ptsB - ptsA;
    if (b.stats.first !== a.stats.first) return b.stats.first - a.stats.first;
    return b.stats.second - a.stats.second;
  });

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-sm" />;
      case 1: return <Medal className="w-7 h-7 text-gray-400 drop-shadow-sm" />;
      case 2: return <Award className="w-7 h-7 text-orange-600 drop-shadow-sm" />;
      default: return <span className="text-xl font-bold text-parchment-400">{index + 1}</span>;
    }
  };

  const getRankBg = (index) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/30 dark:to-zinc-800 border-yellow-200 dark:border-yellow-700/50 shadow-yellow-100/50 dark:shadow-none';
      case 1: return 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-zinc-800 border-gray-200 dark:border-gray-700/50 shadow-gray-100/50 dark:shadow-none';
      case 2: return 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-zinc-800 border-orange-200 dark:border-orange-700/50 shadow-orange-100/50 dark:shadow-none';
      default: return 'bg-white dark:bg-zinc-800 border-parchment-200 dark:border-zinc-700';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div
      className="w-full min-h-[calc(100dvh-5rem)] bg-parchment-100 dark:bg-zinc-900 p-6 relative overflow-hidden transition-colors duration-300"
    >
      {/* Background Wallpaper */}
      <div
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url(${leaderboardBg})`,
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
          <h1 className="text-2xl font-extrabold text-parchment-950 dark:text-parchment-100">Clasificación</h1>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {rankedPlayers.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-parchment-300 dark:text-zinc-600 mb-4" />
            <p className="text-parchment-600 dark:text-parchment-400 font-medium">Aún no hay jugadores registrados.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {rankedPlayers.map((player, index) => (
              <motion.div key={player.id} variants={item} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/players/${player.id}`}
                  className={`flex items-center p-3 rounded-2xl border shadow-sm transition-colors ${getRankBg(index)}`}
                >
                  <div className="w-10 h-10 flex items-center justify-center mr-3">
                    {getRankIcon(index)}
                  </div>

                  <div className="w-12 h-12 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shadow-inner border-2 border-white dark:border-zinc-600 flex-shrink-0 relative">
                    {player.photoBase64 ? (
                      <img src={player.photoBase64} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-extrabold text-parchment-400 dark:text-zinc-500">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <p className="font-bold text-parchment-950 dark:text-parchment-100 text-base leading-tight">{player.name}</p>
                    <p className="text-xs font-semibold text-parchment-500 dark:text-parchment-400 mt-1 uppercase tracking-wider">
                      {player.stats.totalGames} Partidas
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-center ml-2">
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-xl text-yellow-600 dark:text-yellow-500">{player.stats.rankingPoints || 0}</span>
                      <span className="text-xs font-bold text-parchment-500 dark:text-parchment-400">pts</span>
                    </div>
                    {player.stats.tournamentsWon > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-parchment-600 dark:text-parchment-400">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span>{player.stats.tournamentsWon} Torneos</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
