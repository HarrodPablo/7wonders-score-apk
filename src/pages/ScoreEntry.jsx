import clsx from 'clsx';
import { Check, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/game.store';
import { usePlayersStore } from '../store/players.store';
import { calculateMaxScienceScore } from '../utils/scienceCalculator';

import grecaBorderImg from '../assets/icono/greca_border.png';
import compasImg from '../assets/icono/mason.svg';
import scienceImg from '../assets/icono/science.svg';
import papiroImg from '../assets/icono/script.svg';
import { Button } from '../components/ui/Button';

const BASE_CATEGORIES = [
  { id: 'military', name: 'Militar', color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  { id: 'treasury', name: 'Tesoro', color: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-500', isCoins: true },
  { id: 'wonders', name: 'Maravilla', color: 'bg-stone-400', text: 'text-stone-500', border: 'border-stone-400' },
  { id: 'civilian', name: 'Civil', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { id: 'science', name: 'Ciencia', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', isSpecial: true },
  { id: 'commercial', name: 'Comercial', color: 'bg-yellow-400', text: 'text-yellow-500', border: 'border-yellow-400' },
  { id: 'guilds', name: 'Gremios', color: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' }
];

export default function ScoreEntry() {
  const navigate = useNavigate();
  const { isGameActive, activeExpansions, players, setPlayerScore, setPlayerScienceObject } = useGameStore();
  const globalPlayers = usePlayersStore((state) => state.players);
  const [currentStep, setCurrentStep] = useState(0);

  const categories = useMemo(() => {
    let cats = [...BASE_CATEGORIES];
    if (activeExpansions.leaders) cats.push({ id: 'leaders', name: 'Líderes', color: 'bg-zinc-200', text: 'text-zinc-600', border: 'border-zinc-300' });
    if (activeExpansions.cities) {
      cats.push({ id: 'debt', name: 'Deuda', color: 'bg-zinc-600', text: 'text-zinc-600', border: 'border-zinc-600', headerText: 'text-white' });
      cats.push({ id: 'cities', name: 'Ciudades', color: 'bg-zinc-900', text: 'text-zinc-900', border: 'border-zinc-900', headerText: 'text-white' });
    }
    if (activeExpansions.armada) {
      cats.push({ id: 'naval', name: 'Naval', color: 'bg-sky-600', text: 'text-sky-600', border: 'border-sky-600' });
      cats.push({ id: 'islands', name: 'Islas', color: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500' });
    }
    if (activeExpansions.edifice) {
      cats.push({ id: 'edifice', name: 'Edificios', color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' });
    }
    return cats;
  }, [activeExpansions]);

  if (!isGameActive) {
    return <div className="p-6 text-center">No hay partida activa. <button onClick={() => navigate('/setup')} className="text-blue-500 underline">Ir a Setup</button></div>;
  }

  const category = categories[currentStep];

  const handleNext = () => {
    if (currentStep < categories.length - 1) setCurrentStep(c => c + 1);
    else navigate('/results');
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    } else {
      navigate('/setup');
    }
  };

  const handleValueChange = (playerId, delta) => {
    const current = players.find(p => p.id === playerId).scores[category.id];
    let nextVal = current + delta;
    if (category.id !== 'debt' && category.id !== 'military') {
      nextVal = Math.max(0, nextVal); // Most categories can't be negative, except debt and military
    }
    setPlayerScore(playerId, category.id, nextVal);
  };

  const handleScienceChange = (playerId, symbol, delta) => {
    const currentObj = players.find(p => p.id === playerId).scores.science;
    const nextVal = Math.max(0, currentObj[symbol] + delta);
    const newObj = { ...currentObj, [symbol]: nextVal };
    newObj.total = calculateMaxScienceScore(newObj);
    setPlayerScienceObject(playerId, newObj);
  };

  return (
    <div className="min-h-screen bg-parchment-100 dark:bg-zinc-900 flex flex-col transition-colors duration-300">
      <header
        className={`relative py-8 px-6 text-center ${category.headerText || 'text-zinc-950'} ${category.color} shadow-md transition-colors duration-300`}
        style={{
          backgroundImage: `url(${grecaBorderImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >

        <div className="relative z-10">
          <h1 className="text-3xl font-bold uppercase tracking-widest">{category.name}</h1>
          <p className="text-sm opacity-90 mt-2 font-medium">Paso {currentStep + 1} de {categories.length}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {players.map(player => {
          const globalPlayer = globalPlayers.find(p => p.id === player.id);
          const photoToUse = globalPlayer?.photoBase64;
          return (
            <div key={player.id} className={clsx("bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border-2 transition-colors", category.border)}>
              {!category.isSpecial ? (
                <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center">
                  {/* ROW 1: Info & Total */}
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shrink-0 border border-parchment-300 dark:border-zinc-600">
                      {photoToUse ? (
                        <img src={photoToUse} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-2 text-parchment-600 dark:text-parchment-400" />
                      )}
                    </div>
                  </div>
                  <div className="mb-3 px-1">
                    <h3 className="font-bold text-parchment-950 dark:text-parchment-100 leading-tight">{player.name}</h3>
                    <p className="text-xs text-parchment-600 dark:text-parchment-400">{player.wonder}</p>
                  </div>
                  <div className="flex justify-center mb-3">
                    <div className={clsx("text-3xl font-black", category.text)}>
                      {category.isCoins
                        ? Math.floor(player.scores[category.id] / 3)
                        : player.scores[category.id]}
                    </div>
                  </div>

                  {/* ROW 2: Controls */}
                  <div className="flex justify-center">
                    <Button variant="secondary" onClick={() => handleValueChange(player.id, -1)} className="w-12 h-12 rounded-full p-0 font-bold text-2xl shrink-0">-</Button>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={player.scores[category.id] === 0 ? '' : player.scores[category.id]}
                      placeholder="0"
                      onChange={(e) => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val)) val = 0;
                        if (category.id !== 'debt' && category.id !== 'military') {
                          val = Math.max(0, val);
                        }
                        setPlayerScore(player.id, category.id, val);
                      }}
                      className="w-full max-w-[100px] text-center font-black text-3xl bg-transparent border-b-2 border-transparent hover:border-parchment-300 dark:hover:border-zinc-600 focus:border-yellow-500 focus:outline-none text-parchment-900 dark:text-parchment-100 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {category.isCoins && <span className="text-[10px] font-bold text-parchment-500 uppercase tracking-widest mt-1">monedas</span>}
                  </div>
                  <div className="flex justify-center">
                    <Button variant="primary" onClick={() => handleValueChange(player.id, 1)} className="w-12 h-12 rounded-full p-0 font-bold text-2xl shrink-0">+</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-3">
                    <div className="w-16 flex justify-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shrink-0 border border-parchment-300 dark:border-zinc-600">
                        {photoToUse ? (
                          <img src={photoToUse} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-full h-full p-2 text-parchment-600 dark:text-parchment-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 px-1">
                      <h3 className="font-bold text-parchment-950 dark:text-parchment-100 leading-tight">{player.name}</h3>
                      <p className="text-xs text-parchment-600 dark:text-parchment-400">{player.wonder}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['gears', 'compasses', 'tablets', 'wildcards'].map(sym => (
                      <div key={sym} className="flex items-center justify-between">
                        <div className="w-16 flex justify-center items-center">
                          {sym === 'gears' && <img src={scienceImg} alt="Engranaje" className="w-10 h-10 object-contain drop-shadow-sm" />}
                          {sym === 'compasses' && <img src={compasImg} alt="Compás" className="w-10 h-10 object-contain drop-shadow-sm" />}
                          {sym === 'tablets' && <img src={papiroImg} alt="Tablilla" className="w-10 h-10 object-contain drop-shadow-sm" />}
                          {sym === 'wildcards' && (
                            <div className="flex items-center gap-0.5 text-parchment-400 dark:text-parchment-500 font-black text-sm">
                              <img src={compasImg} alt="Compás" className="w-5 h-5 object-contain drop-shadow-sm" />
                              <span>/</span>
                              <img src={papiroImg} alt="Tablilla" className="w-5 h-5 object-contain drop-shadow-sm" />
                              <span>/</span>
                              <img src={scienceImg} alt="Engranaje" className="w-5 h-5 object-contain drop-shadow-sm" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="secondary" onClick={() => handleScienceChange(player.id, sym, -1)} className="w-10 h-10 rounded-full p-0 font-bold text-xl text-green-800">-</Button>
                          <span className="w-6 text-center font-bold dark:text-parchment-100">{player.scores.science[sym]}</span>
                          <Button variant="science" onClick={() => handleScienceChange(player.id, sym, 1)} className="w-10 h-10 rounded-full p-0 font-bold text-xl">+</Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-green-200 dark:border-green-900/50 flex justify-between items-center text-green-700 dark:text-green-500 font-bold">
                      <span>Puntos:</span>
                      <span className="text-2xl">{player.scores.science.total}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );

        })}
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-parchment-200 dark:border-zinc-800 flex justify-between gap-4 z-40">
        <Button
          variant="secondary"
          onClick={handlePrev}
          className="w-16"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          className="flex-1 font-bold text-lg"
        >
          {currentStep === categories.length - 1 ? (
            <>Finalizar <Check className="w-5 h-5" /></>
          ) : (
            <>Siguiente <ChevronRight className="w-5 h-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
