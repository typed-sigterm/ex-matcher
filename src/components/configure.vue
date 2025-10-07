<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui';
import { whenever } from '@vueuse/core';
import { ReorderGroup, ReorderItem } from 'motion-v';
import { computed, ref } from 'vue';
import { parseExcelFile } from '@/utils/excel';
import { useGameStore } from '@/utils/game';
import { useRoundStore } from '@/utils/round';

const game = useGameStore();
const round = useRoundStore();

const step = ref(1);
const TotalSteps = 3;

const StepTitle = ['', 'Import Candidate Pairs', 'Configure Players', 'Select Competition Mode'];
const PairsInputProps = {
  inputProps: { style: 'white-space: nowrap' },
  type: 'textarea',
  autosize: { minRows: 10, maxRows: 10 },
} as const;

const pairsLeft = ref(''), pairsRight = ref('');
const getInputPairs = () => [pairsLeft.value.trim().split('\n'), pairsRight.value.trim().split('\n')];
const showManualInputModal = ref(false);
const uploadError = ref<string | undefined>();
// Note: pairs are now managed through game.allPairs directly
// No need to sync on step change since Excel upload and manual input handle it

whenever(() => step.value === 3, () => {
  if (game.players.length % 2 !== 0 && game.mode === 'pairwise')
    game.mode = 'leaderboard';
});

whenever(() => step.value > TotalSteps, () => {
  round.playerId = 0;
  game.status = 'playing';
});

const disableNext = computed(() => {
  switch (step.value) {
    case 1: {
      // Check if there's an upload error
      if (uploadError.value) {
        return true;
      }
      // Only validate if we have manually entered pairs
      if (pairsLeft.value || pairsRight.value) {
        const [l, r] = getInputPairs().map(x => new Set(x));
        return !l.size || l.size !== r.size; // 去重
      }
      // Check if we have pairs loaded from Excel
      return game.allPairs.length === 0;
    }
    case 2: {
      if (game.players.some(x => x.trim() === '')) // 禁止空白
        return true;
      return new Set(game.players).size !== game.players.length; // 禁止重复
    }
  }
  return false;
});

// Handle Excel file upload
async function handleFileChange(options: { fileList: UploadFileInfo[] }) {
  uploadError.value = undefined;
  
  if (!options.fileList || options.fileList.length === 0) {
    return;
  }
  
  const fileInfo = options.fileList[0];
  if (!fileInfo.file) {
    return;
  }
  
  const result = await parseExcelFile(fileInfo.file);
  
  if (!result.success) {
    uploadError.value = result.error;
    return;
  }
  
  // Success: update game store with parsed pairs
  game.allPairs = result.pairs || [];
  // Clear manual input
  pairsLeft.value = '';
  pairsRight.value = '';
}

// Open manual input modal
function openManualInput() {
  // Load current pairs into text areas
  pairsLeft.value = '';
  pairsRight.value = '';
  for (const pair of game.allPairs) {
    pairsLeft.value += `${pair[0]}\n`;
    pairsRight.value += `${pair[1]}\n`;
  }
  showManualInputModal.value = true;
}

// Save manual input
function saveManualInput() {
  const [l, r] = getInputPairs();
  game.allPairs = [];
  for (let i = 0; i < l.length; i++) {
    const left = l[i].trim(), right = r[i].trim();
    if (left || right) {
      game.allPairs.push([left, right]);
    }
  }
  uploadError.value = undefined;
  showManualInputModal.value = false;
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

    <template v-if="step === 1">
      <p class="mb-2">
        Upload an Excel file with pairs in columns A and B, or use manual input.
      </p>
      <NUpload
        accept=".xlsx,.xls"
        :max="1"
        :default-upload="false"
        @change="handleFileChange"
      >
        <NButton>
          <template #icon>
            <div class="i-lucide:upload" />
          </template>
          Select Excel File
        </NButton>
      </NUpload>
      
      <NAlert v-if="uploadError" type="error" class="mt-2">
        {{ uploadError }}
      </NAlert>
      
      <NAlert v-else-if="game.allPairs.length > 0" type="success" class="mt-2">
        {{ game.allPairs.length }} pairs loaded
      </NAlert>
      
      <div class="mt-4">
        <a class="cursor-pointer text-blue-500 hover:text-blue-600" @click="openManualInput">
          Manual Input
        </a>
      </div>
      
      <NModal
        v-model:show="showManualInputModal"
        preset="card"
        title="Manual Input"
        class="w-200"
        :segmented="{ content: true }"
      >
        <p class="mb-2">
          The same row on both sides is considered a pair.
        </p>
        <div class="flex gap-1">
          <NInput v-model:value="pairsLeft" v-bind="PairsInputProps" />
          <NInput v-model:value="pairsRight" v-bind="PairsInputProps" />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <NButton @click="showManualInputModal = false">
              Cancel
            </NButton>
            <NButton type="primary" @click="saveManualInput">
              Save
            </NButton>
          </div>
        </template>
      </NModal>
    </template>

    <template v-else-if="step === 2">
      <NDynamicInput v-model:value="game.players" :min="1" :max="50" />
    </template>

    <NForm v-else-if="step === 3" :show-feedback="false" label-placement="left">
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

        <NRadioGroup v-model:value="game.mode">
          <NRadio value="pairwise" :disabled="game.players.length % 2 !== 0">
            Pairwise
          </NRadio>
          <NRadio value="leaderboard">
            Leaderboard
          </NRadio>
        </NRadioGroup>
      </NFormItem>

      <NFormItem
        v-if="game.mode === 'pairwise'"
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
            <template v-for="i in Math.floor(game.players.length / 2)" :key="i">
              Pair {{ i }}
              <br>
              <br>
            </template>
          </span>
          <ReorderGroup v-model:values="game.players" class="ml-2">
            <ReorderItem v-for="x in game.players" :key="x" :value="x">
              <span class="text-gray mr-2">⋮⋮</span>
              <span>{{ x }}</span>
            </ReorderItem>
          </ReorderGroup>
        </div>
      </NFormItem>

      <NFormItem label="Pairs per round">
        <NInputNumber
          v-model:value="game.roundlyPairCount"
          class="w-30"
          size="small"
          :min="1"
          :max="game.allPairs.length"
        />
      </NFormItem>

      <NFormItem label="Record for achievement">
        <NInputNumber
          v-model:value="game.record"
          class="w-35"
          size="small"
          :precision="2"
          :min="0.01"
          clearable
          placeholder="Optional"
        />
      </NFormItem>
    </NForm>

    <template #action>
      <NTooltip>
        <template #trigger>
          <a class="i-logos:github-icon text-xl" href="https://github.com/typed-sigterm/ex-matcher" target="_blank" />
        </template>
        Source Code
      </NTooltip>
      <div>
        <NButton v-if="step > 1" class="mr-2" @click="step--">
          Prev
        </NButton>
        <NButton type="primary" :disabled="disableNext" @click="step++">
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
