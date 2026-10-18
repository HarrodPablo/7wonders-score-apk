import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../utils/idbStorage';

export const useHistoryStore = create(
  persist(
    (set) => ({
      games: [], // { id, date, expansions, players: [{id, name, wonder, totalScore, position, scores}] }
      tournaments: [], // { id, date, totalMatches, matchHistory, accumulatedScores, accumulatedRankingPoints, playerIds }

      addGameToHistory: (gameData) => set((state) => ({
        games: [{ ...gameData, id: crypto.randomUUID(), date: new Date().toISOString() }, ...state.games]
      })),
      
      removeGame: (id) => set((state) => ({
        games: state.games.filter(g => g.id !== id)
      })),

      addTournamentToHistory: (tournamentData) => set((state) => ({
        tournaments: [{ ...tournamentData, id: crypto.randomUUID(), date: new Date().toISOString() }, ...state.tournaments]
      })),

      removeTournament: (id) => set((state) => ({
        tournaments: state.tournaments.filter(t => t.id !== id)
      })),
      
      clearHistory: () => set({ games: [], tournaments: [] })
    }),
    {
      name: '7w-history-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
