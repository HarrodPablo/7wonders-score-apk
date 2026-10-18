import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../utils/idbStorage';

export const usePlayersStore = create(
  persist(
    (set) => ({
      players: [], // { id, name, photoBase64, stats: { 1st: 0, 2nd: 0, 3rd: 0, totalGames: 0 }, wonderCounts: { [wonderName]: count }, categoryPoints: { [category]: totalPoints } }

      addPlayer: (playerData) => set((state) => {
        const newPlayer = {
          id: crypto.randomUUID(),
          name: playerData.name,
          photoBase64: playerData.photoBase64 || null,
          stats: { first: 0, second: 0, third: 0, totalGames: 0, rankingPoints: 0, tournamentsPlayed: 0, tournamentsWon: 0 },
          wonderCounts: {}, // To track favorite wonder
          categoryPoints: {} // To track favorite color/category (accumulated points)
        };
        return { players: [...state.players, newPlayer] };
      }),

      removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id)
      })),

      updatePlayerProfile: (id, updates) => set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      // Called after a game finishes to update statistics
      updatePlayerStats: (id, { position, wonderUsed, scores, rankingPoints = 0 }) => set((state) => {
        return {
          players: state.players.map(p => {
            if (p.id !== id) return p;

            const newStats = { 
              ...p.stats,
              rankingPoints: (p.stats.rankingPoints || 0) + rankingPoints
            };
            newStats.totalGames += 1;
            if (position === 1) newStats.first += 1;
            if (position === 2) newStats.second += 1;
            if (position === 3) newStats.third += 1;

            const newWonderCounts = { ...p.wonderCounts };
            if (wonderUsed) {
              newWonderCounts[wonderUsed] = (newWonderCounts[wonderUsed] || 0) + 1;
            }

            const newCategoryPoints = { ...p.categoryPoints };
            if (scores) {
               Object.keys(scores).forEach(cat => {
                 if (typeof scores[cat] === 'number') {
                   newCategoryPoints[cat] = (newCategoryPoints[cat] || 0) + scores[cat];
                 } else if (typeof scores[cat] === 'object' && cat === 'science') {
                    // special handling if we just pass a pre-calculated science total instead of the object here
                    // assuming the caller passes the final science score in a flat object for stats, or we just ignore science details and only track total
                 }
               });
            }

            return {
              ...p,
              stats: newStats,
              wonderCounts: newWonderCounts,
              categoryPoints: newCategoryPoints
            };
          })
        };
      }),

      // Called after a tournament finishes
      updateTournamentStats: (id, { wonTournament, bonusPoints }) => set((state) => {
        return {
          players: state.players.map(p => {
            if (p.id !== id) return p;
            const newStats = { 
              ...p.stats,
              tournamentsPlayed: (p.stats.tournamentsPlayed || 0) + 1,
              rankingPoints: (p.stats.rankingPoints || 0) + bonusPoints
            };
            if (wonTournament) {
              newStats.tournamentsWon = (newStats.tournamentsWon || 0) + 1;
            }
            return { ...p, stats: newStats };
          })
        };
      })
    }),
    {
      name: '7w-players-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
