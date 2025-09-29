<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTimeoutManager } from '@/utils';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';

const game = useGameStore();
const round = useRoundStore();

const percentage = computed(() => (round.matchedPairCount / game.roundlyPairCount) * 100);
const color = ref<'blue' | 'red' | 'green'>('blue');
const { scheduleTimeout } = useTimeoutManager();
watch(() => round.mismatchedAttemptCount, () => {
  color.value = 'red';
  scheduleTimeout(() => color.value = 'blue', 750);
});
watch(percentage, () => {
  if (percentage.value === 100)
    color.value = 'green';
});
</script>

<template>
  <NProgress
    type="line"
    :percentage="percentage"
    :border-radius="0"
    :show-indicator="false"
    :color="color === 'blue' ? '#2080f0' : color === 'red' ? '#d03050' : '#18a058'"
    :processing="color === 'blue'"
  />
</template>
