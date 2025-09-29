<script setup lang="ts">
import type { AchievementItem } from '@/utils/game';
import { createReusableTemplate } from '@vueuse/core';
import { computed } from 'vue';
import { useGameStore } from '@/utils/game';

const game = useGameStore();

const [DefineDetails, Details] = createReusableTemplate<{ item: AchievementItem }>();

const items = computed(() => {
  const ret: [AchievementItem, AchievementItem][] = [];
  const items = game.rank.toSorted((a, b) => a.playerId - b.playerId);
  for (let i = 0; i < items.length / 2; i++)
    ret.push([items[i * 2], items[i * 2 + 1]]);
  return ret;
});
</script>

<template>
  <DefineDetails v-slot="{ item }">
    <div class="flex items-center">
      <div class="i-lucide:asterisk" />
      {{ item.achievement.toFixed(2) }}
      <Badges class="flex ml-1" :badge="item.badge" />
    </div>
  </DefineDetails>

  <template v-for="(x, i) in items" :key="i">
    <div class="w-full h-7 flex justify-between text-lg">
      <div class="player-left" :class="x[0].achievement <= x[1].achievement && 'win'">
        {{ game.players[x[0].playerId] }}
      </div>
      <div class="player-right" :class="x[1].achievement <= x[0].achievement && 'win'">
        {{ game.players[x[1].playerId] }}
      </div>
    </div>

    <div class="w-full flex justify-between mb-4">
      <Details :item="x[0]" />
      <Details class="flex-row-reverse" :item="x[1]" />
    </div>
  </template>
</template>

<style scoped>
.player-left {
  width: 50%;
  height: 100%;
  padding-left: .5rem;
  background: rgba(46, 51, 56, .05);
  clip-path: polygon(0 0, 100% 0, calc(100% - .75rem) 100%, 0 100%);
}

.player-right {
  width: 50%;
  height: 100%;
  padding-right: .5rem;
  background: rgba(46, 51, 56, .05);
  text-align: right;
  clip-path: polygon(.75rem 0, 100% 0, 100% 100%, 0 100%);
}

.win {
  background: #18a058;
  color: white;
}
</style>
