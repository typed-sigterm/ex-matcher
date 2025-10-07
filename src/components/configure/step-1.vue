<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui';
import { computed, inject, ref } from 'vue';
import { parseExcelFile } from '@/utils/excel';
import { EditingGameConfigSymbol } from './context';

const config = inject(EditingGameConfigSymbol)!;

const PairsInputProps = {
  inputProps: { style: 'white-space: nowrap' },
  type: 'textarea',
  autosize: { minRows: 10, maxRows: 10 },
} as const;

const pairsLeft = ref('');
const pairsRight = ref('');
const showManualInputModal = ref(false);
const uploadError = ref<string | undefined>();
const fileUploaded = ref(false);

const getInputPairs = () => [pairsLeft.value.trim().split('\n'), pairsRight.value.trim().split('\n')];

const localPairCount = computed(() => {
  const [l, r] = getInputPairs();
  const validL = l.filter(x => x.trim());
  const validR = r.filter(x => x.trim());
  return Math.min(validL.length, validR.length);
});

// Load existing pairs from config on mount
for (const pair of config.value.allPairs) {
  pairsLeft.value += `${pair[0]}\n`;
  pairsRight.value += `${pair[1]}\n`;
}

// Expose function to sync pairs back to config
function syncToConfig() {
  const [l, r] = getInputPairs();
  config.value.allPairs = [];
  for (let i = 0; i < l.length; i++) {
    const left = l[i].trim();
    const right = r[i].trim();
    if (left || right) {
      config.value.allPairs.push([left, right]);
    }
  }
}

const isValid = computed(() => {
  if (uploadError.value)
    return false;
  const [l, r] = getInputPairs().map(x => new Set(x));
  return l.size > 0 && l.size === r.size; // deduplicate
});

defineExpose({ syncToConfig, isValid });

async function handleFileChange(options: { fileList: UploadFileInfo[] }) {
  uploadError.value = undefined;

  if (!options.fileList || options.fileList.length === 0) {
    fileUploaded.value = false;
    pairsLeft.value = '';
    pairsRight.value = '';
    return;
  }

  const fileInfo = options.fileList[0];
  if (!fileInfo.file)
    return;

  const result = await parseExcelFile(fileInfo.file);

  if (!result.success) {
    uploadError.value = result.error;
    fileUploaded.value = false;
    return;
  }

  // Success: update local state with parsed pairs (not store directly)
  const pairs = result.pairs || [];
  pairsLeft.value = '';
  pairsRight.value = '';
  for (const pair of pairs) {
    pairsLeft.value += `${pair[0]}\n`;
    pairsRight.value += `${pair[1]}\n`;
  }
  fileUploaded.value = true;
}

function openManualInput() {
  showManualInputModal.value = true;
}

function saveManualInput() {
  uploadError.value = undefined;
  fileUploaded.value = false;
  showManualInputModal.value = false;
}
</script>

<template>
  <div>
    <p class="mb-4">
      Upload an Excel file with pairs in columns A and B, or
      <a class="cursor-pointer text-blue-500 hover:text-blue-600" @click="openManualInput">
        use manual input
      </a>.
    </p>

    <NUpload
      v-show="!fileUploaded"
      accept=".xlsx,.xls"
      :max="1"
      :default-upload="false"
      @change="handleFileChange"
    >
      <NUploadDragger>
        <div class="mb-3 flex justify-center">
          <div class="i-lucide:upload text-5xl text-gray-400" />
        </div>
        <p class="text-base">
          Click or drag Excel file here
        </p>
        <p class="mt-2 text-sm text-gray-500">
          Please ensure columns A and B contain the candidate pairs
        </p>
      </NUploadDragger>
    </NUpload>

    <NAlert v-if="uploadError" type="error" class="mt-2">
      {{ uploadError }}
    </NAlert>

    <NAlert v-else-if="localPairCount > 0" type="success" class="mt-2">
      {{ localPairCount }} pairs loaded
    </NAlert>

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

    <div v-if="localPairCount > 0" class="mt-4 text-sm text-gray-600">
      {{ localPairCount }} pairs detected
    </div>
  </div>
</template>
