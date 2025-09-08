import React from 'react';
import { Box, Typography } from '@mui/material';

const VistaGeneral = () => {
  return (
    <Box className="vista-general-container">
      <Typography variant="h5" className="vista-general-title">
        Vista General
      </Typography>
      <Typography variant="body1" className="vista-general-subtitle">
        Esta sección está disponible para futuras funcionalidades
      </Typography>
    </Box>
  );
};

export default VistaGeneral;
