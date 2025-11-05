import { registerSW } from 'virtual:pwa-register';

// This function automatically registers and updates the service worker
registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('App ready to work offline!');
  },
});
