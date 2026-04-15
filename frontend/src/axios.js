import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
});

const getTenantDomain = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p !== '');
    
    // Prioritaskan segment pertama URL sebagai domain tenant,
    // asalkan bukan rute internal seperti 'superadmin'
    if (parts.length > 0 && !['superadmin', 'admin', 'login'].includes(parts[0])) {
        return parts[0];
    }
    
    return 'default-tenant';
};

api.interceptors.request.use(config => {
    config.headers['X-Tenant-Domain'] = getTenantDomain();
    
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
