import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GameData } from '../../../types';

interface GameHeaderProps {
    gameData: GameData;
    scoreLimits: {
        min: number;
        max: number;
    };
}

const GameHeader: React.FC<GameHeaderProps> = ({ gameData, scoreLimits }) => {
    const { t } = useTranslation();
    
    return (
        <>
            <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                {gameData.game_name || t('gameDefaultTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'silver', mb: 1 }}>
                {t('gameRuleSummary', {
                    min: scoreLimits.min,
                    max: scoreLimits.max,
                    maxMoney: gameData.max_money,
                    onePayAllRule: gameData.one_pay_all_rule ? t('fullTungRule') : t('halfTungRule'),
                    rule: gameData.half_money_rule ? t('halfAfter5Rule') : t('hotHotUpRule')
                })}
            </Typography>
        </>
    );
};

export default GameHeader;