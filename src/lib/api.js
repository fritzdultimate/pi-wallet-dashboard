// src/lib/api.js
//
// Thin axios wrapper. Every non-login request carries the owner's JWT from local
// component state (see AuthContext) - never a hardcoded credential.

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function createApiClient(token) {
    const client = axios.create({ baseURL });
    if (token) {
        client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    return client;
}

export { baseURL };
