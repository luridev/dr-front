import { DrConfigProvider, DrToastHost } from '@protoapps/dr-front';
import { createApp, h } from 'vue';
import '@protoapps/dr-front/styles.css';
import App from './App.vue';

createApp({
  render: () => h(DrConfigProvider, { language: 'ru', locale: 'en-GB' }, {
    default: () => h(DrToastHost, null, { default: () => h(App) }),
  }),
}).mount('#app');
