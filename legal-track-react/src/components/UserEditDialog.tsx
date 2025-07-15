import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Fade,
  useTheme,
  alpha,
  InputAdornment,
  Alert
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  X,
  User,
  Mail,
  Save,
  Camera,
  Edit3
} from "lucide-react";

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { name: string; email: string }) => void;
  user: { name: string; email: string };
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 450,
    background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  position: 'relative',
  textAlign: 'center',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  border: `3px solid ${alpha(theme.palette.common.white, 0.3)}`,
  fontSize: '2rem',
  fontWeight: 700,
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'scale(1.05)',
    '& .camera-overlay': {
      opacity: 1,
    }
  }
}));

const CameraOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '50%',
  background: alpha(theme.palette.common.black, 0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  color: 'white',
  
  '&:hover': {
    background: alpha(theme.palette.common.white, 0.3),
    transform: 'scale(1.1)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
  
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.4),
  },
  
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  }
}));

const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  },
  
  '&:disabled': {
    background: alpha(theme.palette.action.disabled, 0.12),
    color: theme.palette.action.disabled,
    transform: 'none',
    boxShadow: 'none',
  }
}));

const CancelButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  border: `2px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
  color: theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: alpha(theme.palette.text.secondary, 0.4),
    background: alpha(theme.palette.text.secondary, 0.05),
  }
}));

const UserEditDialog: React.FC<UserEditDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user 
}) => {
  const theme = useTheme();
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

  const firstLetter = name ? name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();

  return (
    <StyledDialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      {/* Header */}
      <DialogHeader>
        <CloseButton onClick={handleClose} disabled={isLoading}>
          <X size={20} />
        </CloseButton>
        
        <UserAvatar>
          {firstLetter}
          <CameraOverlay className="camera-overlay">
            <Camera size={24} color="white" />
          </CameraOverlay>
        </UserAvatar>
        
        <Typography variant="h5" fontWeight={700} gutterBottom>
          עריכת פרופיל
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          עדכן את פרטיך האישיים
        </Typography>
      </DialogHeader>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errors.general}
          </Alert>
        )}
        
        <Box display="flex" flexDirection="column" gap={3}>
          <StyledTextField
            label="שם מלא"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
            }}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box 
          mt={3} 
          p={2} 
          bgcolor={alpha(theme.palette.info.main, 0.05)} 
          borderRadius={2}
          border={`1px solid ${alpha(theme.palette.info.main, 0.2)}`}
        >
          <Typography variant="body2" color="info.main" fontWeight={600} gutterBottom>
            💡 טיפ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            שימוש באימייל תקין חיוני לקבלת התראות ועדכונים במערכת
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <CancelButton 
          onClick={handleClose} 
          disabled={isLoading}
          fullWidth
        >
          ביטול
        </CancelButton>
        <SaveButton
          onClick={handleSave}
          disabled={isLoading || !name.trim() || !email.trim()}
          startIcon={isLoading ? null : <Save size={18} />}
          fullWidth
        >
          {isLoading ? 'שומר...' : 'שמור שינויים'}
        </SaveButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default UserEditDialog;