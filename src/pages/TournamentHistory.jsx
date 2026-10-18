import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useHistoryStore } from '../store/history.store';
import { usePlayersStore } from '../store/players.store';

export default function TournamentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tournaments = useHistoryStore(state => state.tournaments);
  const globalPlayers = usePlayersStore(state => state.players);

  const tournament = useMemo(() => tournaments.find(t => t.id === id), [tournaments, id]);

  // Calculate global leaderboard
  const globalLeaderboard = useMemo(() => {
    if (!tournament || !tournament.matchHistory) return [];
    const scores = {};
    tournament.matchHistory.forEach(match => {
      match.players.forEach(p => {
        if (!scores[p.id]) {
          scores[p.id] = {
            id: p.id,
            name: p.name,
            totalScore: 0,
            rankingPoints: 0,
            matchesPlayed: 0
          };
        }
        scores[p.id].totalScore += p.totalScore;
        scores[p.id].rankingPoints += (p.rankingPoints || 0);
        scores[p.id].matchesPlayed += 1;
      });
    });

    return Object.values(scores).sort((a, b) => {
      if (b.rankingPoints !== a.rankingPoints) {
        return b.rankingPoints - a.rankingPoints;
      }
      return b.totalScore - a.totalScore;
    });
  }, [tournament]);

  if (!tournament) {
    return (
      <div className="min-h-screen bg-parchment-100 dark:bg-zinc-900 p-6 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-parchment-900 dark:text-parchment-100 mb-4">Torneo no encontrado</p>
        <button onClick={() => navigate('/history')} className="px-6 py-2 bg-yellow-500 text-yellow-950 font-bold rounded-xl shadow-md">
          Volver al Historial
        </button>
      </div>
    );
  }

  const winner = globalPlayers.find(p => p.id === tournament.winnerId);

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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-parchment-100 dark:bg-zinc-900 p-6 pb-20 transition-colors duration-300">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/history')} className="p-2 bg-white dark:bg-zinc-800 rounded-full text-parchment-900 dark:text-parchment-200 shadow-sm border border-parchment-200 dark:border-zinc-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-parchment-950 dark:text-parchment-100 tracking-wide uppercase">Detalles del Torneo</h1>
          <div className="w-10"></div>
        </header>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm border border-parchment-200 dark:border-zinc-700 p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-700 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full mb-4">
            <Clock className="w-3 h-3" />
            {formatDate(tournament.date).split(',')[0]}
          </span>
          
          {winner && (
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-800 mb-3 text-white">
                <Trophy className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-parchment-500 dark:text-parchment-400 uppercase tracking-widest mb-1">Campeón Global</p>
              <h2 className="text-3xl font-black text-parchment-950 dark:text-parchment-100">{winner.name}</h2>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 font-bold mt-1">+{tournament.bonusPts} pts de liga extra</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-parchment-100 dark:border-zinc-700 pt-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-parchment-400">Partidas Jugadas</p>
              <p className="text-xl font-black text-parchment-800 dark:text-parchment-200">{tournament.totalMatches}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-parchment-400">Jugadores</p>
              <p className="text-xl font-black text-parchment-800 dark:text-parchment-200">{tournament.playerIds.length}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-black text-parchment-950 dark:text-parchment-100 mb-4 px-2">Tabla Global</h3>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-parchment-200 dark:border-zinc-700 overflow-hidden mb-8">
          {globalLeaderboard.map((p, index) => {
            const isWinner = index === 0;
            return (
              <div key={p.id} className={`flex items-center gap-4 p-4 border-b border-parchment-100 dark:border-zinc-700/50 last:border-0 ${isWinner ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  isWinner ? 'bg-yellow-400 text-yellow-950' : 
                  index === 1 ? 'bg-gray-300 text-gray-800' :
                  index === 2 ? 'bg-orange-300 text-orange-950' :
                  'bg-parchment-100 dark:bg-zinc-700 text-parchment-600 dark:text-parchment-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-parchment-950 dark:text-parchment-100 text-lg leading-tight">{p.name}</h4>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl text-yellow-600 dark:text-yellow-500">{p.rankingPoints} <span className="text-xs uppercase font-bold">pts liga</span></div>
                  <div className="text-xs font-semibold text-parchment-500 dark:text-parchment-400">{p.totalScore} pts victoria</div>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="text-lg font-black text-parchment-950 dark:text-parchment-100 mb-4 px-2">Historial de Partidas</h3>
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {tournament.matchHistory.map((match, index) => {
            const matchWinner = match.players?.find(p => p.position === 1);
            return (
              <motion.div key={match.id || index} variants={itemAnim}>
                <Link to={`/history/${match.id}`} className="block bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-parchment-200 dark:border-zinc-700 hover:border-yellow-400 dark:hover:border-yellow-600 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-parchment-500 dark:text-parchment-400 uppercase tracking-wider">
                      Mesa {tournament.matchHistory.length - index}
                    </span>
                    <span className="text-xs font-semibold text-parchment-400 dark:text-zinc-500">
                      {match.players?.length} Jugadores
                    </span>
                  </div>
                  {matchWinner && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-parchment-100 dark:border-zinc-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥇</span>
                        <span className="font-bold text-parchment-900 dark:text-parchment-100">{matchWinner.name}</span>
                      </div>
                      <div className="font-black text-parchment-600 dark:text-parchment-300">
                        {matchWinner.totalScore} pts
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
