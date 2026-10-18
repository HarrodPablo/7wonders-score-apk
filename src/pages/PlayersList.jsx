import { ArrowLeft, Camera, Search, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bgWallpaper from '../assets/fonts/7wonders-wallpaper.jpg';
import { usePlayersStore } from '../store/players.store';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function PlayersList() {
  const players = usePlayersStore((state) => state.players);
  const addPlayer = usePlayersStore((state) => state.addPlayer);
  const updatePlayerProfile = usePlayersStore((state) => state.updatePlayerProfile);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const gordo = players.find(p => p.name.toLowerCase().includes('gordo'));
    if (gordo && gordo.stats.tournamentsWon !== 3) {
      updatePlayerProfile(gordo.id, { stats: { ...gordo.stats, tournamentsWon: 3 } });
    }
  }, [players, updatePlayerProfile]);

  const handlePhotoUpload = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 80,
        allowEditing: true, // Permite recortar la foto
        resultType: CameraResultType.DataUrl, // Devuelve base64 directo
        source: CameraSource.Prompt, // Muestra opción: Cámara o Galería
        width: 256,
        height: 256,
      });

      if (image && image.dataUrl) {
        setNewPhoto(image.dataUrl);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      // El usuario canceló o denegó permisos, no hacemos nada
    }
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      addPlayer({ name: newName.trim(), photoBase64: newPhoto });
      setNewName('');
      setNewPhoto(null);
      setIsAdding(false);
    }
  };

  // Filter by search term and sort A-Z
  const filteredAndSortedPlayers = [...players]
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-parchment-100 dark:bg-zinc-900 p-6 transition-colors duration-300 overflow-x-hidden w-full relative">
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
          <Link to="/" className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full text-parchment-900 dark:text-parchment-200 shadow hover:bg-white dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-parchment-950 dark:text-parchment-100">Jugadores</h1>
          <div className="w-10"></div>
        </header>

        {isAdding ? (
          <form onSubmit={handleAddPlayer} className="relative bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-md border border-parchment-200 dark:border-zinc-700 mb-8 transition-colors">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 p-2 text-parchment-400 hover:text-parchment-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-full hover:bg-parchment-100 dark:hover:bg-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-parchment-900 dark:text-parchment-100">Nuevo Jugador</h2>

            <div className="flex flex-col items-center mb-6">
              <button
                type="button"
                className="flex flex-col items-center group focus:outline-none"
                onClick={handlePhotoUpload}
              >
                <div className="w-24 h-24 rounded-full bg-parchment-200 dark:bg-zinc-700 border-4 border-parchment-400 dark:border-zinc-600 flex items-center justify-center overflow-hidden mb-3 group-hover:border-parchment-500 group-hover:shadow-md transition-all">
                  {newPhoto ? (
                    <img src={newPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-parchment-600 dark:text-parchment-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-parchment-900 dark:text-parchment-100 font-bold bg-parchment-200 dark:bg-zinc-700 px-4 py-2 rounded-full shadow-sm border border-parchment-300 dark:border-zinc-600">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Tomar o Subir Foto</span>
                </div>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-parchment-800 dark:text-parchment-200 mb-2">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-parchment-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-parchment-900 dark:text-parchment-100 placeholder-parchment-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
                placeholder="Nombre del jugador"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 px-4 bg-parchment-200 dark:bg-zinc-700 hover:bg-parchment-300 dark:hover:bg-zinc-600 text-parchment-900 dark:text-parchment-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-parchment-800 dark:bg-parchment-200 hover:bg-parchment-900 dark:hover:bg-parchment-100 text-parchment-50 dark:text-parchment-900 rounded-lg font-bold shadow-md transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 mb-6 bg-parchment-800 dark:bg-parchment-200 hover:bg-parchment-900 dark:hover:bg-parchment-100 text-parchment-50 dark:text-parchment-900 rounded-xl shadow-md font-bold transition-colors"
          >
            + Crear Nuevo Perfil
          </button>
        )}

        <div className="space-y-4">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-parchment-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-parchment-200 dark:border-zinc-700 rounded-xl leading-5 bg-white dark:bg-zinc-800 text-parchment-900 dark:text-parchment-100 placeholder-parchment-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors shadow-sm"
            />
          </div>

          {filteredAndSortedPlayers.length === 0 ? (
            <p className="text-center text-parchment-600 dark:text-parchment-400 py-8 font-medium">
              {players.length === 0 ? "No hay jugadores registrados aún." : "No se encontraron jugadores."}
            </p>
          ) : (
            filteredAndSortedPlayers.map((player) => (
              <Link
                to={`/players/${player.id}`}
                key={player.id}
                className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm border border-parchment-200 dark:border-zinc-700 hover:border-yellow-400 dark:hover:border-yellow-600 hover:shadow-md transition duration-200 group"
              >

                <div className="w-10 h-10 rounded-full bg-parchment-200 dark:bg-zinc-700 overflow-hidden shrink-0 border-2 border-parchment-300 dark:border-zinc-600 group-hover:border-yellow-400 transition-colors">
                  {player.photoBase64 ? (
                    <img src={player.photoBase64} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-parchment-600 dark:text-parchment-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-parchment-950 dark:text-parchment-100 text-lg">{player.name}</h3>
                  <div className="text-xs text-parchment-600 dark:text-parchment-400 flex gap-3 mt-1 font-semibold">
                    <span>🥇 {player.stats.first}</span>
                    <span>🥈 {player.stats.second}</span>
                    <span>🥉 {player.stats.third}</span>
                    {player.stats.tournamentsWon > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-500">🏆 {player.stats.tournamentsWon}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
