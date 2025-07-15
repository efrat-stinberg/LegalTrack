import React from "react";

interface FileUploadProps {
  folderName: string;
  files: string[];
  onClose: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ folderName, onClose }) => {
  return (
    <div>
      <h2>uploud files to folder: {folderName}</h2>
      <button onClick={onClose}>סגור</button>
      {/* Implement file upload functionality here */}
    </div>
  );
};

export default FileUpload;
