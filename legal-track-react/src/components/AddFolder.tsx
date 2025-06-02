import React, { useState } from "react";

interface AddFolderFormProps {
  onAddFolder: (folderName: string) => void;
}

const AddFolderForm: React.FC<AddFolderFormProps> = ({ onAddFolder }) => {
  const [folderName, setFolderName] = useState<string>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (folderName.trim()) {
      onAddFolder(folderName.trim());
      setFolderName("");
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Folder
        </button>
      </form>
    </div>
  );
};

export default AddFolderForm;
