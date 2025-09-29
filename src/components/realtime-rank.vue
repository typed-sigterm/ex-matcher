<script setup lang="ts">
import { ReorderGroup, ReorderItem } from 'motion-v';
import { computed } from 'vue';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';

const game = useGameStore();
const round = useRoundStore();

const rank = computed(() => {
  const base = [...game.rank, { playerId: round.playerId!, achievement: round.achievement, dx: false }];
  if (Number.isNaN(base.at(-1)!.achievement))
    base.pop();
  return base.sort((a, b) => a.achievement - b.achievement);
});
</script>

<template>
  <div class="flex flex-col w-64 mx-4">
    <p class="text-center text-2xl font-bold my-6 border-b border-gray-3">
      Present Standings
    </p>
    <ReorderGroup v-model:values="rank" as="ol">
      <ReorderItem
        v-for="(item, i) in rank"
        :key="item.playerId"
        class="rank-item"
        :class="i === round.playerId && 'current'"
        :value="item"
        :drag-listener="false"
      >
        <p
          class="rank-icon"
          v-text="i <= 2 ? '🥇🥈🥉'.slice(i * 2, i * 2 + 2) : i + 1"
        />
        {{ game.players[item.playerId] }}
        <span class="flex-1 text-end">
          {{ item.achievement.toFixed(2) }}
        </span>
      </ReorderItem>
    </ReorderGroup>
  </div>
</template>

<style scoped>
.rank-item {
  display: flex;
  padding: 1rem 1rem;
}

.rank-item.current {
  background-color: rgba(32, 128, 240, 0.16);
}

.rank-icon {
  display: flex;
  width: 2rem;
  margin-left: -.5rem;
  justify-content: center;
  font-weight: bold;
}
</style>
