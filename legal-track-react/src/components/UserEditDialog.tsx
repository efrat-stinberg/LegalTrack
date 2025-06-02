import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { name: string; email: string }) => void;
  user: { name: string; email: string };
}

const UserEditDialog = ({ isOpen, onClose, onSave, user }: UserEditDialogProps) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState("");

  const handleSave = () => {
    onSave({ name, email });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>עריכת נתוני משתמש</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="שם"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="מייל"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          ביטול
        </Button>
        <Button onClick={handleSave} color="primary">
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditDialog;
