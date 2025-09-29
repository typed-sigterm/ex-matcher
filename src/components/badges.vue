<script setup lang="ts">
import FC from '@/assets/fc-sm.png';
import FDX from '@/assets/fdx-sm.png';
import { BadgeFlag } from '@/utils/round';

defineProps<{
  badge: number
}>();
</script>

<template>
  <div v-if="badge">
    <NTooltip v-if="badge & BadgeFlag.FC">
      <template #trigger>
        <img :src="FC">
      </template>
      Full Combo: No mismatches
    </NTooltip>

    <NTooltip v-if="badge & BadgeFlag.FDX">
      <template #trigger>
        <img :src="FDX">
      </template>
      Full Sync DX: New record
    </NTooltip>
  </div>
</template>

<style scoped>
img {
  width: 1.5rem;
  height: 1.5rem;
  align-items: center;
}
</style>
