<script setup lang="ts">
import sampleSize from 'lodash-es/sampleSize';
import shuffle from 'lodash-es/shuffle';
import { ref } from 'vue';
import { useTimeoutManager } from '@/utils';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';

export interface MatchItem {
  token: number
  label: string
}

const emit = defineEmits<{
  go: []
  completed: []
}>();

defineExpose({ start });

const game = useGameStore();
const round = useRoundStore();
const items = ref<MatchItem[][]>([]);

const { scheduleTimeout, clearAllTimeouts } = useTimeoutManager();

const selected = ref<[number, number] | undefined>();
type Feedback = 'present' | 'yea' | 'nay' | undefined;
const feedbacks = ref<Feedback[][]>([]);
const hidings = ref<boolean[][]>([]);

function start() {
  clearAllTimeouts();

  const electedPairs = sampleSize(game.allPairs, game.roundlyPairCount);
  let electedItems: MatchItem[] = [];
  for (let i = 0; i < electedPairs.length; i++) {
    const [a, b] = electedPairs[i];
    electedItems.push({ token: i, label: a }, { token: i, label: b });
  }
  electedItems = shuffle(electedItems);
  items.value = [];
  for (let i = 0; i < electedItems.length; ++i)
    (items.value[Math.floor(i / 10)] ??= []).push(electedItems[i]);

  selected.value = undefined;
  feedbacks.value = items.value.map(row => row.map(() => undefined));
  hidings.value = items.value.map(row => row.map(() => false));
}

function onSelect(i: number, j: number) {
  if (hidings.value[i][j] || feedbacks.value[i][j] === 'nay')
    return;

  if (selected.value) {
    const [a, b] = selected.value!;
    if (i === a && j === b)
      return;

    selected.value = undefined;
    const correct = items.value[i][j].token === items.value[a][b].token;
    feedbacks.value[i][j] = feedbacks.value[a][b] = correct ? 'yea' : 'nay';
    if (correct) {
      round.matchedPairCount++;
      scheduleTimeout(() => hidings.value[i][j] = hidings.value[a][b] = true, 500);
    } else {
      round.mismatchedAttemptCount++;
      scheduleTimeout(() => feedbacks.value[i][j] = feedbacks.value[a][b] = undefined, 500);
    }
  } else {
    selected.value = [i, j];
    feedbacks.value[i][j] = 'present';
  }

  if (round.matchedPairCount === game.roundlyPairCount)
    emit('completed');
}
</script>

<template>
  <div
    v-if="round.status === 'unstarted'"
    class="flex flex-col justify-center items-center flex-1 font-bold text-7xl text-[#18a058]"
    @click="$emit('go')"
  >
    Touch to start
  </div>

  <div v-else-if="round.status === 'pending'" class="flex items-center justify-center flex-1 m-4">
    <table class="select-none">
      <tbody>
        <tr v-for="(row, i) in items" :key="i">
          <td
            v-for="(item, j) in row"
            :key="j"
            role="button"
            :data-feedback="feedbacks[i][j]"
            :aria-hidden="hidings[i][j]"
            @click="onSelect(i, j)"
            @contextmenu.prevent="onSelect(i, j)"
            v-text="item.label"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: .5rem;
}

td {
  width: 4.5rem;
  height: 4.5rem;
  background-color: rgba(46, 51, 56, .09);
  text-align: center;
  cursor: default;
  transition: background-color 0.3s, color 0.3s, opacity 0.3s;
}

td:not([data-feedback]):not([aria-hidden="true"]) {
  cursor: pointer;
}

td[data-feedback="present"] {
  color: #2080f0;
  background-color: rgba(32, 128, 240, 0.16);
  transition: background-color 0s, color 0s;
}

td[data-feedback="yea"] {
  color: white;
  background-color: #18a058;
}

td[data-feedback="nay"] {
  color: white;
  background-color: #d03050;
  cursor: not-allowed;
}

td[aria-hidden="true"] {
  opacity: 0;
}
</style>
