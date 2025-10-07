import React from 'react';
import { Chip, alpha } from '@mui/material';

const DEFAULT_RISK_CONFIG = {
  Alto: {
    color: '#DC3545',
    gradient: 'linear-gradient(135deg, #DC3545 0%, #B02A37 100%)',
    iconName: 'Warning'
  },
  Medio: {
    color: '#FF8C00',
    gradient: 'linear-gradient(135deg, #FF8C00 0%, #E07600 100%)',
    iconName: 'Medium'
  },
  Bajo: {
    color: '#28A745',
    gradient: 'linear-gradient(135deg, #28A745 0%, #218838 100%)',
    iconName: 'Low'
  },
  SinRegistro: {
    color: '#6C757D',
    gradient: 'linear-gradient(135deg, #6C757D 0%, #495057 100%)',
    iconName: 'Help'
  }
};

const ModernRiskChip = ({ riskLevel, value, size = 'medium', configOverride }) => {
  const config = (configOverride && configOverride[riskLevel]) || DEFAULT_RISK_CONFIG[riskLevel] || DEFAULT_RISK_CONFIG.SinRegistro;

  return (
    <Chip
      icon={config.icon || null}
      label={value}
      sx={{
        background: config.gradient,
        color: 'white',
        fontWeight: 800,
        fontSize: size === 'large' ? '1.125rem' : '1rem',
        height: size === 'large' ? 48 : 40,
        minWidth: size === 'large' ? '100px' : '80px',
        borderRadius: size === 'large' ? '14px' : '10px',
        boxShadow: size === 'large' ? `0 4px 16px ${alpha(config.color, 0.3)}` : `0 2px 8px ${alpha(config.color, 0.2)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 16px ${alpha(config.color, 0.3)}`,
        },
        '& .MuiChip-label': {
          color: 'white',
          fontWeight: 800
        },
        '& .MuiChip-icon': {
          color: 'white',
          fontSize: size === 'large' ? '20px' : '18px'
        }
      }}
    />
  );
};

export default ModernRiskChip;


