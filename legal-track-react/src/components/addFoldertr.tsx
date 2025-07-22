// import React, { useState } from 'react';

// const AddFolderq = () => {
//     const [folderName, setFolderName] = useState('');

//     const handleSubmit = async (e: any) => {
//         e.preventDefault();

//         const folderModel = {
//             folderName: folderName,
//         };

//         try {
//             const response = await fetch('https://legaltrack-server.onrender.com/api/Folder/Add', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(folderModel),
//             });

//             if (response.ok) {
//                 alert('Folder added successfully!');
//                 // Optionally, reset the form or handle success
//                 setFolderName('');
//             } else {
//                 const errorText = await response.text();
//                 alert(`Error: ${errorText}`);
//             }
//         } catch (error) {
//             console.error('Error adding folder:', error);
//             alert('An error occurred while adding the folder.');
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <input
//                 type="text"
//                 value={folderName}
//                 onChange={(e) => setFolderName(e.target.value)}
//                 placeholder="Folder Name"
//                 required
//             />
//             <button type="submit">Add Folder</button>
//         </form>
//     );
// };

// export default AddFolderq;
