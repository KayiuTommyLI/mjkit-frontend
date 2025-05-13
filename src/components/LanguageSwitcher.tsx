import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Base styles for consistent size/spacing
  const commonSx = {
    margin: 0.5,
    minWidth: { xs: '80px', sm: '100px' },
    padding: { xs: '4px 8px', sm: '6px 12px'},
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
    borderRadius: '4px', // Default MUI radius
    borderWidth: '1px', // Ensure border width is defined for smooth transition
    borderStyle: 'solid', // Ensure border style is defined
  };

  // Styles for the ACTIVE button (variant="contained" is set conditionally)
  const activeSx = {
    ...commonSx,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light background for active state
    color: 'white', // White text for active state
    borderColor: 'rgba(255, 255, 255, 0.5)', // Border slightly brighter than background
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)', // Slightly lighter on hover
      borderColor: 'rgba(255, 255, 255, 0.7)',
    }
  };

  // Styles for the INACTIVE button (variant="outlined")
  const inactiveSx = {
    ...commonSx,
    color: 'silver',
    borderColor: 'silver', // Keep silver border for inactive
    '&:hover': {
      color: 'white',
      borderColor: 'white',
      backgroundColor: 'rgba(255, 255, 255, 0.08)' // Standard subtle hover
    }
  };

  // Determine active state
  const isChineseActive = i18n.language.startsWith('zh');
  const isEnglishActive = i18n.language === 'en';

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'flex-end',  // Right-align the buttons
      padding: { xs: '8px 16px', sm: '16px' },  // Add padding around buttons
      position: 'relative',  // Change from absolute to relative positioning
      zIndex: 10  // Ensure it stays above other content
    }}>
      <Button
        variant={isChineseActive ? 'contained' : 'outlined'}
        onClick={() => changeLanguage('zh-Hant')}
        sx={isChineseActive ? activeSx : inactiveSx}
        disableElevation={isChineseActive}
      >
        {t('langChinese')}
      </Button>
      <Button
        variant={isEnglishActive ? 'contained' : 'outlined'}
        onClick={() => changeLanguage('en')}
        sx={isEnglishActive ? activeSx : inactiveSx}
        disableElevation={isEnglishActive}
      >
        {t('langEnglish')}
      </Button>
    </Box>
  );
}

export default LanguageSwitcher;