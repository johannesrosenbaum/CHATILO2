import axios from 'axios';
import { AuthResponse, User } from '../types/auth';

const API_URL = 'https://your-api-url.com/api'; // Replace with your actual API URL

const authService = {
    register: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/register`, { email, password });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    },

    googleLogin: async (idToken: string): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/google-login`, { idToken });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await axios.post(`${API_URL}/logout`);
    },

    getCurrentUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    setUser: (user: User): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearUser: (): void => {
        localStorage.removeItem('user');
    }
};

export default authService;