import React from 'react';
import { Typography } from '@mui/material';

const DEFAULT_RISK_COLORS = {
  Alto: '#DC3545',
  Medio: '#FF8C00',
  Bajo: '#28A745',
  SinRegistro: '#6C757D',
};

const RiskValue = ({ risk, value, riskConfig, size = 'medium' }) => {
  const color = riskConfig?.[risk]?.color || DEFAULT_RISK_COLORS[risk] || DEFAULT_RISK_COLORS.SinRegistro;

  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 700,
        color,
        fontSize: size === 'large' ? '1.25rem' : '1.125rem',
        lineHeight: 1.2,
      }}
    >
      {value}
    </Typography>
  );
};

export default RiskValue;
