import { apiClient } from './config';
import { Client } from '../models/Client';

export const getClients = async () => {
  try {
    console.log('ClientAPI: Fetching clients...');
    
    // נסה כמה endpoints אפשריים
    const possibleEndpoints = ['/client', '/clients', '/Client', '/Clients'];
    let response;
    let lastError;
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`ClientAPI: Trying endpoint: ${endpoint}`);
        response = await apiClient.get(endpoint);
        
        // בדוק שהתגובה היא JSON ולא HTML
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
          console.warn(`ClientAPI: Endpoint ${endpoint} returned HTML, trying next...`);
          continue;
        }
        
        console.log(`ClientAPI: Success with endpoint: ${endpoint}`);
        break;
      } catch (error: any) {
        console.warn(`ClientAPI: Endpoint ${endpoint} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!response) {
      console.error('ClientAPI: All endpoints failed, returning empty array');
      console.error('ClientAPI: Last error:', lastError);
      return { data: [] };
    }
    
    const clients = response.data || [];
    console.log('ClientAPI: Clients fetched successfully:', clients);
    
    // וודא שזה array
    if (!Array.isArray(clients)) {
      console.error('ClientAPI: Response is not an array:', clients);
      return { data: [] }; // החזר array ריק
    }
    
    return { data: clients };
  } catch (error: any) {
    console.error('ClientAPI: Error fetching clients:', error);
    
    // במקרה של שגיאה, החזר array ריק כדי שהאפליקציה תמשיך לעבוד
    console.warn('ClientAPI: Returning empty array due to error');
    return { data: [] };
  }
};

export const getClientById = async (id: number) => {
  try {
    console.log(`ClientAPI: Fetching client ${id}...`);
    const response = await apiClient.get(`/client/${id}`);
    console.log('ClientAPI: Client fetched successfully');
    return response.data;
  } catch (error) {
    console.error(`ClientAPI: Error fetching client ${id}:`, error);
    throw error;
  }
};

export const createClient = async (data: Partial<Client>) => {
  try {
    console.log('ClientAPI: Creating client:', data);
    const response = await apiClient.post('/client', data);
    console.log('ClientAPI: Client created successfully');
    return response.data;
  } catch (error) {
    console.error('ClientAPI: Error creating client:', error);
    throw error;
  }
};

export const updateClient = async (id: number, data: Partial<Client>) => {
  try {
    console.log(`ClientAPI: Updating client ${id}:`, data);
    const response = await apiClient.put(`/client/${id}`, data);
    console.log('ClientAPI: Client updated successfully');
    return response.data;
  } catch (error) {
    console.error(`ClientAPI: Error updating client ${id}:`, error);
    throw error;
  }
};

export const deleteClient = async (id: number) => {
  try {
    console.log(`ClientAPI: Deleting client ${id}...`);
    await apiClient.delete(`/client/${id}`);
    console.log('ClientAPI: Client deleted successfully');
  } catch (error) {
    console.error(`ClientAPI: Error deleting client ${id}:`, error);
    throw error;
  }
};