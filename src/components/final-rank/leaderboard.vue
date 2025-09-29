<script setup lang="ts">
import { useGameStore } from '@/utils/game';

const game = useGameStore();
</script>

<template>
  <NList v-model:values="game.rank" bordered>
    <NListItem
      v-for="(item, i) in game.rank"
      :key="item.playerId"
      class="rank-item p-1"
    >
      <span
        class="rank-icon"
        v-text="i <= 2 ? '🥇🥈🥉'.slice(i * 2, i * 2 + 2) : i + 1"
      />
      {{ game.players[item.playerId] }}
      <span class="flex-1 text-end">
        {{ item.achievement.toFixed(2) }}
      </span>
      <Badges class="flex text-end -mr-1" :badge="item.badge" />
    </NListItem>
  </NList>
</template>

<style scoped>
.rank-item:deep() > .n-list-item__main {
  display: flex;
}

.rank-icon {
  display: flex;
  width: 2rem;
  margin-left: -.5rem;
  justify-content: center;
  font-weight: bold;
}
</style>
