import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../utils/idbStorage';

const initialPlayerScore = {
  military: 0,
  treasury: 0,
  wonders: 0,
  civilian: 0,
  commercial: 0,
  guilds: 0,
  leaders: 0,
  cities: 0,
  debt: 0,
  naval: 0,
  islands: 0,
  edifice: 0,
  science: { gears: 0, compasses: 0, tablets: 0, wildcards: 0, total: 0 }
};

export const useGameStore = create(
  persist(
    (set) => ({
      isGameActive: false,
      activeExpansions: {
        leaders: false,
        cities: false,
        armada: false,
        edifice: false
      },
      players: [], // { id, name, wonder: 'Rhodos A', scores: {...initialPlayerScore} }

      startGame: (selectedPlayerIds, expansions, selectedWonders, playersData) => set(() => {
        const gamePlayers = selectedPlayerIds.map(id => {
          const pData = playersData.find(p => p.id === id);
          return {
            id,
            name: pData?.name || 'Unknown',
            photoBase64: pData?.photoBase64 || null,
            wonder: selectedWonders[id] || 'Unknown',
            scores: JSON.parse(JSON.stringify(initialPlayerScore))
          };
        });

        return {
          isGameActive: true,
          activeExpansions: expansions,
          players: gamePlayers
        };
      }),

      endGame: () => set({ isGameActive: false, players: [] }),

      setPlayerScore: (playerId, category, value) => set((state) => {
        return {
          players: state.players.map(p => {
            if (p.id !== playerId) return p;
            return {
              ...p,
              scores: {
                ...p.scores,
                [category]: value
              }
            };
          })
        };
      }),

      setPlayerScienceObject: (playerId, scienceData) => set((state) => {
        return {
          players: state.players.map(p => {
            if (p.id !== playerId) return p;
            return {
              ...p,
              scores: {
                ...p.scores,
                science: { ...p.scores.science, ...scienceData }
              }
            };
          })
        };
      })
    }),
    {
      name: '7w-current-game',
      storage: createJSONStorage(() => idbStorage),
      // We can use default localStorage for this since it's small and no images are stored inside the game state directly,
      // except maybe photoBase64 if we copy it. To be safe, let's omit photoBase64 or just use it.
      // Wait, if photoBase64 is large, maybe we shouldn't copy it to game state, but lookup from players store instead in UI.
      // Let's modify startGame to NOT copy photoBase64 to avoid localStorage quota issues.
      partialize: (state) => ({
        ...state,
        players: state.players.map(p => ({ ...p, photoBase64: undefined }))
      })
    }
  )
);
