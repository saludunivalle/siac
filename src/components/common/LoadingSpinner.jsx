import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Cargando estadísticas..." }) => {
  return (
    <Box className="loading-container">
      <CircularProgress size={60} className="loading-spinner" />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
