import React from 'react';
import QRCode from 'react-qr-code';
import copy from 'copy-to-clipboard';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Box, 
    Button, 
    IconButton, 
    Typography,
    Snackbar,
    Alert,
    Divider,
    FormControlLabel,
    Checkbox,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import ChatIcon from '@mui/icons-material/Chat'; // For Signal icon
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from 'react-i18next';

interface ShareGameDialogProps {
    open: boolean;
    onClose: () => void;
    gameId: string;
}

// Style constants to match app theme
const outlinedSilverButtonSx = { 
    color: 'silver', 
    borderColor: 'silver', 
    '&:hover': { 
        color: 'white', 
        borderColor: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    } 
};

const containedButtonSx = {
    backgroundColor: 'white',
    color: 'black',
    '&:hover': {
        backgroundColor: '#e0e0e0',
    }
};

const ShareGameDialog: React.FC<ShareGameDialogProps> = ({ open, onClose, gameId }) => {
    const { t } = useTranslation();
    const [copySuccess, setCopySuccess] = React.useState<boolean>(false);
    const [includeAdminRights, setIncludeAdminRights] = React.useState<boolean>(false);
    
    // Check if current user has admin rights to offer sharing option
    const hasMasterToken = !!localStorage.getItem(`gameMasterToken_${gameId}`);
    
    // Generate URL based on whether admin rights should be included
    const generateShareUrl = () => {
        // Use hash-based URL format that works with HashRouter
        const currentPath = window.location.pathname;
  //      const baseUrl = `${window.location.origin}${currentPath}#/game/${gameId}`;
        const baseUrl = `${window.location.origin}${currentPath}`;
        
        if (includeAdminRights && hasMasterToken) {
            const token = localStorage.getItem(`gameMasterToken_${gameId}`);
            // Add admin token as a separate hash parameter
            return `${baseUrl}?admin=${encodeURIComponent(token || '')}`;
        }
        
        return baseUrl;
    };
    
    // Get current URL for sharing
    const gameUrl = generateShareUrl();
    
    const handleCopyLink = () => {
        copy(gameUrl);
        setCopySuccess(true);
    };
    
    const handleWhatsAppShare = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${t('checkOutThisGame')}: ${gameUrl}`)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const handleTelegramShare = () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(t('checkOutThisGame'))}`;
        window.open(telegramUrl, '_blank');
    };
    
    // Signal share handler
    const handleSignalShare = () => {
        const signalUrl = `signal://send?text=${encodeURIComponent(`${t('checkOutThisGame')}: ${gameUrl}`)}`;
        window.open(signalUrl, '_blank');
    };
    
    const handleSystemShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('shareGameTitle'),
                    text: includeAdminRights ? t('checkOutThisGameWithAdmin') : t('checkOutThisGame'),
                    url: gameUrl
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            handleCopyLink();
        }
    };

    const handleDirectNavigation = () => {
        // Generate the URL with token
        const directUrl = generateShareUrl();
        
        // Navigate directly without opening a new tab
        window.location.href = directUrl;
    };
    
    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: { 
                        backgroundColor: 'rgba(20, 20, 20, 0.95)',
                        color: 'white',
                        borderRadius: '8px'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    color: 'white',
                    borderBottom: '1px solid rgba(192, 192, 192, 0.3)'
                }}>
                    {t('shareGame')}
                    <IconButton onClick={onClose} size="small" sx={{ color: 'silver' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
                        {/* Admin rights option - only show if user has master token */}
                        {hasMasterToken && (
                            <Box sx={{ 
                                width: '100%', 
                                bgcolor: 'rgba(255, 152, 0, 0.1)', 
                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                borderRadius: '4px',
                                p: 2
                            }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={includeAdminRights}
                                            onChange={(e) => setIncludeAdminRights(e.target.checked)}
                                            sx={{ 
                                                color: 'orange',
                                                '&.Mui-checked': {
                                                    color: 'orange',
                                                }
                                            }}
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AdminPanelSettingsIcon sx={{ mr: 1, color: 'orange' }} />
                                            <Typography color="orange">
                                                {t('shareWithAdminRights')}
                                            </Typography>
                                            <Tooltip title={t('shareWithAdminRightsTooltip')}>
                                                <WarningIcon sx={{ ml: 1, fontSize: '1rem', color: 'orange' }} />
                                            </Tooltip>
                                        </Box>
                                    }
                                />
                                {includeAdminRights && (
                                    <Typography variant="caption" color="orange" sx={{ ml: 4, display: 'block' }}>
                                        {t('adminRightsWarning')}
                                    </Typography>
                                )}
                            </Box>
                        )}
                        
                        {/* QR Code with darker border */}
                        <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderRadius: 1,
                            border: includeAdminRights ? '2px solid orange' : '1px solid rgba(150, 150, 150, 0.5)',
                            width: 'fit-content',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)'
                        }}>
                            <QRCode value={gameUrl} size={200} />
                        </Box>
                        
                        <Typography variant="body2" color="silver">
                            {includeAdminRights 
                                ? t('scanQrToJoinWithAdmin') 
                                : t('scanQrToJoin')}
                        </Typography>
                        
                        <Box sx={{ width: '100%' }}>
                            <Divider sx={{ my: 2, borderColor: 'rgba(192, 192, 192, 0.3)' }}>
                                <Typography color="silver">{t('or')}</Typography>
                            </Divider>
                            
                            {/* Copy link button */}
                            <Button 
                                variant="outlined" 
                                startIcon={<ContentCopyIcon />}
                                onClick={handleCopyLink}
                                fullWidth 
                                sx={{ 
                                    ...outlinedSilverButtonSx, 
                                    mb: 2,
                                    ...(includeAdminRights && {
                                        color: 'orange',
                                        borderColor: 'orange',
                                        '&:hover': {
                                            borderColor: 'orange',
                                            color: 'orange',
                                            backgroundColor: 'rgba(255, 152, 0, 0.08)'
                                        }
                                    })
                                }}
                            >
                                {includeAdminRights 
                                    ? t('copyAdminLink') 
                                    : t('copyLink')}
                            </Button>
                            
                            {/* Share buttons - now with Discord and Instagram */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<WhatsAppIcon />}
                                    onClick={handleWhatsAppShare}
                                    sx={{ ...containedButtonSx, bgcolor: '#25D366', color: 'white' }}
                                >
                                    WhatsApp
                                </Button>
                                <Button 
                                    variant="contained" 
                                    startIcon={<TelegramIcon />}
                                    onClick={handleTelegramShare}
                                    sx={{ ...containedButtonSx, bgcolor: '#0088cc', color: 'white' }}
                                >
                                    Telegram
                                </Button>
                                <Button 
                                    variant="contained" 
                                    startIcon={<ChatIcon />}
                                    onClick={handleSignalShare}
                                    sx={{ ...containedButtonSx, bgcolor: '#3A76F0', color: 'white' }}
                                >
                                    Signal
                                </Button>
                            </Box>
                            
                            {/* System share button if available */}
                            {typeof navigator.share === 'function' && (
                                <Button 
                                    variant="contained" 
                                    onClick={handleSystemShare}
                                    fullWidth
                                    sx={containedButtonSx}
                                >
                                    {t('shareViaSystem')}
                                </Button>
                            )}

                            {/* Direct navigation button */}
                            <Button
                                variant="outlined"
                                onClick={handleDirectNavigation}
                                sx={{
                                    ...outlinedSilverButtonSx, 
                                    mt: 1,
                                    alignItems: 'center',
                                    ...(includeAdminRights && {
                                        color: 'orange',
                                        borderColor: 'orange',
                                        '&:hover': {
                                            borderColor: 'orange',
                                            color: 'orange',
                                            backgroundColor: 'rgba(255, 152, 0, 0.08)'
                                        }
                                    })
                                }}
                            >
                                {includeAdminRights 
                                    ? t('openAdminLink') 
                                    : t('openLink')
                                }
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
            
            <Snackbar 
                open={copySuccess} 
                autoHideDuration={3000} 
                onClose={() => setCopySuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={includeAdminRights ? "warning" : "success"} sx={{ width: '100%' }}>
                    {includeAdminRights 
                        ? t('adminLinkCopied')
                        : t('linkCopied')}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ShareGameDialog;