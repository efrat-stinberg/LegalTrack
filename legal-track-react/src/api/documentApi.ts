import { apiClient, API_BASE_URL } from "./config";
import DocumentPostModel from "../models/DocumentPostModel";
import DocumentDTO from "../models/DocumentDTO";

// ===== DOCUMENT API =====

export const getAllDocuments = async (): Promise<DocumentDTO[]> => {
  try {
    console.log('Fetching all documents...');
    const response = await apiClient.get('/Document');
    console.log(`Fetched ${response.data.length} documents`);
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDocumentById = async (id: number): Promise<DocumentDTO> => {
  try {
    console.log(`Fetching document with ID ${id}...`);
    const response = await apiClient.get(`/Document/${id}`);
    console.log(`Document ${id} fetched successfully`);
    return response.data;
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    throw error;
  }
};

export const createDocument = async (document: DocumentPostModel): Promise<void> => {
  try {
    console.log('Creating document:', document.DocumentName);
    await apiClient.post('/Document', document);
    console.log('Document created successfully');
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const updateDocument = async (id: number, document: DocumentPostModel): Promise<void> => {
  try {
    console.log(`Updating document ${id}:`, document.DocumentName);
    await apiClient.put(`/Document/${id}`, document);
    console.log('Document updated successfully');
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (fileKey: string): Promise<void> => {
  try {
    console.log('Deleting document with fileKey:', fileKey);
    const decodedFileKey = decodeURIComponent(fileKey);
    const url = `${API_BASE_URL}/s3/delete?fileKey=${encodeURIComponent(decodedFileKey)}`;
    
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
    console.log('Document deleted successfully');
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};