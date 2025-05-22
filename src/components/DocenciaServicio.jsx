import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsibleButton from './CollapsibleButton';
import { Filtro14 } from '../service/data'; 
import { Box, Typography, CircularProgress } from '@mui/material';

const DocenciaServicio = () => {
    const [data, setData] = useState([]);
    const [isCargo, setCargo] = useState([' ']);
    const [loading, setLoading] = useState(true);

    // Obtener los permisos del usuario desde sessionStorage
    useEffect(() => {
        if (sessionStorage.getItem('logged')) {
            const res = JSON.parse(sessionStorage.getItem('logged'));
            const permisos = res.map(item => item.permiso).flat();
            setCargo(permisos);
        }
    }, []);

    // Efecto para obtener los datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await Filtro14();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <Header />
            <Sidebar isCargo={isCargo} />
            <div className="content-with-sidebar">
                <Box sx={{ 
                    width: '100%', 
                    maxWidth: '1100px', 
                    mx: 'auto',
                    px: { xs: 2, sm: 3, md: 4 },
                    mt: 2,
                    ml: { xs: 'auto', md: 0 },
                    position: 'relative',
                    left: { xs: 0, md: '-30px' }
                }}>
                    <Typography variant="h4" sx={{ 
                        mb: 4,
                        fontWeight: 600,
                        color: '#333',
                        textAlign: 'center'
                    }}>
                        Escenarios de Práctica
                    </Typography>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : data.length > 0 ? (
                        data.map((item, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <CollapsibleButton
                                    buttonText={item.nombre}
                                    content={<p>Escenario de práctica.</p>}
                                    defaultClosed={true}
                                />
                            </Box>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center' }}>
                            No hay escenarios de práctica disponibles.
                        </Typography>
                    )}
                </Box>
            </div>
        </>
    );
};

export default DocenciaServicio;
