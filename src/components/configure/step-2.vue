<script setup lang="ts">
import { inject, watch } from 'vue';
import { DisableNext, EditingGameConfig } from './context';

const config = inject(EditingGameConfig)!;
const disableNext = inject(DisableNext)!;

// Watch for validation changes and update disableNext
watch(
  () => {
    // no empty names
    if (config.value.players.some(x => x.trim() === ''))
      return true;
    // no duplicates
    return new Set(config.value.players).size !== config.value.players.length;
  },
  (invalid) => {
    disableNext.value = invalid;
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <NDynamicInput v-model:value="config.players" :min="1" :max="50" />
  </div>
</template>
