// Edit the signed-in user's name and email (opened from the user menu).
import React, { useState, useEffect } from "react";
import { Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import { X } from "lucide-react";
import { tokens } from "../theme";

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { name: string; email: string }) => void;
  user: { name: string; email: string };
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user 
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setErrors({});
    }
  }, [isOpen, user]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'שם הוא שדה חובה';
    } else if (name.trim().length < 2) {
      newErrors.name = 'שם חייב להכיל לפחות 2 תווים';
    }
    
    if (!email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'אימייל לא תקין';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave({ 
        name: name.trim(), 
        email: email.trim() 
      });
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ general: 'שגיאה בשמירת הנתונים' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const firstLetter = (name || user.name || "?").charAt(0).toUpperCase();

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth aria-labelledby="user-edit-title">
      <DialogTitle id="user-edit-title" sx={{ display: "flex", alignItems: "center", gap: 1.5, paddingInlineEnd: 7 }}>
        <Avatar sx={{ width: 36, height: 36, fontSize: 16 }} aria-hidden="true">
          {firstLetter}
        </Avatar>
        <Box>
          עריכת פרופיל
          <Typography sx={{ fontSize: 13, color: tokens.slate, fontWeight: 400 }}>השם והאימייל שלך במערכת</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={isLoading} aria-label="סגירה" size="small" sx={{ position: "absolute", insetInlineEnd: 12, top: 14 }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: tokens.borderSoft }}>
        {errors.general && (
          <Alert severity="error" role="alert" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" id="user-edit-form" noValidate onSubmit={(e) => { e.preventDefault(); handleSave(); }} sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="שם מלא"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            error={!!errors.name}
            helperText={errors.name || " "}
            fullWidth
            disabled={isLoading}
          />
          <TextField
            label="אימייל"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            error={!!errors.email}
            helperText={errors.email || " "}
            fullWidth
            disabled={isLoading}
            inputProps={{ dir: "ltr", style: { textAlign: "right" } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isLoading}>
          ביטול
        </Button>
        <Button type="submit" form="user-edit-form" variant="contained" disabled={isLoading || !name.trim() || !email.trim()} sx={{ minWidth: 120 }}>
          {isLoading ? <CircularProgress size={18} sx={{ color: "#FFFFFF" }} /> : "שמירה"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditDialog;
