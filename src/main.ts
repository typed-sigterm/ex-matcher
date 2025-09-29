import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './app.vue';
import './main.css';
import 'virtual:uno.css';
import '@unocss/reset/eric-meyer.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
  .use(pinia)
  .mount('#app');
