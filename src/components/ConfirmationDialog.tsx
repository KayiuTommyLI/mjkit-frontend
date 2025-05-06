// src/components/ConfirmationDialog.tsx
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CircularProgress, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean; // Optional: true if confirm action is in progress (shows loading)
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false, // Default to not loading
}) => {
  const { t } = useTranslation(); 

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      PaperComponent={props => (
        <Paper 
          {...props} 
          sx={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.95)', 
            color: 'white',
            borderRadius: 1,
            border: '1px solid rgba(192, 192, 192, 0.3)',
          }} 
        />
      )}
    >
      <DialogTitle id="confirmation-dialog-title" 
        sx={{ borderBottom: '1px solid rgba(192, 192, 192, 0.2)' }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <DialogContentText id="confirmation-dialog-description" sx={{ color: 'silver' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid rgba(192, 192, 192, 0.2)' }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: 'silver', 
            '&:hover': { 
              color: 'white', 
              backgroundColor: 'rgba(255, 255, 255, 0.08)' 
            }
          }}
        >
          {t('cancel')}
        </Button>
        <Button
            onClick={onConfirm}
            color="error" // Use error color for destructive actions like delete
            variant="contained"
            disabled={isConfirming} // Disable confirm button while loading
            autoFocus
            startIcon={isConfirming ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: theme => theme.palette.error.dark,
              '&:hover': {
                backgroundColor: theme => theme.palette.error.main,
              }
            }}
        >
        {/* Change button text while confirming */}
        {isConfirming ? 'Deleting...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
