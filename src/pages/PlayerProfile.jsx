import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import bgWallpaper from '../assets/fonts/7wonders-wallpaper.jpg';
import laurelesImg from '../assets/icono/laureles.png';
import { useHistoryStore } from '../store/history.store';
import { usePlayersStore } from '../store/players.store';
import { getBoardImage } from '../utils/boardImages';
export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const player = usePlayersStore((state) => state.players.find(p => p.id === id));
  const removePlayer = usePlayersStore((state) => state.removePlayer);
  const games = useHistoryStore((state) => state.games);
  const tournaments = useHistoryStore((state) => state.tournaments);

  if (!player) {
    return <div className="p-6 text-center">Jugador no encontrado</div>;
  }

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${player.name}?`)) {
      removePlayer(id);
      navigate('/players');
    }
  };

  const allMatches = [...games, ...tournaments.flatMap(t => t.matchHistory)];

  // Calculate favorite wonder and category dynamically from history
  const wonderPlays = {};
  const wonderWins = {};
  const catPointsAll = {};
  const catPointsWins = {};

  allMatches.forEach(match => {
    const pRecord = match.players?.find(p => p.id === id);
    if (pRecord) {
      if (pRecord.wonder) {
        wonderPlays[pRecord.wonder] = (wonderPlays[pRecord.wonder] || 0) + 1;
        if (pRecord.position === 1) {
          wonderWins[pRecord.wonder] = (wonderWins[pRecord.wonder] || 0) + 1;
        }
      }

      if (pRecord.scores) {
        Object.entries(pRecord.scores).forEach(([cat, pts]) => {
          if (cat === 'total' || cat === 'debt') return;
          if (typeof pts === 'number' && pts > 0) {
            catPointsAll[cat] = (catPointsAll[cat] || 0) + pts;
            if (pRecord.position === 1) {
              catPointsWins[cat] = (catPointsWins[cat] || 0) + pts;
            }
          }
        });
      }
    }
  });

  let favWonder = "Ninguna";
  if (Object.keys(wonderWins).length > 0) {
    favWonder = Object.entries(wonderWins).reduce((a, b) => {
      if (a[1] !== b[1]) return a[1] > b[1] ? a : b;
      return (wonderPlays[a[0]] || 0) > (wonderPlays[b[0]] || 0) ? a : b;
    })[0];
  } else if (Object.keys(wonderPlays).length > 0) {
    favWonder = Object.entries(wonderPlays).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  const favBoardImage = getBoardImage(favWonder);

  const bgImage = bgWallpaper;

  let favCategory = "Ninguna";
  if (Object.keys(catPointsWins).length > 0) {
    favCategory = Object.entries(catPointsWins).reduce((a, b) => {
      if (a[1] !== b[1]) return a[1] > b[1] ? a : b;
      return (catPointsAll[a[0]] || 0) > (catPointsAll[b[0]] || 0) ? a : b;
    })[0];
  } else if (Object.keys(catPointsAll).length > 0) {
    favCategory = Object.entries(catPointsAll).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  let maxPoints = 0;
  let maxPointsDate = null;
  allMatches.forEach(match => {
    const playerRecord = match.players?.find(p => p.id === id);
    if (playerRecord && playerRecord.totalScore > maxPoints) {
      maxPoints = playerRecord.totalScore;
      // Tournament matches might not have their own date, but they inherit it from the tournament or don't have one
      maxPointsDate = match.date || (tournaments.find(t => t.matchHistory.includes(match))?.date) || maxPointsDate;
    }
  });

  const formattedMaxPointsDate = maxPointsDate
    ? new Date(maxPointsDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Ninguna';

  const categoryNames = {
    military: 'Militar',
    treasury: 'Tesoro',
    wonders: 'Maravilla',
    civilian: 'Civil',
    science: 'Ciencia',
    commercial: 'Comercial',
    guilds: 'Gremios',
    leaders: 'Líderes',
    cities: 'Ciudades',
    armada: 'Naval',
    edifice: 'Edificios'
  };

  const categoryStyles = {
    military: 'bg-red-600 text-white border-red-700',
    treasury: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    wonders: 'bg-gray-400 text-gray-950 border-gray-500',
    civilian: 'bg-blue-500 text-white border-blue-600',
    science: 'bg-green-600 text-white border-green-700',
    commercial: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    guilds: 'bg-purple-600 text-white border-purple-700',
    leaders: 'bg-white text-gray-950 border-gray-200',
    cities: 'bg-gray-900 text-white border-black',
    armada: 'bg-blue-900 text-white border-blue-950',
    edifice: 'bg-orange-500 text-white border-orange-600',
    Ninguna: 'bg-parchment-50/80 dark:bg-zinc-800/80 text-parchment-950 dark:text-parchment-100 border-parchment-200 dark:border-zinc-700'
  };

  const activeStyle = categoryStyles[favCategory] || categoryStyles['Ninguna'];

  return (
    <div
      className={`min-h-screen p-6 relative transition-colors duration-300 ${!bgImage ? 'bg-parchment-100 dark:bg-zinc-900' : ''}`}
      style={bgImage ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Overlay to ensure text readability over the background image */}
      {bgImage && <div className="absolute inset-0 bg-black/40 z-0"></div>}

      <div className="max-w-md mx-auto relative z-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/players" className="p-2 bg-parchment-200/90 dark:bg-zinc-800/90 rounded-full text-parchment-900 dark:text-parchment-100 shadow backdrop-blur-md hover:bg-parchment-300 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <button onClick={handleDelete} className="p-2 bg-red-100/90 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full shadow backdrop-blur-md hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </header>

        <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md rounded-3xl shadow-xl border border-parchment-300/50 dark:border-zinc-700/50 p-6 relative mt-16 transition-colors">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            {/* Laureles overlaying as the only border, colorized via mask */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 max-w-none pointer-events-none z-20 bg-parchment-600 dark:bg-parchment-400"
              style={{
                maskImage: `url(${laurelesImg})`,
                WebkitMaskImage: `url(${laurelesImg})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            ></div>

            <div className="w-32 h-32 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shadow-md relative z-10">
              {player.photoBase64 ? (
                <img src={player.photoBase64} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-parchment-500 dark:text-parchment-400">
                  {player.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="pt-16 text-center mb-6">
            <h1 className="text-3xl font-extrabold text-parchment-950 dark:text-parchment-100">{player.name}</h1>
            <p className="text-parchment-600 dark:text-parchment-400 font-medium mt-1">{player.stats.totalGames} Partidas Jugadas</p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-8 bg-parchment-50/50 dark:bg-zinc-900/50 py-3 rounded-2xl border border-parchment-200 dark:border-zinc-700">
            <div className="text-center">
              <p className="text-sm font-semibold text-parchment-500 dark:text-parchment-400 uppercase tracking-wider">Liga</p>
              <p className="font-black text-2xl text-yellow-600 dark:text-yellow-500">{player.stats.rankingPoints || 0} <span className="text-sm">pts</span></p>
            </div>
            <div className="w-px h-10 bg-parchment-200 dark:bg-zinc-700"></div>
            <div className="text-center">
              <p className="text-sm font-semibold text-parchment-500 dark:text-parchment-400 uppercase tracking-wider">Torneos</p>
              <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                {player.stats.tournamentsWon > 0 && (
                  <span className="text-xl text-yellow-600 dark:text-yellow-500">🏆</span>
                )}
                <span className="font-black text-2xl text-parchment-900 dark:text-parchment-100">{player.stats.tournamentsWon || 0}</span>
                <span className="text-xs text-parchment-500 dark:text-zinc-500 font-medium">de {player.stats.tournamentsPlayed || 0}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-3 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
              <span className="text-2xl mb-1">🥇</span>
              <span className="font-bold text-lg text-yellow-700 dark:text-yellow-500">{player.stats.first}</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-600/80 font-semibold uppercase">Victorias</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/50">
              <span className="text-2xl mb-1">🥈</span>
              <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{player.stats.second}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Segundos</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-orange-50/80 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700/50">
              <span className="text-2xl mb-1">🥉</span>
              <span className="font-bold text-lg text-orange-700 dark:text-orange-500">{player.stats.third}</span>
              <span className="text-xs text-orange-600 dark:text-orange-600/80 font-semibold uppercase">Terceros</span>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="flex items-end gap-6 p-5 h-32 rounded-2xl border border-parchment-200 dark:border-zinc-700 relative overflow-hidden shadow-sm"
              style={favBoardImage ? {
                backgroundImage: `url(${favBoardImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 25%',
              } : { backgroundColor: 'rgba(250, 246, 237, 0.8)' /* parchment-50/80 equivalent */ }}
            >
              {favBoardImage && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0"></div>}
              <div className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] w-full">
                <p className={`text-xs font-bold tracking-wide uppercase ${favBoardImage ? 'text-gray-300' : 'text-parchment-600 dark:text-parchment-400'}`}>Maravilla Favorita</p>
                <p className={`font-black text-2xl ${favBoardImage ? 'text-white' : 'text-parchment-950 dark:text-parchment-100'}`}>
                  {favWonder.split(' (')[0].replace(' A', '').replace(' B', '')}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${activeStyle}`}>
              <div>
                <p className="text-sm opacity-80 font-medium">Categoría más Fuerte</p>
                <p className="font-bold text-xl mt-1">
                  {categoryNames[favCategory] || favCategory}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-parchment-50/80 dark:bg-zinc-800/80 rounded-xl border border-parchment-200 dark:border-zinc-700 shadow-sm">
              <div className="flex-1">
                <p className="text-sm text-parchment-600 dark:text-parchment-400 font-medium">Récord de Puntos</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="font-extrabold text-parchment-950 dark:text-parchment-100 text-2xl">{maxPoints} pts</p>
                  <p className="text-xs text-parchment-500 dark:text-parchment-400 font-medium">{formattedMaxPointsDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
