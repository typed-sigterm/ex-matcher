<script setup lang="ts"></script>

<template>
  <NConfigProvider inline-theme-disabled>
    <NMessageProvider>
      <NModalProvider>
        <ExMatcher />
      </NModalProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
