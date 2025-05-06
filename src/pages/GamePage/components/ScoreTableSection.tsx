import React from 'react';
import { Box, Button, Collapse, CircularProgress, Alert, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Import the style constant
const textSilverButtonSx = { 
    color: 'silver', 
    '&:hover': { 
        color: 'white', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    } 
};

interface ScoreTableItem {
    score: number;
    money: number;
}

interface ScoreTableSectionProps {
    showTable: boolean;
    setShowTable: (show: boolean) => void;
    scoreTable: ScoreTableItem[];
    loading: boolean;
    error: string | null;
}

const ScoreTableSection: React.FC<ScoreTableSectionProps> = ({
    showTable,
    setShowTable,
    scoreTable,
    loading,
    error
}) => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ mt: 4 }}>
            <Button
                onClick={() => setShowTable(!showTable)}
                endIcon={showTable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                size="small"
                sx={{ ...textSilverButtonSx, textTransform: 'none', mb: 1 }}
            >
                {showTable ? t('hideScoreTableButton') : t('showScoreTableButton')}
            </Button>
            <Collapse in={showTable} timeout="auto" unmountOnExit>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} sx={{ color: 'silver' }}/>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : (
                    <TableContainer component={Paper} variant="outlined" 
                        sx={{ backgroundColor: 'transparent', borderColor: 'rgba(192, 192, 192, 0.5)', margin: 'auto', maxWidth: 'fit-content' }}
                    >
                        <Table size="small" aria-label={t('scoreRefTableAriaLabel')}>
                            <TableBody>
                                {scoreTable.length > 0 ? (
                                    scoreTable.map((item) => (
                                        <TableRow key={item.score} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ color: 'silver', borderBottomColor: 'rgba(192, 192, 192, 0.3)' }}>
                                                {item.score} {t('Faan')}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(192, 192, 192, 0.3)' }}>
                                                ${item.money.toFixed(1)}
                                            </TableCell>                                                    
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">{t('scoreRefNoData')}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Collapse>
        </Box>
    );
};

export default ScoreTableSection;