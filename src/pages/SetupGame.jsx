import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Crown, Dices, Moon, Play, Plus, Settings, Sun, UserPlus, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useGameStore } from '../store/game.store';
import { usePlayersStore } from '../store/players.store';
import { useTournamentStore } from '../store/tournament.store';

import logoMesa from '../assets/icono/logo_mesa.png';

const WONDERS_DB = [
  { id: 'alejandria', name: 'Alexandria', expansion: 'base' },
  { id: 'babilonia', name: 'Babylon', expansion: 'base' },
  { id: 'efeso', name: 'Éphesos', expansion: 'base' },
  { id: 'guiza', name: 'Gizah', expansion: 'base' },
  { id: 'halicarnaso', name: 'Halikarnassos', expansion: 'base' },
  { id: 'olimpia', name: 'Olympía', expansion: 'base' },
  { id: 'rodas', name: 'Rhódos', expansion: 'base' },
  { id: 'bizancio', name: 'Byzantium', expansion: 'cities' },
  { id: 'petra', name: 'Petra', expansion: 'cities' },
  { id: 'roma', name: 'Roma', expansion: 'leaders' },
  { id: 'abusimbel', name: 'Abu Simbel', expansion: 'leaders' },
  { id: 'cartago', name: 'Carthage', expansion: 'edifice' },
  { id: 'ur', name: 'Ur', expansion: 'edifice' },
  { id: 'siracusa', name: 'Siracusa', expansion: 'armada' }
];

export default function SetupGame() {
  const navigate = useNavigate();
  const allPlayers = usePlayersStore((state) => state.players);
  
  const startGame = useGameStore(state => state.startGame);
  const isGameActive = useGameStore(state => state.isGameActive);
  const gamePlayers = useGameStore(state => state.players);
  const activeExpansions = useGameStore(state => state.activeExpansions);

  const { isActive: isTournamentActive, playerIds: tournamentPlayerIds, currentMatchIndex, totalMatches } = useTournamentStore();

  const [selectedPlayerIds, setSelectedPlayerIds] = useState(() => {
    if (isTournamentActive) return tournamentPlayerIds;
    if (isGameActive && gamePlayers?.length > 0) return gamePlayers.map(p => p.id);
    return [];
  });

  useEffect(() => {
    if (isTournamentActive && tournamentPlayerIds.length > 0) {
      setSelectedPlayerIds(tournamentPlayerIds);
    }
  }, [isTournamentActive, tournamentPlayerIds]);

  const [playerWonders, setPlayerWonders] = useState(() => {
    if (isGameActive && gamePlayers?.length > 0) {
      const wMap = {};
      gamePlayers.forEach(p => wMap[p.id] = p.wonder);
      return wMap;
    }
    return {};
  });

  const [expansions, setExpansions] = useState(() => {
    if (isGameActive && activeExpansions) {
      return activeExpansions;
    }
    return {
      leaders: false,
      cities: false,
      armada: false,
      edifice: false
    };
  });

  const activeWonders = useMemo(() => {
    const list = [];
    WONDERS_DB.forEach(w => {
      if (w.expansion === 'base' || expansions[w.expansion]) {
        list.push(`${w.name} (Día)`);
        list.push(`${w.name} (Noche)`);
      }
    });
    return list;
  }, [expansions]);

  // Modal States
  const [isExpansionsOpen, setIsExpansionsOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [wonderModalPlayerId, setWonderModalPlayerId] = useState(null); // ID of player to assign wonder

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

  const handleShuffle = () => {
    if (selectedPlayerIds.length < 2) return; // Nada que mezclar

    // 1. Mezclar asientos (Shuffle selectedPlayerIds)
    const shuffledIds = [...selectedPlayerIds];
    for (let i = shuffledIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledIds[i];
      shuffledIds[i] = shuffledIds[j];
      shuffledIds[j] = temp;
    }

    // 2. Elegir maravillas COMPLETAMENTE NUEVAS de la base de datos
    const availableDbWonders = WONDERS_DB.filter(w => 
      w.expansion === 'base' || expansions[w.expansion]
    );

    // Mezclar la DB disponible
    for (let i = availableDbWonders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableDbWonders[i], availableDbWonders[j]] = [availableDbWonders[j], availableDbWonders[i]];
    }

    // 3. Asignar maravillas nuevas y lados al azar a los asientos mezclados
    const newWondersMap = {};
    shuffledIds.forEach((id, index) => {
      // Por si hay más jugadores que maravillas (raro, pero como fallback)
      const w = availableDbWonders[index % availableDbWonders.length]; 
      const side = Math.random() > 0.5 ? 'Día' : 'Noche';
      newWondersMap[id] = `${w.name} (${side})`;
    });

    setSelectedPlayerIds(shuffledIds);
    setPlayerWonders(newWondersMap);
  };

  const handleStart = () => {
    if (selectedPlayerIds.length < 3) {
      alert("Selecciona al menos 3 jugadores.");
      return;
    }

    const allHaveWonders = selectedPlayerIds.every(id => playerWonders[id]);
    if (!allHaveWonders) {
      alert("Todos los jugadores deben tener una maravilla asignada.");
      return;
    }

    const finalWonders = {};
    selectedPlayerIds.forEach(id => {
      finalWonders[id] = playerWonders[id];
    });

    startGame(selectedPlayerIds, expansions, finalWonders, allPlayers);
    navigate('/score');
  };

  const availablePlayers = allPlayers.filter(p => !selectedPlayerIds.includes(p.id));
  const filteredAvailablePlayers = availablePlayers.filter(p => p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()));
  const seatedPlayers = selectedPlayerIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full bg-parchment-100 dark:bg-zinc-900 relative transition-colors duration-300"
    >
      <div className="max-w-md mx-auto p-6 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full text-parchment-900 dark:text-parchment-200 shadow hover:bg-white dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-black text-parchment-950 dark:text-parchment-100 tracking-tight">Nueva Partida</h1>
          <button onClick={() => setIsExpansionsOpen(true)} className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full text-parchment-900 dark:text-parchment-200 shadow hover:bg-white dark:hover:bg-zinc-700 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </header>

        {isTournamentActive && (
          <div className="bg-yellow-500 text-yellow-950 px-4 py-2 rounded-xl mb-6 text-center font-bold shadow-md shadow-yellow-500/20 border-2 border-yellow-600">
            TORNEO - Partida {currentMatchIndex} de {totalMatches}
          </div>
        )}

        {/* MESA REDONDA */}
        <div className={`relative w-full aspect-square max-w-[280px] sm:max-w-[320px] mx-auto ${isTournamentActive ? 'mb-12' : 'mb-24'} mt-6`}>
          {/* El centro de la mesa */}
          <div className="absolute inset-2 sm:inset-4 bg-gray-900 rounded-full shadow-2xl border-4 border-gray-800 flex items-center justify-center overflow-hidden">
            {/* Textura sutil o logo */}
            <div className="absolute inset-6 opacity-40" style={{ backgroundImage: `url(${logoMesa})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}></div>

            {selectedPlayerIds.length === 0 ? (
              <p className="text-gray-500 font-semibold text-center z-10 px-6">La mesa está vacía</p>
            ) : (
              <div className="z-10 text-center flex flex-col items-center">
                <button
                  onClick={handleShuffle}
                  disabled={selectedPlayerIds.length < 2}
                  className="group flex flex-col items-center justify-center p-3 rounded-full transition-transform active:scale-95 disabled:opacity-50 hover:bg-gray-800/50 pointer-events-auto"
                  title="Mezclar asientos y maravillas"
                >
                  <Dices className="w-10 h-10 text-gray-500 mb-1 group-hover:text-yellow-500 transition-colors" />
                </button>
              </div>
            )}
          </div>

          {/* Sillas (Jugadores) */}
          <>
            {seatedPlayers.map((player, index) => {
              if (!player) return null; // Avoid crashes if player is somehow undefined
              const total = seatedPlayers.length;
              // Calculamos el ángulo para distribuir equitativamente (empezando arriba: -90 deg)
              const angle = (index * (360 / total)) - 90;
              const radius = 135; // Radio reducido para que no se escapen de la pantalla
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * radius;
              const y = Math.sin(radian) * radius;

              const wonderString = playerWonders[player.id];
              const hasWonder = !!wonderString;
              let wonderCity = "";
              let isDay = true;

              if (hasWonder) {
                const parts = wonderString.split(" (");
                wonderCity = parts[0];
                isDay = parts[1]?.startsWith("Día");
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x, y }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                  style={{ zIndex: 20 + Math.round(Math.sin(radian) * 10) }}
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setWonderModalPlayerId(player.id)}
                    className="relative w-full h-full rounded-full overflow-hidden border-4 border-parchment-100 shadow-xl bg-parchment-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {player.photoBase64 ? (
                      <img src={player.photoBase64} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-extrabold text-parchment-500 text-xl">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.button>

                  {/* Indicador de si tiene maravilla elegida */}
                  {hasWonder ? (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-700 text-yellow-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-[1.5px] border-white whitespace-nowrap flex items-center gap-1 shadow-sm pointer-events-none z-10">
                      {wonderCity} {isDay ? <Sun className="w-3 h-3 fill-current" /> : <Moon className="w-3 h-3 fill-current" />}
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[9px] font-black uppercase px-1 py-0.5 rounded-full border border-white pointer-events-none z-10">
                      ¡Falta!
                    </div>
                  )}

                  {/* Etiqueta flotante con el nombre, posicionada para no tapar el avatar */}
                  <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-center w-24 pointer-events-none z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-parchment-950 text-xs font-bold px-2 py-0.5 rounded-md shadow-sm truncate block border border-white/50">
                      {player.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </>
        </div>

        {/* Controles debajo de la mesa (solo en modo libre) */}
        {!isTournamentActive && (
          <div className="flex justify-center items-center gap-4 mb-6">
            <Button
              variant={selectedPlayerIds.length >= 7 ? "secondary" : "primary"}
              disabled={selectedPlayerIds.length >= 7}
              onClick={() => { setIsAddPlayerOpen(true); setPlayerSearchQuery(""); }}
              className="w-full max-w-xs rounded-full shadow-lg py-2.5 text-base h-12"
            >
              <UserPlus className="w-5 h-5" />
              {selectedPlayerIds.length >= 7 ? "Mesa Llena" : "Sentar Jugador"}
            </Button>
          </div>
        )}


      </div>

      {/* FOOTER START BUTTON */}
      {selectedPlayerIds.length >= 3 && selectedPlayerIds.every(id => playerWonders[id]) && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-parchment-200 dark:border-zinc-800 z-30"
        >
          <Button
            variant="commercial"
            onClick={handleStart}
            className="w-full max-w-md mx-auto py-4 uppercase font-black text-lg tracking-wide rounded-2xl shadow-xl shadow-yellow-500/20"
          >
            <Play className="w-6 h-6 fill-current" /> Siguiente: Puntuación
          </Button>
        </motion.div>
      )}

      {/* MODAL: EXPANSIONES */}
      <AnimatePresence>
        {isExpansionsOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pb-24 sm:pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsExpansionsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between bg-parchment-50 dark:bg-zinc-900">
                <h3 className="text-xl font-black text-parchment-950 dark:text-parchment-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Expansiones
                </h3>
                <button onClick={() => setIsExpansionsOpen(false)} className="p-2 bg-gray-200/50 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh] pb-8">
                {Object.keys(expansions).map(exp => (
                  <label key={exp} className="flex items-center justify-between p-3 bg-parchment-50/50 dark:bg-zinc-700/50 rounded-xl cursor-pointer hover:bg-parchment-100 dark:hover:bg-zinc-600 transition-colors border border-parchment-200 dark:border-zinc-600">
                    <span className="font-bold text-base text-parchment-800 dark:text-parchment-200 capitalize tracking-wide">{exp}</span>
                    <div className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${expansions[exp] ? 'bg-yellow-600' : 'bg-parchment-300 dark:bg-zinc-500'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${expansions[exp] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <input
                      type="checkbox"
                      checked={expansions[exp]}
                      onChange={(e) => setExpansions({ ...expansions, [exp]: e.target.checked })}
                      className="hidden"
                    />
                  </label>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <h3 className="text-xl font-black text-parchment-950 dark:text-parchment-100">Invitar a la Mesa</h3>
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

      {/* MODAL: ASSIGN WONDER */}
      <AnimatePresence>
        {wonderModalPlayerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setWonderModalPlayerId(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl p-6"
            >
              <button
                onClick={() => setWonderModalPlayerId(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-parchment-200 overflow-hidden border-4 border-parchment-100 shadow-md mb-3">
                  {(() => {
                    const p = allPlayers.find(pl => pl.id === wonderModalPlayerId);
                    return p?.photoBase64
                      ? <img src={p.photoBase64} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center font-bold text-parchment-500 text-2xl">{p?.name.charAt(0).toUpperCase()}</div>;
                  })()}
                </div>
                <h3 className="text-xl font-black text-parchment-950 text-center">
                  Maravilla de {allPlayers.find(pl => pl.id === wonderModalPlayerId)?.name.split(' ')[0]}
                </h3>
              </div>

              <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2 pb-2">
                {activeWonders.map(wonder => {
                  const isSelected = playerWonders[wonderModalPlayerId] === wonder;
                  // Check if another player has this wonder (or the other side of it)
                  const baseName = wonder.split(' (')[0];
                  const isTaken = Object.entries(playerWonders).some(([id, w]) => w.split(' (')[0] === baseName && id !== wonderModalPlayerId);

                  return (
                    <motion.button
                      whileTap={!isTaken ? { scale: 0.98 } : {}}
                      key={wonder}
                      disabled={isTaken}
                      onClick={() => {
                        setPlayerWonders(prev => ({ ...prev, [wonderModalPlayerId]: wonder }));
                        setWonderModalPlayerId(null);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${isSelected
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-sm'
                        : isTaken
                          ? 'border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 opacity-50 cursor-not-allowed'
                          : 'border-transparent bg-parchment-50 dark:bg-zinc-700/50 hover:bg-parchment-100 dark:hover:bg-zinc-700'
                        }`}
                    >
                      <span className={`font-bold ${isSelected ? 'text-yellow-900 dark:text-yellow-500' : isTaken ? 'text-gray-400 dark:text-gray-500' : 'text-parchment-900 dark:text-parchment-200'}`}>
                        {wonder}
                      </span>
                      {isSelected && <Crown className="w-5 h-5 text-yellow-500" />}
                      {isTaken && <span className="text-xs font-semibold text-red-400 uppercase">Ocupada</span>}
                    </motion.button>
                  );
                })}
              </div>

              {/* Opción de quitar al jugador */}
              {!isTournamentActive && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      togglePlayer(wonderModalPlayerId);
                      setWonderModalPlayerId(null);
                      // Also clear wonder
                      setPlayerWonders(prev => {
                        const newWonders = { ...prev };
                        delete newWonders[wonderModalPlayerId];
                        return newWonders;
                      });
                    }}
                  >
                    Levantar de la mesa
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
