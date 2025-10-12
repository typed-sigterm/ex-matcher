<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui';
import { inject, ref, watch } from 'vue';
import { parseExcelFile } from '@/utils/excel';
import { DisableNext, EditingGameConfig, SyncToConfig } from './context';

const config = inject(EditingGameConfig)!;
const disableNext = inject(DisableNext)!;
const syncToConfigRef = inject(SyncToConfig)!;

const PairsInputProps = {
  inputProps: { style: 'white-space: nowrap' },
  type: 'textarea',
  autosize: { minRows: 10, maxRows: 10 },
} as const;

const pairsLeft = ref('');
const pairsRight = ref('');
const showManualInputModal = ref(false);
const excelError = ref<string | undefined>();

const getInputPairs = () => [pairsLeft.value.trim().split('\n'), pairsRight.value.trim().split('\n')];

// Load existing pairs from config on mount
for (const pair of config.value.allPairs) {
  pairsLeft.value += `${pair[0]}\n`;
  pairsRight.value += `${pair[1]}\n`;
}

// Function to sync pairs back to config
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

// Register sync function with parent via ref
syncToConfigRef.value = syncToConfig;

// Watch for validation changes and update disableNext
watch(
  () => {
    if (excelError.value)
      return true;
    const [l, r] = getInputPairs().map(x => new Set(x));
    return !(l.size > 0 && l.size === r.size); // deduplicate
  },
  (invalid) => {
    disableNext.value = invalid;
  },
  { immediate: true },
);

async function handleFileChange(options: { fileList: UploadFileInfo[] }) {
  excelError.value = undefined;
  if (!options.fileList || options.fileList.length === 0) {
    pairsLeft.value = '';
    pairsRight.value = '';
    return;
  }

  const fileInfo = options.fileList[0];
  if (!fileInfo.file)
    return;

  try {
    const result = await parseExcelFile(fileInfo.file);
    pairsLeft.value = result.map(p => p[0]).join('\n');
    pairsRight.value = result.map(p => p[1]).join('\n');
  } catch (e) {
    excelError.value = String(e);
  }
}

function openManualInput() {
  showManualInputModal.value = true;
}

function saveManualInput() {
  excelError.value = undefined;
  showManualInputModal.value = false;
}
</script>

<template>
  <div>
    <p class="mb-4">
      Upload an Excel file with pairs in columns A and B, or
      <NA @click="openManualInput">
        use manual input
      </NA>
      .
    </p>

    <NUpload
      accept=".xlsx,.xls,.csv"
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
      </NUploadDragger>
    </NUpload>

    <NAlert v-if="excelError" type="error" class="mt-2">
      {{ excelError }}
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
  </div>
</template>
