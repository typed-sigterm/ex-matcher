<script setup lang="ts">
import { ReorderGroup, ReorderItem } from 'motion-v';
import { inject, watchEffect } from 'vue';
import { EditingGameConfig } from './context';

const config = inject(EditingGameConfig)!;

// Auto-switch to leaderboard if odd number of players
watchEffect(() => {
  if (config.value.players.length % 2 !== 0 && config.value.mode === 'pairwise')
    config.value.mode = 'leaderboard';
});
</script>

<template>
  <NForm :show-feedback="false" label-placement="left">
    <NFormItem>
      <template #label>
        Mode
        <NTooltip class="flex">
          <template #trigger>
            <div class="i-lucide:circle-question-mark ml-1 cursor-help" />
          </template>
          Pairwise: Each player is paired with another player for direct comparison.
          <br>
          Leaderboard: All players are ranked against each other.
          <br>
          Pairwise mode requires an even number of players.
        </NTooltip>
      </template>

      <NRadioGroup v-model:value="config.mode">
        <NRadio value="pairwise" :disabled="config.players.length % 2 !== 0">
          Pairwise
        </NRadio>
        <NRadio value="leaderboard">
          Leaderboard
        </NRadio>
      </NRadioGroup>
    </NFormItem>

    <NFormItem
      v-if="config.mode === 'pairwise'"
      label-placement="top"
      :label-style="{ marginLeft: '-2px' }"
    >
      <template #label>
        Arrange Matchups
        <NTooltip class="flex">
          <template #trigger>
            <div class="i-lucide:circle-question-mark ml-1 cursor-help" />
          </template>
          Drag and drop players to arrange matchups.
        </NTooltip>
      </template>

      <div class="flex pl-4">
        <span>
          <template v-for="i in Math.floor(config.players.length / 2)" :key="i">
            Pair {{ i }}
            <br>
            <br>
          </template>
        </span>
        <ReorderGroup v-model:values="config.players" class="ml-2">
          <ReorderItem v-for="x in config.players" :key="x" :value="x">
            <span class="text-gray mr-2">⋮⋮</span>
            <span>{{ x }}</span>
          </ReorderItem>
        </ReorderGroup>
      </div>
    </NFormItem>

    <NFormItem label="Pairs per round">
      <NInputNumber
        v-model:value="config.roundlyPairCount"
        class="w-30"
        size="small"
        :min="1"
        :max="config.allPairs.length"
      />
    </NFormItem>

    <NFormItem label="Record for achievement">
      <NInputNumber
        v-model:value="config.record"
        class="w-35"
        size="small"
        :precision="2"
        :min="0.01"
        clearable
        placeholder="Optional"
      />
    </NFormItem>
  </NForm>
</template>
