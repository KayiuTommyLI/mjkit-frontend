import { SxProps, Theme } from '@mui/material/styles';

// Define and export input styles for consistent form styling across the application
export const inputStyles: SxProps<Theme> = { 
    '& label.Mui-focused': { color: 'white' },
    '& .MuiInputLabel-root': { color: 'silver' }, 
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: 'silver' }, 
        '&:hover fieldset': { borderColor: 'white' },
        '&.Mui-focused fieldset': { borderColor: 'white' },
        '& input': { color: 'white' },
        '& .MuiSelect-select': { color: 'white' }, 
        '& .MuiSvgIcon-root': { color: 'silver'} 
    }
};

// Additional common styles can be added below
export const textSilverButtonSx: SxProps<Theme> = {
    color: 'silver',
    '&:hover': { 
        color: 'white', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    }
};

export const whiteContainedButtonSx: SxProps<Theme> = {
    backgroundColor: 'white',
    color: 'black',
    '&:hover': {
        backgroundColor: '#e0e0e0'
    },
    '&.Mui-disabled': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        color: 'rgba(0, 0, 0, 0.6)'
    }
};