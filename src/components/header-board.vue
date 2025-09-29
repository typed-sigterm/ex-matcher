<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import FC from '@/assets/fc-sm.png?url';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';

const game = useGameStore();
const round = useRoundStore();

defineExpose({ start, stop, reset });

const startTime = ref<number>();
const currentTime = ref<number>();

function update() {
  currentTime.value = performance.now();
  round.achievement = (currentTime.value - startTime.value!) / round.matchedPairCount;
}
watch(() => round.matchedPairCount, update);

const intervalController = useIntervalFn(
  update,
  100,
  { immediateCallback: true },
);
intervalController.pause();

function start() {
  if (intervalController.isActive.value)
    throw new Error('Timer already started');
  startTime.value = performance.now();
  intervalController.resume();
}

function stop() {
  if (!intervalController.isActive.value)
    throw new Error('Timer not started');
  intervalController.pause();
}

function reset() {
  startTime.value = currentTime.value = undefined;
}

const THOUSANDTH = 1 / 1000;
const time = computed(() => {
  if (!startTime.value)
    return '';
  return `${Math.floor((currentTime.value! - startTime.value!) * THOUSANDTH)}s`;
});
</script>

<template>
  <div class="h-40 mx-4 my-2">
    <span
      class="size-full flex justify-center items-center text-7xl"
      v-text="round.achievement ? round.achievement.toFixed(2) : game.players[round.playerId!]"
    />
    <div v-if="round.status !== 'unstarted'" class="absolute right-0 w-28 h-[max-content] grid grid-cols-2 items-center gap-x-2 self-end text-xl font-mono">
      <div class="i-lucide:clock justify-self-end" />
      <span v-text="time" />
      <template v-if="round.mismatchedAttemptCount">
        <div class="i-lucide:x justify-self-end" />
        <span v-text="round.mismatchedAttemptCount" />
      </template>
      <template v-else>
        <img :src="FC" class="justify-self-end size-7 -mr-1">
        <span>√</span>
      </template>
    </div>
  </div>
</template>
