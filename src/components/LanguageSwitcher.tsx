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
    <Box sx={{ position: 'absolute', top: { xs: 8, sm: 16 }, right: { xs: 8, sm: 16 }, zIndex: 1100 }}>
      <Button
        // Use variant="text" as base, apply styles via sx for full control
        // Or keep variant="contained"/"outlined" if preferred
        variant={isChineseActive ? 'contained' : 'outlined'} // Keep conditional variant if you like the slight elevation difference
        onClick={() => changeLanguage('zh-Hant')}
        // Apply specific style object based on active state
        sx={isChineseActive ? activeSx : inactiveSx}
        disableElevation={isChineseActive} // Optional: remove shadow from contained button
      >
        {t('langChinese')}
      </Button>
      <Button
        variant={isEnglishActive ? 'contained' : 'outlined'}
        onClick={() => changeLanguage('en')}
        sx={isEnglishActive ? activeSx : inactiveSx}
        disableElevation={isEnglishActive} // Optional: remove shadow from contained button
      >
        {t('langEnglish')}
      </Button>
    </Box>
  );
}

export default LanguageSwitcher;