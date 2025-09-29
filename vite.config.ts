import { fileURLToPath, URL } from 'node:url';
import pluginVue from '@vitejs/plugin-vue';
import pluginUnoCSS from 'unocss/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import pluginComponents from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginComponents({
      resolvers: [NaiveUiResolver()],
      dirs: ['src/components'],
      directoryAsNamespace: true,
    }),
    pluginUnoCSS(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 8808,
  },
});
