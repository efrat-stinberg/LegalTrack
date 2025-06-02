// import React, { useState } from 'react';
// import axios from 'axios';
// import { createDocument } from '../api/api';
// import DocumentPostModel from '../models/DocumentPostModel';

// const UploadToS321=  () => {
//     const [file, setFile] = useState<File | null>(null);
//     const [uploadStatus, setUploadStatus] = useState<string>('');

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0];
//         if (selectedFile) {
//             setFile(selectedFile);
//         }
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             alert("Please select a file to upload.");
//             return;
//         }
    
//         const objectKey = file.name; 
//         const contentType = file.type; 
//         try {
//             const uploadUrl = await getPreSignedUploadUrl(objectKey, contentType); 
//             const response = await axios.put(uploadUrl, file, {
//                 headers: {
//                     'Content-Type': contentType 
//                 },
//             });
    
//             if (response.status === 200) {
//                 setUploadStatus("File uploaded successfully!");
    
//                 // Create document object
//                 const document: DocumentPostModel = {
//                     DocumentName: objectKey,
//                     FilePath: uploadUrl, 
//                     FolderId: 1 
//                 };
    
//                 try{
//                     await createDocument(document);
//                 }catch (error) {
//                     console.error("Error creating document:", error);
//                     setUploadStatus("Error creating document.");
//                 }
//             }
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             setUploadStatus("Error uploading file.");
//         }
//     };
    

//     return (
//         <div>
//             <input type="file" onChange={handleFileChange} />
//             <button onClick={handleUpload}>Upload to S3</button>
//             {uploadStatus && <p>{uploadStatus}</p>}
//         </div>
//     );
// };

// export default UploadToS321;
