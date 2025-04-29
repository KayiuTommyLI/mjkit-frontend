// src/pages/ScoreReferencePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Interface for the score preview data item from API
interface ScorePreviewItem {
    score: number;
    money: number;
}

// Constants for dropdown options (similar to GameSetupPage)
const defaultMaxMoney = 64;
const defaultUpperLimit = 10;
const defaultLowerLimit = 3;
const defaultHalfMoneyRule = true;
const maxMoneyOptions = [16, 24, 32, 48, 64, 96, 128];
const scoreLimitOptions = Array.from({ length: 18 }, (_, i) => i + 3); // 3 to 20
const minScoreOptions = Array.from({ length: 5 }, (_, i) => i + 1); // 1 to 5

const ScoreReferencePage: React.FC = () => {
    const navigate = useNavigate();

    // State for selected settings
    const [settings, setSettings] = useState({
        max_money: defaultMaxMoney,
        upper_limit_of_score: defaultUpperLimit,
        lower_limit_of_score: defaultLowerLimit,
        half_money_rule: defaultHalfMoneyRule,
    });

    // State for the fetched score table data
    const [scoreTable, setScoreTable] = useState<ScorePreviewItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handler for setting changes
    const handleSettingChange = (event: SelectChangeEvent<string | number | boolean>) => {
        const { name, value } = event.target;
        let processedValue: string | number | boolean = value;

        if (name === 'max_money' || name === 'upper_limit_of_score' || name === 'lower_limit_of_score') {
            processedValue = Number(value);
        } else if (name === 'half_money_rule') {
            processedValue = value === 'true'; // Convert string from Select back to boolean
        }

        setSettings(prev => ({ ...prev, [name]: processedValue }));
    };

    // Fetch score table data when settings change
    const fetchScoreTable = useCallback(async () => {
        // Basic validation
        if (settings.lower_limit_of_score > settings.upper_limit_of_score || settings.upper_limit_of_score <= 0) {
            setError('Invalid score limits selected.');
            setScoreTable([]);
            return;
        }

        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
            maxMoney: String(settings.max_money),
            upperLimitOfScore: String(settings.upper_limit_of_score),
            lowerLimitOfScore: String(settings.lower_limit_of_score),
            halfMoneyRule: String(settings.half_money_rule),
        }).toString();

        try {
            const response = await fetch(`http://localhost:3000/games/score-preview?${queryParams}`); // Use your backend URL
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || JSON.stringify(errorData); }
                catch (jsonError) { errorMsg = `${response.status} ${response.statusText}`; }
                throw new Error(errorMsg);
            }
            const data: ScorePreviewItem[] = await response.json();
            setScoreTable(data);
        } catch (err: any) {
            console.error("Error fetching score table:", err);
            setError(err.message || 'Failed to fetch score table.');
            setScoreTable([]);
        } finally {
            setLoading(false);
        }
    }, [settings]); // Dependency array includes settings

    // Fetch data initially and whenever settings change
    useEffect(() => {
        fetchScoreTable();
    }, [fetchScoreTable]);

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
             <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }} startIcon={<ArrowBackIcon />}>
                 Back
             </Button>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Score Reference Table
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select the game rules to see the corresponding money value per Fan score.
                </Typography>

                {/* Settings Selection Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                     <Grid item xs={6} sm={3}>
                          <FormControl fullWidth size="small">
                             <InputLabel id="max-money-label">Max Money</InputLabel>
                             <Select
                                 labelId="max-money-label"
                                 name="max_money"
                                 value={settings.max_money}
                                 label="Max Money"
                                 onChange={handleSettingChange}
                             >
                                  {maxMoneyOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                             </Select>
                         </FormControl>
                     </Grid>
                     <Grid item xs={6} sm={3}>
                          <FormControl fullWidth size="small">
                             <InputLabel id="max-score-label">Max Score</InputLabel>
                             <Select
                                 labelId="max-score-label"
                                 name="upper_limit_of_score"
                                 value={settings.upper_limit_of_score}
                                 label="Max Score"
                                 onChange={handleSettingChange}
                             >
                                  {scoreLimitOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                             </Select>
                         </FormControl>
                     </Grid>
                      <Grid item xs={6} sm={3}>
                          <FormControl fullWidth size="small">
                             <InputLabel id="min-score-label">Min Score</InputLabel>
                             <Select
                                 labelId="min-score-label"
                                 name="lower_limit_of_score"
                                 value={settings.lower_limit_of_score}
                                 label="Min Score"
                                 onChange={handleSettingChange}
                             >
                                  {minScoreOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                             </Select>
                         </FormControl>
                     </Grid>
                      <Grid item xs={6} sm={3}>
                         <FormControl fullWidth size="small">
                             <InputLabel id="score-rule-label">Score Rule</InputLabel>
                             <Select
                                 labelId="score-rule-label"
                                 name="half_money_rule"
                                 value={String(settings.half_money_rule)} // Value must be string for Select
                                 label="Score Rule"
                                 onChange={handleSettingChange}
                             >
                                 <MenuItem value="true">Half After 5</MenuItem>
                                 <MenuItem value="false">Hot Hot Up</MenuItem>
                             </Select>
                         </FormControl>
                     </Grid>
                </Grid>

                {/* Score Table Display */}
                <Typography variant="h6" component="h2" gutterBottom>
                    Score Table
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small" aria-label="score reference table">
                        <TableHead sx={{ backgroundColor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fan (Score)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Money ($)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        <CircularProgress size={24} sx={{my: 2}}/>
                                    </TableCell>
                                </TableRow>
                            ) : scoreTable.length > 0 ? (
                                scoreTable.map((item) => (
                                    <TableRow key={item.score} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {item.score} Fan
                                        </TableCell>
                                        <TableCell align="right">${item.money.toFixed(1)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                     <TableCell colSpan={2} align="center">
                                         No score data available for selected settings.
                                     </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Paper>
        </Container>
    );
};

export default ScoreReferencePage;
