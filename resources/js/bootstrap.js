import 'bootstrap';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.Pusher = Pusher;

/**
 * Configuração do Laravel Echo para se conectar ao servidor Soketi local.
 */
console.log('VITE_PUSHER_APP_KEY:', import.meta.env.VITE_PUSHER_APP_KEY);
console.log('VITE_PUSHER_HOST:', import.meta.env.VITE_PUSHER_HOST);
console.log('VITE_PUSHER_PORT:', import.meta.env.VITE_PUSHER_PORT);
console.log('VITE_PUSHER_SCHEME:', import.meta.env.VITE_PUSHER_SCHEME);
console.log('VITE_PUSHER_APP_CLUSTER:', import.meta.env.VITE_PUSHER_APP_CLUSTER);

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});
