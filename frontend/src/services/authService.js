import axios from 'axios';

const API_URL = 'http://localhost:3000/api/user';

const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};

const login = async (credentials) => {
    // credentials: { email, password }
    // Backend userController.login expects { email, password }
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', response.data.user.role);
    }
    return response.data;
};

const googleLogin = async (credential) => {
    const response = await axios.post(`${API_URL}/google`, { credential });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', response.data.user.role);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('adminPasskey'); // Clear legacy if exists
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    googleLogin
};

export default authService;
