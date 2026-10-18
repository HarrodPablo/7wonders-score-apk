import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, Medal, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useHistoryStore } from '../store/history.store';

const CATEGORIES = [
  { id: 'military', label: 'Militar', color: 'text-red-600', bg: 'bg-red-100' },
  { id: 'treasury', label: 'Monedas', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { id: 'wonders', label: 'Maravilla', color: 'text-amber-700', bg: 'bg-amber-100' },
  { id: 'civilian', label: 'Civil', color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'science', label: 'Ciencia', color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'commercial', label: 'Comercial', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 'guilds', label: 'Gremios', color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'leaders', label: 'Líderes', color: 'text-gray-100', bg: 'bg-gray-800' },
  { id: 'cities', label: 'Ciudades', color: 'text-gray-800', bg: 'bg-gray-300' },
  { id: 'debt', label: 'Deuda', color: 'text-red-800', bg: 'bg-red-200' },
  { id: 'naval', label: 'Armada', color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { id: 'islands', label: 'Islas', color: 'text-teal-600', bg: 'bg-teal-100' },
  { id: 'edifice', label: 'Edificios', color: 'text-orange-600', bg: 'bg-orange-100' }
];

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const games = useHistoryStore(state => state.games);
  const tournaments = useHistoryStore(state => state.tournaments);

  const game = useMemo(() => {
    let found = games.find(g => g.id === id);
    if (!found) {
      for (const t of tournaments) {
        found = t.matchHistory.find(m => m.id === id);
        if (found) break;
      }
    }
    return found;
  }, [games, tournaments, id]);

  if (!game) {
    return (
      <div className="min-h-screen bg-parchment-100 dark:bg-zinc-900 p-6 flex flex-col items-center justify-center transition-colors">
        <p className="text-xl font-bold text-parchment-800 dark:text-parchment-200 mb-4">Partida no encontrada</p>
        <button onClick={() => navigate('/history')} className="px-6 py-2 bg-parchment-800 dark:bg-parchment-200 text-white dark:text-parchment-900 font-bold rounded-xl">Volver al Historial</button>
      </div>
    );
  }

  // Filter categories that have at least one non-zero value in this game, plus expansions check
  const activeCategories = CATEGORIES.filter(cat => {
    if (cat.id === 'leaders' && !game.expansions?.leaders) return false;
    if (cat.id === 'cities' && !game.expansions?.cities) return false;
    if (cat.id === 'debt' && !game.expansions?.cities) return false;
    if (cat.id === 'naval' && !game.expansions?.armada) return false;
    if (cat.id === 'islands' && !game.expansions?.armada) return false;
    if (cat.id === 'edifice' && !game.expansions?.edifice) return false;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-parchment-100 dark:bg-zinc-900 pb-12 transition-colors duration-300"
    >
      <header className="bg-parchment-900 dark:bg-zinc-950 text-parchment-50 p-6 shadow-xl sticky top-0 z-30 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/history" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight">Detalles de Partida</h1>
            <p className="text-xs text-parchment-300 dark:text-zinc-400 flex items-center justify-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> {formatDate(game.date)}
            </p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-6 mt-4">
        {/* PODIUM SUMMARY */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-parchment-900 dark:text-parchment-100 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Podio Final
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
          >
            {game.players.slice(0, 3).map((player) => (
              <motion.div
                key={player.id}
                variants={item}
                className={`p-3 rounded-2xl shadow-sm border ${player.position === 1 ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700/50' :
                    player.position === 2 ? 'bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800/40 dark:to-gray-700/40 border-gray-300 dark:border-gray-600/50' :
                      'bg-gradient-to-br from-orange-50 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                      {player.position === 1 ? <Trophy className="w-4 h-4 text-yellow-500" /> : <Medal className={`w-4 h-4 ${player.position === 2 ? 'text-gray-400 dark:text-gray-300' : 'text-orange-600 dark:text-orange-500'}`} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-parchment-950 dark:text-parchment-100 leading-tight">{player.name}</p>
                      <p className="text-[10px] text-parchment-600 dark:text-parchment-400 uppercase font-semibold">{player.wonder}</p>
                    </div>
                  </div>
                  <div className="text-xl font-black text-parchment-900 dark:text-parchment-100 drop-shadow-sm pr-1">
                    {player.totalScore}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* DETAILED SCORE MATRIX */}
        <div>
          <h2 className="text-xl font-black text-parchment-900 dark:text-parchment-100 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-parchment-600 dark:text-parchment-400" /> Desglose Analítico
          </h2>

          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg border border-parchment-200 dark:border-zinc-700 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-parchment-600 dark:text-parchment-400 uppercase bg-parchment-50 dark:bg-zinc-900 border-b border-parchment-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-4 py-4 font-black whitespace-nowrap sticky left-0 bg-parchment-50 dark:bg-zinc-900 z-20 border-r border-parchment-200 dark:border-zinc-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Categoría
                    </th>
                    {game.players.map(p => (
                      <th key={p.id} className="px-4 py-4 font-black text-center whitespace-nowrap min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className={p.position === 1 ? 'text-yellow-600 dark:text-yellow-500' : 'text-parchment-900 dark:text-parchment-100'}>{p.name}</span>
                          <span className="text-[10px] bg-parchment-200 dark:bg-zinc-700 text-parchment-600 dark:text-parchment-400 px-2 py-0.5 rounded-full">{p.totalScore} pts</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment-100 dark:divide-zinc-700/50">
                  {activeCategories.map(cat => {
                    let maxScore = -Infinity;
                    if (cat.id !== 'debt') {
                      game.players.forEach(p => {
                        const score = p.scores?.[cat.id] || 0;
                        if (score > maxScore) maxScore = score;
                      });
                    }

                    return (
                      <tr key={cat.id} className="hover:bg-parchment-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                        <td className={`px-4 py-3 font-bold sticky left-0 z-10 border-r border-parchment-200 dark:border-zinc-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-800`}>
                          <span className={`inline-block px-2 py-1 rounded text-[11px] uppercase tracking-wider ${cat.bg} ${cat.color} dark:bg-opacity-20`}>
                            {cat.label}
                          </span>
                        </td>
                        {game.players.map(p => {
                          const score = p.scores?.[cat.id] || 0;
                          const isMax = score === maxScore && score > 0;
                          return (
                            <td key={p.id} className="px-4 py-3 text-center text-parchment-800 dark:text-parchment-200">
                              {score !== 0 ? (
                                <span className={isMax ? `font-black text-[15px] ${cat.color}` : 'font-semibold'}>
                                  {score} {isMax && '⭐'}
                                </span>
                              ) : (
                                <span className="text-gray-300 dark:text-zinc-600">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Fila de Totales */}
                  <tr className="bg-parchment-900 dark:bg-zinc-950 text-white">
                    <td className="px-4 py-4 font-black sticky left-0 bg-parchment-900 dark:bg-zinc-950 z-10 border-r border-parchment-800 dark:border-zinc-800">
                      TOTAL
                    </td>
                    {game.players.map(p => (
                      <td key={p.id} className="px-4 py-4 text-center font-black text-lg">
                        {p.totalScore}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
