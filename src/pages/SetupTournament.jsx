import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlayersStore } from '../store/players.store';
import { useTournamentStore } from '../store/tournament.store';
import { ArrowLeft, Play, X, Trophy, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';

export default function SetupTournament() {
  const navigate = useNavigate();
  const allPlayers = usePlayersStore((state) => state.players);
  const startTournament = useTournamentStore((state) => state.startTournament);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [totalMatches, setTotalMatches] = useState(3);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  const togglePlayer = (id) => {
    setSelectedPlayerIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        if (prev.length >= 7) {
          alert("Máximo 7 jugadores.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleStart = () => {
    if (selectedPlayerIds.length < 3) {
      alert("Selecciona al menos 3 jugadores.");
      return;
    }
    
    startTournament(selectedPlayerIds, totalMatches);
    navigate('/setup'); // Go to standard setup where players are locked and they pick wonders
  };

  const availablePlayers = useMemo(() => {
    return allPlayers
      .filter(p => !selectedPlayerIds.includes(p.id))
      .sort((a, b) => {
        const aMatches = ((a.stats?.first || 0) + (a.stats?.second || 0) + (a.stats?.third || 0)) || 0;
        const bMatches = ((b.stats?.first || 0) + (b.stats?.second || 0) + (b.stats?.third || 0)) || 0;
        return bMatches - aMatches;
      });
  }, [allPlayers, selectedPlayerIds]);

  const filteredAvailablePlayers = availablePlayers.filter(p => p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()));

  const seatedPlayers = selectedPlayerIds.map(id => allPlayers.find(p => p.id === id));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-parchment-100 dark:bg-zinc-900 pb-24 relative overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-md mx-auto p-6 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full text-parchment-900 dark:text-parchment-200 shadow hover:bg-white dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-black text-parchment-950 dark:text-parchment-100 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Nuevo Torneo
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Cantidad de partidas */}
        <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-3xl p-6 shadow-sm border border-parchment-200/50 dark:border-zinc-700 mb-8">
          <h2 className="text-lg font-bold text-parchment-900 dark:text-parchment-100 mb-4 text-center">
            Cantidad de Partidas
          </h2>
          <div className="flex items-center justify-center gap-6">
            <Button 
              variant="secondary" 
              onClick={() => setTotalMatches(m => Math.max(1, m - 1))}
              className="w-14 h-14 rounded-full p-0"
            >
              <Minus className="w-6 h-6" />
            </Button>
            <div className="text-5xl font-black text-parchment-950 dark:text-parchment-100 w-16 text-center">
              {totalMatches}
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setTotalMatches(m => Math.min(10, m + 1))}
              className="w-14 h-14 rounded-full p-0"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-center text-sm text-parchment-600 dark:text-parchment-400 mt-4 font-medium">
            El ganador recibirá <span className="font-bold text-yellow-600">+{totalMatches} puntos</span> extra en el ranking al finalizar.
          </p>
        </section>

        {/* Jugadores fijos */}
        <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-3xl p-6 shadow-sm border border-parchment-200/50 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-parchment-900 dark:text-parchment-100">
              Jugadores ({selectedPlayerIds.length}/7)
            </h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => { setIsAddPlayerOpen(true); setPlayerSearchQuery(""); }}
              disabled={selectedPlayerIds.length >= 7}
              className="rounded-full w-auto h-9 min-h-0 px-4 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {seatedPlayers.length === 0 ? (
              <p className="text-center text-parchment-500 py-4 font-medium">Aún no hay jugadores sentados para el torneo.</p>
            ) : (
              seatedPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-parchment-50 dark:bg-zinc-700/50 rounded-xl border border-parchment-200 dark:border-zinc-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-parchment-200 dark:bg-zinc-600 overflow-hidden shrink-0 border border-parchment-300">
                      {player.photoBase64 ? (
                        <img src={player.photoBase64} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-parchment-500">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-parchment-900 dark:text-parchment-100">{player.name}</span>
                  </div>
                  <button onClick={() => togglePlayer(player.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* FOOTER START BUTTON */}
      {selectedPlayerIds.length >= 3 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-parchment-200 dark:border-zinc-800 z-30"
        >
          <Button 
            size="lg"
            variant="commercial"
            onClick={handleStart}
            className="w-full max-w-md mx-auto py-4 uppercase font-black text-lg tracking-wide rounded-2xl shadow-xl shadow-yellow-500/20"
          >
            <Play className="w-6 h-6 fill-current" /> Siguiente: Maravillas
          </Button>
        </motion.div>
      )}

      {/* MODAL: ADD PLAYER */}
      <AnimatePresence>
        {isAddPlayerOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pb-24 sm:pb-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAddPlayerOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-parchment-50 dark:bg-zinc-900 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-parchment-950 dark:text-parchment-100">Invitar al Torneo</h3>
                  <button onClick={() => setIsAddPlayerOpen(false)} className="p-2 bg-gray-200/50 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Buscar jugador..."
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-parchment-300 dark:border-zinc-600 rounded-xl pl-4 pr-10 py-3 text-parchment-900 dark:text-parchment-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
                  />
                  {playerSearchQuery && (
                    <button
                      onClick={() => setPlayerSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-zinc-700 rounded-full text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-y-auto p-4 space-y-2">
                {filteredAvailablePlayers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 font-medium">No se encontraron jugadores.</p>
                ) : (
                  filteredAvailablePlayers.map(p => (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      key={p.id}
                      onClick={() => {
                        togglePlayer(p.id);
                        if (selectedPlayerIds.length + 1 >= 7) setIsAddPlayerOpen(false); // Close if full
                      }}
                      className="w-full flex items-center gap-4 p-3 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-sm hover:shadow-md hover:border-parchment-300 dark:hover:border-zinc-600 transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                        {p.photoBase64 ? (
                          <img src={p.photoBase64} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-parchment-500 text-lg">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-parchment-900 dark:text-parchment-100 text-lg flex-1">{p.name}</span>
                      <div className="p-2 bg-parchment-100 dark:bg-zinc-700 rounded-full text-parchment-700 dark:text-parchment-300">
                        <Plus className="w-5 h-5" />
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
