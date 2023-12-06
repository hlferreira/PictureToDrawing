/* @refresh reload */
import { render } from 'solid-js/web'
import { bootstrap } from './bootstrap'

import App from './app'

const app = document.getElementById('app');

if (!(app instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// await new Promise(resolve => setTimeout(resolve, 100));
window.cvInit = () => {
  bootstrap();
  render(App, app);
}