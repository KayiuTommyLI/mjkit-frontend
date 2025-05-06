import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavigateFunction } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import ShareGameDialog from './ShareGameDialog';

// Import the style constant
const outlinedSilverButtonSx = { 
    color: 'silver', 
    borderColor: 'silver', 
    '&:hover': { 
        color: 'white', 
        borderColor: 'white', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    } 
};

interface NavigationHeaderProps {
    gameId: string;
    navigate: NavigateFunction;
    onNewGameClick?: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ 
    gameId, 
    navigate, 
    onNewGameClick 
}) => {
    const { t } = useTranslation();
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    
    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', // Use space-between to position items
            alignItems: 'center',
            flexWrap: 'wrap', 
            mb: 2, 
            gap: 1 
        }}>
            {/* Left side navigation buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                    variant="outlined" 
                    onClick={onNewGameClick || (() => navigate('/'))}
                    sx={outlinedSilverButtonSx} 
                    startIcon={<ArrowBackIcon />}
                >
                    {t('newGameSetupButtonLabel')}
                </Button>
                
                <Button 
                    variant="text" 
                    onClick={() => navigate('/score-reference')}  
                    sx={outlinedSilverButtonSx}
                >
                    {t('scoreRefButtonLabel')} 
                </Button>
            </Box>
            
            {/* Right side share button */}
            <Button
                variant="outlined"
                onClick={() => setShareDialogOpen(true)}
                sx={outlinedSilverButtonSx}
                startIcon={<ShareIcon />}
            >
                {t('share')}
            </Button>
            
            {/* Share Dialog */}
            <ShareGameDialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                gameId={gameId}
            />
        </Box>
    );
};

export default NavigationHeader;
