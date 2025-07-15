import axios from 'axios';

const API_URL = '/api/client';

export const getClients = () => axios.get(`${API_URL}`);
export const getClientById = (id: number) => axios.get(`${API_URL}/${id}`);
export const createClient = (data: any) => axios.post(`${API_URL}`, data);
export const updateClient = (id: number, data: any) => axios.put(`${API_URL}/${id}`, data);
export const deleteClient = (id: number) => axios.delete(`${API_URL}/${id}`);
