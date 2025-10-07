<script setup lang="ts">
import { computed, inject } from 'vue';
import { EditingGameConfigSymbol } from './context';

const config = inject(EditingGameConfigSymbol)!;

const isValid = computed(() => {
  // no empty names
  if (config.value.players.some(x => x.trim() === ''))
    return false;
  // no duplicates
  return new Set(config.value.players).size === config.value.players.length;
});

defineExpose({ isValid });
</script>

<template>
  <div>
    <NDynamicInput v-model:value="config.players" :min="1" :max="50" />
  </div>
</template>
