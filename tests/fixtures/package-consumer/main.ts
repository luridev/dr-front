import { DrFrontProvider } from '@protoapps/dr-front';
import { createApp, h, onMounted, shallowRef } from 'vue';
import '@protoapps/dr-front/styles.css';
import App from './App.vue';

createApp({
  setup() {
    const backgroundRoot = shallowRef<HTMLElement | null>(null);

    onMounted(() => {
      backgroundRoot.value = document.getElementById('app');
    });

    return () => h(DrFrontProvider, { language: 'ru', locale: 'en-GB', backgroundRoot: backgroundRoot.value }, {
      default: () => h(App),
    });
  },
}).mount('#app');
