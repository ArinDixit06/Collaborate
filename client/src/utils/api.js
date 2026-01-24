import axios from 'axios';
import store from '../store';
import { setServerOffline, setServerOnline } from '../actions/serverActions';

// 1. STRICT CHECK: Ensure the variable exists. 
// If this logs "undefined", go to Vercel -> Settings -> Env Variables and add VITE_APP_API_URL
const API_URL = import.meta.env.VITE_APP_API_URL;

if (!API_URL) {
  console.error(
    'CRITICAL ERROR: VITE_APP_API_URL is missing! Requests will fail.'
  );
  // Optional: You could throw an error here to stop execution if you want to be strict
  // throw new Error("Missing VITE_APP_API_URL in environment variables");
}

const api = axios.create({
  // 2. NO FALLBACK: Remove the || '' so it never defaults to localhost/vercel
  baseURL: API_URL, 
});

// Request interceptor
api.interceptors.request.use((config) => {
  const { serverStatus } = store.getState();
  if (serverStatus.status === 'offline') {
    store.dispatch(setServerOnline());
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const { serverStatus } = store.getState();
    if (serverStatus.status !== 'online') {
      store.dispatch(setServerOnline());
    }
    return response;
  },
  (error) => {
    // 3. ENHANCED ERROR HANDLING
    if (error.response) {
        // Server responded with 4xx or 5xx
        console.error(`API Error: ${error.response.status} - ${error.response.data.message || error.message}`);
    } else if (error.request) {
      // 4. THIS IS THE "SERVER DOWN" CATCH
      // The request was made but no response received (Network Error)
      console.error('Network Error: Server is likely down or unreachable.');
      store.dispatch(setServerOffline());
    } else {
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
