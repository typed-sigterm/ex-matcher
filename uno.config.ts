import presetIcons from '@unocss/preset-icons';
import { defineConfig, presetMini } from 'unocss';

export default defineConfig({
  presets: [
    presetMini(),
    presetIcons(),
  ],
});
