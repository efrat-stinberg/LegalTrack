import axios from "axios";
import User from "../models/User";
import Folder from "../models/Folder";
import MyFolder from "../models/Folder";
import DocumentPostModel from "../models/DocumentPostModel";
import DocumentDTO from "../models/DocumentDTO";

const API_URL = "https://localhost:7042/api";

const getAuthToken = () => {
  let token = localStorage.getItem("token");
  if (token) {
    token = token.replace(/^"|"$/g, '');
  } else {
    throw new Error("Authentication token is missing.");
  } 
  return token;
};


export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/Auth/login`, {
          email,
          password,
        });
        return response.data.token;
      } catch (error : any ) {
        console.error("Login failed:", error.response ? error.response.data : error.message);
        throw error;
      }   
};


export const registerUser = async (
    username: string,
    email: string,
    password: string,
    isAdmin: boolean = false
  ): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/Auth/register`, {
        username,
        email,
        password,
        groupId: 0,
        isAdmin 
      });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                alert("User with this email already exists.");
                throw new Error("Registration failed: User with this email already exists.");
            }
            throw new Error(`Registration failed: ${error.response?.data?.message || "Unknown error"}`);
        } else {
            throw new Error("Registration failed: Unknown error");
        }
    }
};

export const updateUser = async (updatedUser: User) => {
  try {
    const id = updatedUser.userId;
    const response = await axios.put(`${API_URL}/users/${id}`, updatedUser);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error updating user");
    } else {
      throw new Error("Error updating user");
    }
  }
};

export const getUserByEmail = async (email: string) => {
  const response = await axios.get(`${API_URL}/users/${email}`);
  console.log(response.data);
  return response.data;
};

export const getAllFolders = async (): Promise<Folder[]> => {
  console.log("i entered to get all folders");

  let token = getAuthToken();

  try {
      const response = await axios.get(`${API_URL}/Folder`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching folders:", error);
      throw error;
  }
};

export const getFolderByIdWithDocuments = async (id: number): Promise<Folder> => {
  const token = getAuthToken();
  try {
      const response = await axios.get(`${API_URL}/Folder/${id}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      console.log("Folder fetched by ID:", response.data);
      return response.data;
  } catch (error) {
      console.error(`Error fetching folder with ID ${id}:`, error);
      throw error;
  }
};


export const getFolderById = async (): Promise<Folder> => {
  const token = getAuthToken();
  try {
      const response = await axios.get(`${API_URL}/folder`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });      
      return response.data;
  } catch (error) {
      console.error("Error fetching folder by ID:", error);
      throw error;
  }
};


export const createFolder = async (folderName: string): Promise<Folder> => {
  const token = getAuthToken();
  try {
    const response = await axios.post(`${API_URL}/Folder`, { FolderName: folderName }, {
      headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": 'application/json'
      },
  });  
  console.log("create folder: ",response);
  
      return response.data;
  } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
  }
};


export const updateFolder = async (id: number, folderData: MyFolder): Promise<void> => {
  const token = getAuthToken();
  try {
      await axios.put(`${API_URL}/folder/${id}`, folderData, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
  } catch (error) {
      console.error("Error updating folder:", error);
      throw error;
  }
};

export const deleteFolder = async (id: number): Promise<void> => {
  const token = getAuthToken();
  console.log("i entered to delete folder", id);
  try {
      await axios.delete(`${API_URL}/folder/${id}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
  } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
  }
};


export const getAllDocuments = async (): Promise<DocumentDTO[]> => {
  const token = getAuthToken();
  try {
      const response = await axios.get(`${API_URL}/Document`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
  }
};


export const getDocumentById = async (id: number): Promise<DocumentDTO> => {
  const token = getAuthToken();
  try {
      const response = await axios.get(`${API_URL}/Document/${id}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching document by ID:", error);
      throw error;
  }
};


export const createDocument = async (document: DocumentPostModel): Promise<void> => {
  const token = getAuthToken();
  try {
      await axios.post(`${API_URL}/Document`, document, {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": 'application/json'
          },
      });
      console.log();
  } catch (error) {
      console.error("Error creating document:", error);
      throw error;
  }
};

export const updateDocument = async (id: number, document: DocumentPostModel): Promise<void> => {
  const token = getAuthToken();
  try {
      await axios.put(`${API_URL}/Document/${id}`, document, {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": 'application/json'
          },
      });
  } catch (error) {
      console.error("Error updating document:", error);
      throw error;
  }
};

export const deleteDocument = async (fileKey: string) => {
  console.log("Received encoded fileKey:", fileKey);

  // קודם מפענחים כדי להסיר את הקידוד הקיים
  const decodedFileKey = decodeURIComponent(fileKey);

  console.log("Decoded fileKey:", decodedFileKey);

  // עכשיו מקודדים מחדש פעם אחת בלבד
  const url = `https://localhost:7042/api/s3/delete?fileKey=${encodeURIComponent(decodedFileKey)}`;
  console.log("Sending DELETE request to:", url);

  const response = await fetch(url, { method: 'DELETE' });
  console.log("Response status:", response.status);

  if (!response.ok) throw new Error("Failed to delete file");
};



export const getFileUrl = async (objectKey: string, contentType: string): Promise<string> => {
  const token = getAuthToken();

  try {
    const response = await axios.get(`${API_URL}/s3/presigned-upload-url`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        objectKey,
        contentType,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getting presigned file URL:", error);
    throw error;
  }
};

export const getDownloadUrl = async (objectKey: string): Promise<string> => {
  const token = getAuthToken();

  const response = await axios.get(`${API_URL}/s3/presigned-download-url`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { objectKey },
  });

  return response.data.url; 
};


// שלב 2: העלאה ישירה ל-S3
export const uploadFileToS3 = async (file: File, uploadUrl: string): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });
};



export const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; objectKey: string }> => {
  const token = getAuthToken();

  const response = await axios.get(`${API_URL}/s3/presigned-upload-url`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      fileName,
      contentType,
    },
  });

  return response.data;
};



export const uploadFileToServer = async (file: File, folderId: number) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folderId", folderId.toString());

  const token = getAuthToken();

  const response = await axios.post(`${API_URL}/s3/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


export const notifyServerAboutUpload = async (
  folderId: number,
  objectKey: string
): Promise<void> => {
  const token = getAuthToken();

  await axios.post(
    `${API_URL}/s3/notify-upload`,
    {
      folderId,
      objectKey,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const uploadFile = async (file: File, folderId: number) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folderId", folderId.toString());

  const response = await axios.post("/api/s3/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

