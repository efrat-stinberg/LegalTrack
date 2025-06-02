import React from "react";

interface FileUploadProps {
  folderName: string;
  files: string[];
  onClose: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ folderName, files, onClose }) => {
  return (
    <div>
      <h2>העלאת קבצים לתיקייה: {folderName}</h2>
      <button onClick={onClose}>סגור</button>
      {/* Implement file upload functionality here */}
    </div>
  );
};

export default FileUpload;
