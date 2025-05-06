import React from 'react';
import { Box, Typography, Button, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  // Email address for feedback
  const contactEmail = 'mjkitdeveloper@gmail.com';
  
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderTop: '1px solid rgba(192, 192, 192, 0.3)'
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 4
        }}
      >
        {/* Footer info section */}
        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h6" color="white" gutterBottom>
            {t('footerTitle')}
          </Typography>
          <Typography variant="body2" color="silver">
            {t('footerDescription')}
          </Typography>
          <Typography variant="body2" color="silver" sx={{ mt: 2 }}>
            © {new Date().getFullYear()} {t('copyright')}
          </Typography>
        </Box>

        {/* Contact section */}
        <Box 
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-end' },
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="silver" gutterBottom>
            {t('feedbackInvitation')}
          </Typography>
          
          <Button
            variant="outlined"
            component={Link}
            href={`mailto:${contactEmail}?subject=MJKit Feedback`}
            startIcon={<EmailIcon />}
            target="_blank"
            rel="noopener"
            sx={{
              mt: 2,
              color: 'silver',
              borderColor: 'silver',
              '&:hover': {
                color: 'white',
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            {t('contactUs')}
          </Button>
          
          <Typography variant="body2" color="silver" sx={{ mt: 2 }}>
            {contactEmail}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;