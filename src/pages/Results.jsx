import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/game.store';
import { usePlayersStore } from '../store/players.store';
import { useHistoryStore } from '../store/history.store';
import { useTournamentStore } from '../store/tournament.store';
import { Trophy, Home, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Results() {
  const navigate = useNavigate();
  const { isGameActive, players, activeExpansions, endGame } = useGameStore();
  const updatePlayerStats = usePlayersStore(state => state.updatePlayerStats);
  const updateTournamentStats = usePlayersStore(state => state.updateTournamentStats);
  const addGameToHistory = useHistoryStore(state => state.addGameToHistory);
  const addTournamentToHistory = useHistoryStore(state => state.addTournamentToHistory);
  const tournamentStore = useTournamentStore();

  const results = useMemo(() => {
    if (!isGameActive) return [];

    return players.map(p => {
      const s = p.scores;
      
      const coinsPoints = Math.floor((s.treasury || 0) / 3);
      const sciencePoints = s.science.total || 0;
      const debtPoints = (s.debt || 0) > 0 ? -(s.debt) : (s.debt || 0);

      const totalScore = 
        (s.military || 0) + 
        coinsPoints + 
        (s.wonders || 0) + 
        (s.civilian || 0) + 
        sciencePoints + 
        (s.commercial || 0) + 
        (s.guilds || 0) + 
        (s.leaders || 0) + 
        (s.cities || 0) + 
        debtPoints + 
        (s.naval || 0) + 
        (s.islands || 0) + 
        (s.edifice || 0);

      const flatScores = { ...s, treasury: coinsPoints, science: sciencePoints, debt: debtPoints };

      return {
        ...p,
        totalScore,
        coins: s.treasury || 0,
        flatScores
      };
    }).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.coins - a.coins;
    }).map((p, index) => ({ ...p, position: index + 1 }));
  }, [players, isGameActive]);

  if (!isGameActive) {
    return <div className="p-6 text-center">No hay partida activa. <button onClick={() => navigate('/')} className="text-blue-500 underline">Volver al inicio</button></div>;
  }

  const handleFinish = () => {
    // 1. Calculate ranking points and update player stats
    const rankingPointsAwarded = {};
    results.forEach(res => {
      const pts = Math.max(0, results.length - res.position);
      rankingPointsAwarded[res.id] = pts;

      updatePlayerStats(res.id, {
        position: res.position,
        wonderUsed: res.wonder,
        scores: res.flatScores,
        rankingPoints: pts
      });
    });

    const matchRecord = {
      expansions: activeExpansions,
      players: results.map(r => ({
        id: r.id,
        name: r.name,
        wonder: r.wonder,
        totalScore: r.totalScore,
        position: r.position,
        rankingPoints: rankingPointsAwarded[r.id],
        scores: r.flatScores
      }))
    };

    if (tournamentStore.isActive) {
      tournamentStore.addMatchResult(matchRecord, rankingPointsAwarded);
      
      const isLastMatch = tournamentStore.currentMatchIndex >= tournamentStore.totalMatches;
      
      if (isLastMatch) {
        // Tournament is over! Calculate winner based on accumulated ranking points
        // We need to use the newly updated accumulated points
        const finalRanking = { ...tournamentStore.accumulatedRankingPoints };
        Object.keys(rankingPointsAwarded).forEach(id => {
          finalRanking[id] = (finalRanking[id] || 0) + rankingPointsAwarded[id];
        });

        const sortedPlayers = Object.keys(finalRanking).sort((a, b) => {
          if (finalRanking[b] !== finalRanking[a]) return finalRanking[b] - finalRanking[a];
          // tie breaker: accumulated raw scores (if we updated them, which addMatchResult will do)
          return (tournamentStore.accumulatedScores[b] || 0) - (tournamentStore.accumulatedScores[a] || 0);
        });

        const winnerId = sortedPlayers[0];
        const bonusPts = tournamentStore.totalMatches;

        // Update winner bonus
        tournamentStore.playerIds.forEach(pid => {
          updateTournamentStats(pid, {
            wonTournament: pid === winnerId,
            bonusPoints: pid === winnerId ? bonusPts : 0
          });
        });

        // Save tournament to history
        addTournamentToHistory({
          totalMatches: tournamentStore.totalMatches,
          matchHistory: [...tournamentStore.matchHistory, matchRecord],
          playerIds: tournamentStore.playerIds,
          winnerId,
          bonusPts
        });

        tournamentStore.endTournament();
        endGame();
        navigate('/'); // Later we could navigate to a TournamentResults view
      } else {
        // Next match in tournament
        endGame();
        navigate('/setup');
      }
    } else {
      // Normal single game
      addGameToHistory(matchRecord);
      endGame();
      navigate('/');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-parchment-100 dark:bg-zinc-900 p-6 pb-24 transition-colors duration-300"
    >
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8 pt-4">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-3xl font-extrabold text-parchment-950 dark:text-parchment-100">Resultados Finales</h1>
        </header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {results.map((player) => (
            <motion.div 
              key={player.id} 
              variants={item}
              className={clsx(
                "bg-white dark:bg-zinc-800 rounded-2xl shadow-md border-2 p-4 flex items-center gap-4 relative overflow-hidden transition-colors",
                player.position === 1 ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600/80" : 
                player.position === 2 ? "border-slate-300 dark:border-slate-600" : 
                player.position === 3 ? "border-orange-300 dark:border-orange-700/80" : "border-parchment-200 dark:border-zinc-700"
              )}
            >
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 text-white",
                player.position === 1 ? "bg-yellow-400 shadow-lg" : 
                player.position === 2 ? "bg-slate-400" : 
                player.position === 3 ? "bg-orange-400" : "bg-parchment-300 dark:bg-zinc-600 text-parchment-800 dark:text-zinc-200"
              )}>
                {player.position}
              </div>

              <div className="w-12 h-12 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                {player.photoBase64 && <img src={player.photoBase64} alt={player.name} className="w-full h-full object-cover" />}
              </div>

              <div className="flex-1">
                <h2 className="font-bold text-lg text-parchment-950 dark:text-parchment-100 leading-tight">{player.name}</h2>
                <p className="text-xs text-parchment-600 dark:text-parchment-400">{player.wonder}</p>
                <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 mt-1 uppercase">+{Math.max(0, results.length - player.position)} pts de Liga</p>
              </div>

              <div className="text-3xl font-black text-parchment-900 dark:text-parchment-100 pr-2">
                {player.totalScore}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-parchment-200 dark:border-zinc-800 z-40">
        <Button 
          size="lg"
          variant="primary"
          onClick={handleFinish}
          className="w-full max-w-md mx-auto py-4 rounded-xl shadow-lg font-bold text-lg"
        >
          {tournamentStore.isActive && tournamentStore.currentMatchIndex < tournamentStore.totalMatches ? (
            <><Play className="w-6 h-6 fill-current" /> Siguiente Partida</>
          ) : (
            <><Home className="w-6 h-6" /> Guardar y Salir</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
