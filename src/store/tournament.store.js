import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../utils/idbStorage';

export const useTournamentStore = create(
  persist(
    (set) => ({
      isActive: false,
      totalMatches: 0,
      currentMatchIndex: 0,
      playerIds: [],
      matchHistory: [],
      accumulatedScores: {}, // Raw game points
      accumulatedRankingPoints: {}, // 7, 6, 5... points

      startTournament: (playerIds, totalMatches) => set(() => {
        const initialScores = {};
        const initialRanking = {};
        playerIds.forEach(id => {
          initialScores[id] = 0;
          initialRanking[id] = 0;
        });

        return {
          isActive: true,
          totalMatches,
          currentMatchIndex: 1,
          playerIds,
          matchHistory: [],
          accumulatedScores: initialScores,
          accumulatedRankingPoints: initialRanking
        };
      }),

      addMatchResult: (matchData, rankingPointsAwarded) => set((state) => {
        const newAccumulatedScores = { ...state.accumulatedScores };
        const newAccumulatedRankingPoints = { ...state.accumulatedRankingPoints };

        // Update accumulated scores
        matchData.players.forEach(p => {
          newAccumulatedScores[p.id] += p.totalScore;
          if (rankingPointsAwarded[p.id]) {
            newAccumulatedRankingPoints[p.id] += rankingPointsAwarded[p.id];
          }
        });

        return {
          matchHistory: [...state.matchHistory, matchData],
          accumulatedScores: newAccumulatedScores,
          accumulatedRankingPoints: newAccumulatedRankingPoints,
          currentMatchIndex: state.currentMatchIndex + 1
        };
      }),

      endTournament: () => set({ 
        isActive: false, 
        playerIds: [],
        matchHistory: [],
        totalMatches: 0,
        currentMatchIndex: 0,
        accumulatedScores: {},
        accumulatedRankingPoints: {}
      }),
    }),
    {
      name: '7w-current-tournament',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
