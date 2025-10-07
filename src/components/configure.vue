<script setup lang="ts">
import { provide, ref, toRaw } from 'vue';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';
import { EditingGameConfigSymbol } from './configure/context';
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
provide(EditingGameConfigSymbol, editingConfig);

// Component refs
const step1Ref = ref<InstanceType<typeof Step1>>();
const step2Ref = ref<InstanceType<typeof Step2>>();

function handleNext() {
  // Sync step 1 data before moving forward
  if (step.value === 1 && step1Ref.value) {
    step1Ref.value.syncToConfig();
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

function isCurrentStepValid() {
  switch (step.value) {
    case 1:
      return step1Ref.value?.isValid ?? false;
    case 2:
      return step2Ref.value?.isValid ?? false;
    default:
      return true;
  }
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

    <Step1 v-if="step === 1" ref="step1Ref" />
    <Step2 v-else-if="step === 2" ref="step2Ref" />
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
        <NButton type="primary" :disabled="!isCurrentStepValid()" @click="handleNext">
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
