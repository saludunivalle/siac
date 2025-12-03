import React, { useState, useEffect } from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';
import { subscribeToLoading } from '../service/fetch';

/**
 * Componente de carga global que muestra un spinner cuando hay solicitudes pendientes
 */
const GlobalLoading = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [requestCount, setRequestCount] = useState(0);
    const [showAfterDelay, setShowAfterDelay] = useState(false);

    useEffect(() => {
        // Suscribirse a cambios de estado de carga
        const unsubscribe = subscribeToLoading((loading, count) => {
            setIsLoading(loading);
            setRequestCount(count);
        });

        return () => unsubscribe();
    }, []);

    // Solo mostrar el loading después de 500ms para evitar flashes
    useEffect(() => {
        let timer;
        if (isLoading) {
            timer = setTimeout(() => {
                setShowAfterDelay(true);
            }, 500);
        } else {
            setShowAfterDelay(false);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading]);

    if (!showAfterDelay) return null;

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
            open={showAfterDelay}
        >
            <CircularProgress color="inherit" size={60} />
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Cargando datos...
                </Typography>
                {requestCount > 1 && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {requestCount} solicitudes en progreso
                    </Typography>
                )}
            </Box>
        </Backdrop>
    );
};

export default GlobalLoading;

