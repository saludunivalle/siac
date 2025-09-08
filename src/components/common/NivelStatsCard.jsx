import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';

const NivelStatsCard = ({ nivel, totalMatriculados, tcaPromedio, color }) => {
  const getTCAIcon = (tca) => {
    const tcaValue = parseFloat(tca);
    if (tcaValue > 0) return '📈';
    if (tcaValue < 0) return '📉';
    return '➖';
  };

  return (
    <Card 
      className="nivel-card card-shadow-hover"
      sx={{ 
        background: color,
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
    >
      <CardContent sx={{ padding: '12px !important' }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          mb: 0.5,
          fontSize: '0.85rem',
          lineHeight: 1.2
        }}>
          {nivel}
        </Typography>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          mb: 0.5,
          fontSize: '1.4rem',
          lineHeight: 1
        }}>
          {totalMatriculados.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ 
          opacity: 0.9,
          mb: 1,
          fontSize: '0.7rem',
          lineHeight: 1
        }}>
          Total Matriculados
        </Typography>
        
        {/* TCA */}
        <Box className="tca-container" sx={{ padding: '6px', borderRadius: '4px' }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 500,
            fontSize: '0.7rem'
          }}>
            TCA:
          </Typography>
          <Box className="tca-value">
            <Typography variant="body2" sx={{ 
              fontWeight: 700,
              fontSize: '0.8rem'
            }}>
              {tcaPromedio}%
            </Typography>
            <Box sx={{ fontSize: '0.7rem' }}>
              {getTCAIcon(tcaPromedio)}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NivelStatsCard;
