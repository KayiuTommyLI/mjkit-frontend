import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Import style constants
const containedWhiteButtonSx = { 
    backgroundColor: 'white', 
    color: 'black', 
    '&:hover': { 
        backgroundColor: '#e0e0e0' 
    },
    '&.Mui-disabled': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        color: 'rgba(0, 0, 0, 0.5)',
    }
};

interface GameControlsProps {
    type: 'start' | 'add-round';
    onAction: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
    gameId?: string;
}

const GameControls: React.FC<GameControlsProps> = ({ 
    type, 
    onAction, 
    isLoading = false, 
    isDisabled = false,
    gameId = '',
}) => {
    const { t } = useTranslation();
    
    const hasMasterToken = gameId ? !!localStorage.getItem(`gameMasterToken_${gameId}`) : false;
    const isMobile = window.innerWidth <= 600;
    
    if (type === 'start') {
        return (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onAction}
                    disabled={isLoading}
                    startIcon={<PlayCircleOutlineIcon />}
                >
                    {isLoading ? t('startingGame', 'Starting...') : t('startGame', 'Start Game & Get Master Token')}
                </Button>
            </Box>
        );
    }
    
    if (type === 'add-round') {
        return (
            <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary" 
                    size={isMobile ? "medium" : "large"}
                    onClick={onAction}
                    disabled={isLoading || isDisabled || !hasMasterToken}
                    sx={{
                        ...containedWhiteButtonSx,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 }
                    }}
                >
                    {t('addRoundButtonLabel')}
                    {!hasMasterToken && (
                        <span style={{ 
                            fontSize: '0.65rem', 
                            marginLeft: '5px' 
                        }}>
                            ({t('masterTokenRequired')})
                        </span>
                    )}
                </Button>
            </Box>
        );
    }
    
    return null;
};

export default GameControls;