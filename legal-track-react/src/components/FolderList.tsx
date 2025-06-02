import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  CardActions,
  Box
} from "@mui/material";
import { Edit, Trash2, FolderOpen } from "lucide-react";

interface Folder {
  id: number;
  name: string;
  files: string[];
}

interface FolderListProps {
  folders: Folder[];
  onFolderClick: (folder: Folder) => void;
  onEditFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (folderId: number) => void;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  onFolderClick,
  onEditFolder,
  onDeleteFolder,
}) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: "repeat(1, 1fr)",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(4, 1fr)",
        xl: "repeat(5, 1fr)",
      }}
      gap={3}
      width="100%"
    >
      {folders.map((folder) => (
        <Card
          key={folder.id}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": {
              boxShadow: 6,
            },
          }}
          onClick={() => onFolderClick(folder)}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <FolderOpen size={20} />
              <Typography variant="h6" fontWeight={600}>
                {folder.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {folder.files.length} document(s)
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                const newName = prompt("Enter new folder name:", folder.name);
                if (newName && newName.trim() !== "") {
                  onEditFolder(folder.name, newName.trim());
                }
              }}
            >
              <Edit size={18} />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this folder?")) {
                  onDeleteFolder(folder.id);
                }
              }}
            >
              <Trash2 size={18} />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default FolderList;
