// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { current } from '@reduxjs/toolkit';
// import { useSelector } from 'react-redux';
// import { RootState } from '../store';
// import { getAllFolders } from '../../api/api';
// import MyFolder from '../../models/Folder';
// import { addFolder } from '../action';

// const FolderPage = () => {
//     const [folders, setFolders] = useState<MyFolder[]>([]);
//     const [folderName, setFolderName] = useState('');
//     const [selectedFolderId, setSelectedFolderId] = useState('');
//     const [documents, setDocuments] = useState([]);
//     const [documentName, setDocumentName] = useState('');
//     const storedToken = localStorage.getItem('token');
//     const currentUser = useSelector((state: RootState) => state.user.currentUser);
//     const userId =  currentUser?.userId // Assuming userId is stored in localStorage

//     const fetchFolders = async () => {
//         try {
//             const storedToken = localStorage.getItem('token');
//             console.log("Stored Token:", storedToken);
//             const response = await getAllFolders();
//             setFolders(response);
//         } catch (error) {
//             console.error('Failed to fetch folders:', error);
//         }
//     };

//     const createFolder = async () => {
//         try {
//             await addFolder(folderName);
//             setFolderName('');
//             fetchFolders();
//         } catch (error) {
//             alert('Failed to create folder');
//         }
//     };

//     const updateFolder = async () => {
//         try {
//             await axiosInstance.put(`/Folder/${selectedFolderId}`, { FolderName: folderName });
//             setFolderName('');
//             setSelectedFolderId('');
//             fetchFolders();
//         } catch (error) {
//             alert('Failed to update folder');
//         }
//     };

//     const deleteFolder = async (id: string) => {
//         try {
//             await axiosInstance.delete(`/Folder/${id}`);
//             fetchFolders();
//         } catch (error) {
//             alert('Failed to delete folder');
//         }
//     };

//     const fetchDocuments = async (folderId: string) => {
//         try {
//             const response = await axiosInstance.get(`/Folder/${folderId}/Documents`);
//             setDocuments(response.data);
//         } catch (error) {
//             console.error('Failed to fetch documents:', error);
//         }
//     };

//     const addDocument = async () => {
//         try {
//             await axiosInstance.post(`/Folder/${selectedFolderId}/Documents`, { DocumentName: documentName });
//             setDocumentName('');
//             fetchDocuments(selectedFolderId);
//         } catch (error) {
//             alert('Failed to add document');
//         }
//     };

//     const removeDocument = async (documentId: number) => {
//         try {
//             await axiosInstance.delete(`/Folder/${selectedFolderId}/Documents/${documentId}`);
//             fetchDocuments(selectedFolderId);
//         } catch (error) {
//             alert('Failed to remove document');
//         }
//     };

//     useEffect(() => {
//         fetchFolders();
//     }, []);

//     return (
//         <div>
//             <h1>Folders</h1>
//             <input
//                 type="text"
//                 value={folderName}
//                 onChange={(e) => setFolderName(e.target.value)}
//                 placeholder="Folder Name"
//             />
//             <button onClick={createFolder}>Create Folder</button>
//             <button onClick={updateFolder} disabled={!selectedFolderId}>Update Folder</button>

//             <ul>
//                 {folders.map((folder: any) => (
//                     <li key={folder.folderId}>
//                         {folder.folderName}
//                         <button onClick={() => {
//                             setSelectedFolderId(folder.folderId);
//                             setFolderName(folder.folderName);
//                             fetchDocuments(folder.folderId);
//                         }}>Edit</button>
//                         <button onClick={() => deleteFolder(folder.folderId)}>Delete</button>
//                     </li>
//                 ))}
//             </ul>

//             {selectedFolderId && (
//                 <div>
//                     <h2>Documents in Folder</h2>
//                     <input
//                         type="text"
//                         value={documentName}
//                         onChange={(e) => setDocumentName(e.target.value)}
//                         placeholder="Document Name"
//                     />
//                     <button onClick={addDocument}>Add Document</button>

//                     <ul>
//                         {documents.map((doc: any) => (
//                             <li key={doc.documentId}>
//                                 {doc.documentName}
//                                 <button onClick={() => removeDocument(doc.documentId)}>Remove</button>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FolderPage;