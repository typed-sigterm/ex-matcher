<script setup lang="ts">
import { provide, ref, toRaw } from 'vue';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';
import { DisableNext, EditingGameConfig, SyncToConfig } from './configure/context';
import Step1 from './configure/step-1.vue';
import Step2 from './configure/step-2.vue';
import Step3 from './configure/step-3.vue';

const game = useGameStore();
const round = useRoundStore();

const step = ref(1);
const TotalSteps = 3;

const StepTitle = ['', 'Import Candidate Pairs', 'Configure Players', 'Select Competition Mode'];

// Create a cloned config state for editing
const editingConfig = ref(structuredClone(toRaw(game.$state)));
provide(EditingGameConfig, editingConfig);

// Provide a ref that step components can modify to disable the Next button
const disableNext = ref(true);
provide(DisableNext, disableNext);

// Provide a ref for sync function that step 1 will set
const syncToConfigRef = ref<(() => void) | undefined>();
provide(SyncToConfig, syncToConfigRef);

function handleNext() {
  // Sync step 1 data before moving forward
  if (step.value === 1 && syncToConfigRef.value) {
    syncToConfigRef.value();
  }

  // Move to next step
  if (step.value < TotalSteps) {
    step.value++;
  } else {
    // Final step: commit all changes to the store
    Object.assign(game.$state, editingConfig.value);
    round.playerId = 0;
    game.status = 'playing';
  }
}

function handlePrev() {
  if (step.value > 1)
    step.value--;
}
</script>

<template>
  <NCard
    class="w-100 h-120"
    size="large"
    :segmented="{ content: true }"
  >
    <template #header>
      <div class="i-lucide:settings mr-1" />
      {{ StepTitle[step] }}
    </template>

    <Step1 v-if="step === 1" />
    <Step2 v-else-if="step === 2" />
    <Step3 v-else-if="step === 3" />

    <template #action>
      <NTooltip>
        <template #trigger>
          <a class="i-logos:github-icon text-xl" href="https://github.com/typed-sigterm/ex-matcher" target="_blank" />
        </template>
        Source Code
      </NTooltip>

      <div class="flex items-center gap-2">
        <NButton v-if="step > 1" class="mr-2" @click="handlePrev">
          Prev
        </NButton>
        <NButton type="primary" :disabled="disableNext" @click="handleNext">
          {{ step < TotalSteps ? 'Next' : 'Go' }}
        </NButton>
      </div>
    </template>
  </NCard>
</template>

<style scoped>
:deep() > .n-card__action {
  display: flex;
  justify-content: space-between !important;
  align-items: center;
}

:deep() > .n-card-header > .n-card-header__main {
  display: flex;
  align-items: center;
}

:deep() > .n-card__content {
  overflow-y: auto;
}

:deep() > .n-form-item > .n-form-item-label {
  font-weight: bold;
}

:deep() > .n-form-item > .n-form-item-label > .n-form-item-label__text {
  display: flex;
  align-items: center;
}
</style>
