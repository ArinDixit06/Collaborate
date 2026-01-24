import axios from 'axios';
import store from '../store';
import { setServerOffline, setServerOnline } from '../actions/serverActions';

// 1. Capture the variable
const BACKEND_URL = import.meta.env.VITE_APP_API_URL;

// 2. Safety Check: If this is missing, the app relies on Vercel (BAD).
// This log will show up in your browser console if the var is missing.
if (!BACKEND_URL) {
  console.error("FATAL ERROR: VITE_APP_API_URL is undefined. API calls will fail.");
}

const api = axios.create({
  // 3. FORCE the absolute URL. 
  // If BACKEND_URL is undefined, this will remain undefined 
  // and axios might default to current origin, but we want to catch it.
  baseURL: BACKEND_URL, 
});

// Request interceptor
api.interceptors.request.use((config) => {
  const { serverStatus } = store.getState();
  
  // EXTRA SAFETY: If the config.baseURL somehow became relative (empty), force it again here
  if (!config.baseURL || config.baseURL === '') {
     console.warn("Fixing missing Base URL on the fly...");
     config.baseURL = BACKEND_URL;
  }

  if (serverStatus.status === 'offline') {
    store.dispatch(setServerOnline());
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ... keep your response interceptor as is ...

export default api;
