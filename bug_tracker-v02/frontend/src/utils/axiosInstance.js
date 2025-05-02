import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add JWT token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { data } = error.response; // 🔥 correctly get data

            if (error.response.status === 401) {
                localStorage.removeItem('token'); // <-- Clear token manually
                window.location.href = '/login';   // Redirect
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later.");
            } else if (data && data.message) {
                console.error(`Error: ${data.message}`);
            }
        } 
        else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out. Please try again later.');
        } else {
            console.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;