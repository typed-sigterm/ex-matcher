import { defineStore } from 'pinia';

export const BadgeFlag = {
  FDX: 1, // new record
  FC: 2, // no mismatches
} as const;

export interface RoundState {
  playerId?: number
  status: 'unstarted' | 'pending' | 'fulfilled'
  _startTime: number
  _stopTime: number
  matchedPairCount: number
  mismatchedAttemptCount: number
  achievement: number
}

export const useRoundStore = defineStore('round', {
  state: (): RoundState => ({
    status: 'unstarted',
    _startTime: 0,
    _stopTime: 0,
    achievement: Number.NaN,
    matchedPairCount: 0,
    mismatchedAttemptCount: 0,
  }),

  getters: {
    time: x => x._startTime ? (x._stopTime || performance.now()) - x._startTime : Number.NaN,
  },

  actions: {
    start() {
      if (this.status !== 'unstarted')
        throw new Error('Round has already started');
      this.status = 'pending';
      this._startTime = performance.now();
    },

    stop() {
      if (this.status !== 'pending')
        throw new Error('Round is not pending');
      this._stopTime = performance.now();
      this.status = 'fulfilled';
    },
  },
});
