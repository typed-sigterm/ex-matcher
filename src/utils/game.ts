import { defineStore } from 'pinia';

export interface AchievementItem {
  playerId: number
  achievement: number
  badge: number
}

export interface GameState {
  status: 'configuring' | 'playing' | 'finished'
  allPairs: Array<[string, string]>
  roundlyPairCount: number
  players: string[] // name of players
  mode: 'pairwise' | 'leaderboard'
  rank: AchievementItem[]
  record?: number
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    status: 'configuring',
    allPairs: [],
    roundlyPairCount: 1,
    players: ['Team A', 'Team B'],
    mode: 'pairwise',
    rank: [],
  }),
  persist: {
    key: 'game-config',
    pick: ['allPairs', 'roundlyPairCount', 'players', 'mode', 'record'],
  },
});
