import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';
import { Filtro7 } from "../service/data";
import { Tabs, Tab, Box } from '@mui/material';

const ProgramDetails = () => {
    const location = useLocation();
    const rowData = location.state; 
    const { globalVariable, userEmail } = location.state; 
    const navigate = useNavigate();
    const [clickedButton, setClickedButton] = useState(''); 
    const [reloadSeguimiento, setReloadSeguimiento] = useState(false);
    const [filteredDataSeg, setFilteredDataSeg] = useState(() => {
        const cachedData = localStorage.getItem('filteredDataSeg');
        return cachedData ? JSON.parse(cachedData) : [];
    });    

    const {
        'programa académico': programaAcademico,
        departamento,
        escuela,
        facultad,
        sede,
        'pregrado/posgrado': formacion,
        'sección': seccion,
        'fase rrc': faseRRC,
        'fase rac': faseRAC,
        fechavencrac,
        fechavencrc,
        'titulo a conceder': titulo,
        jornada,
        modalidad,
        'créditos': creditos,
        periodicidad,
        'duración': duracion,
        accesos: isemail
    } = rowData || {};    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seguimientos = await Filtro7();
                setFilteredDataSeg(seguimientos);
                localStorage.setItem('filteredDataSeg', JSON.stringify(seguimientos));
            } catch (error) {
                console.error('Error al obtener los seguimientos:', error);
            }
        };

        if (!localStorage.getItem('filteredDataSeg')) {
            fetchData();
        }
    }, [reloadSeguimiento]);

    useEffect(() => {
        switch (globalVariable) {
            case 'RRC':
                setClickedButton('rrc');
                break;
            case 'RAAC':
                setClickedButton('raac');
                break;
            case 'CREA':
                setClickedButton('crea');
                break;
            case 'AAC':
                setClickedButton('aac');
                break;
            case 'MOD':
                setClickedButton('mod');
                break;
            default:
                setClickedButton('crea'); 
                break;
        }
        setReloadSeguimiento(prevState => !prevState); 
    }, [globalVariable]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setReloadSeguimiento(prevState => !prevState); 
        }, 0); 

        return () => clearTimeout(timeout); 
    }, [rowData]);

    const handleTabChange = (event, newValue) => {
        setClickedButton(newValue);
    };

    const getSeguimientoBackgroundColor = (process, isSelected) => {
        const defaultColor = 'rgb(241, 241, 241)';
        if (!Array.isArray(filteredDataSeg) || filteredDataSeg.length === 0) {
            return isSelected ? darkenColor(defaultColor) : defaultColor;
        }
        const seguimientos = Array.isArray(filteredDataSeg) ? filteredDataSeg.filter(seg => seg.id_programa === rowData.id_programa) : [];
    
        const topicMap = {
            crea: 'Creación',
            mod: 'Modificación',
            rrc: 'Renovación Registro Calificado',
            aac: 'Acreditación',
            raac: 'Renovación Acreditación'
        };
    
        const seguimientosPorProceso = seguimientos.filter(seg => seg.topic === topicMap[process]);
        
        if (seguimientosPorProceso.length === 0) {
            return isSelected ? darkenColor(defaultColor) : defaultColor;
        }
    
        const recentSeguimiento = seguimientosPorProceso.reduce((prev, current) =>
            new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
        );
    
        let color;
        switch (recentSeguimiento.riesgo) {
            case 'Alto':
                color = '#FED5D1';
                break;
            case 'Medio':
                color = '#FEFBD1';
                break;
            case 'Bajo':
                color = '#E6FFE6';
                break;
            default:
                color = defaultColor;
                break;
        }
    
        return isSelected ? darkenColor(color) : color;
    };
    

    const darkenColor = (color) => {
        const amount = -25; 
        return adjustColor(color, amount);
    };

    const adjustColor = (color, amount) => {
        let usePound = false;

        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }

        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let b = ((num >> 8) & 0x00FF) + amount;
        let g = (num & 0x0000FF) + amount;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        const newColor = (g | (b << 8) | (r << 16)).toString(16);
        return (usePound ? "#" : "") + newColor.padStart(6, '0');
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const tabSx = (process) => ({
        backgroundColor: getSeguimientoBackgroundColor(process, clickedButton === process),
        color: clickedButton === process ? '#000' : '#555',
        border: clickedButton === process ? '2px solid darkgreen' : '1px solid #ccc',
        borderRadius: '6px 6px 0 0',
        marginRight: '4px',
        padding: '6px 12px', 
        flex: 1,
        '&.Mui-selected': {
            backgroundColor: getSeguimientoBackgroundColor(process, true),
            color: '#000',
            fontWeight: 'bold',
            borderBottom: 'none',
        },
    });

    return (
        <>
            <Header />
            <div className='containerTotal'>
                <div className='title-program'><h2>{programaAcademico}</h2></div>
                <div className='about-program-general'>
                    <div className='about-program'><strong>Facultad: </strong>&nbsp; {facultad}</div>
                    <div className='about-program'><strong>Escuela: </strong>&nbsp; {escuela}</div>
                    <div className='about-program'><strong>Sede: </strong>&nbsp; {sede}</div>
                    {departamento && <div className='about-program'><strong>Departamento: </strong>&nbsp; {departamento}</div>}
                    {seccion && <div className='about-program'><strong>Sección: </strong>&nbsp; {seccion}</div>}
                    <div className='about-program'><strong>Nivel de Formación: </strong>&nbsp; {formacion}</div>
                    <div className='about-program'><strong>Título a Conceder: </strong>&nbsp; {titulo}</div>
                    <div className='about-program'><strong>Jornada: </strong>&nbsp; {jornada}</div>
                    <div className='about-program'><strong>Modalidad: </strong>&nbsp; {modalidad}</div>
                    <div className='about-program'><strong>Créditos: </strong>&nbsp; {creditos}</div>
                    <div className='about-program'><strong>Periodicidad: </strong>&nbsp; {periodicidad}</div>
                    <div className='about-program'><strong>Duración: </strong>&nbsp; {duracion}</div>
                    <div className='about-program'><strong>Fecha RRC: </strong>&nbsp; {fechavencrc}</div>
                    <div className='about-program'><strong>Fecha RAAC: </strong>&nbsp; {fechavencrac}</div>
                </div>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', marginLeft:'5px', marginRight:'20px'}}>
                    <Tabs
                        value={clickedButton}
                        onChange={handleTabChange}
                        aria-label="Proceso Tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        TabIndicatorProps={{
                            style: {
                                display: 'none'
                            }
                        }}
                        sx={{ width: '100%' }}
                    >
                        <Tab label="CREA" value="crea" sx={tabSx('crea')} />
                        <Tab label="MOD" value="mod" sx={tabSx('mod')} />
                        <Tab label="RRC" value="rrc" sx={tabSx('rrc')} />
                        <Tab label="AAC" value="aac" sx={tabSx('aac')} />
                        <Tab label="RAAC" value="raac" sx={tabSx('raac')} />
                        <Tab label="Docencia Servicio" value="conv" sx={tabSx('conv')} />
                        <Tab label="Seguimiento PM" value="Seg" sx={tabSx('Seg')} />
                    </Tabs>
                </Box>
                <Seguimiento handleButtonClick={clickedButton} key={reloadSeguimiento} />
                {!userEmail && !isemail && (
                    <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
                )}
            </div>
        </>
    );
};

export default ProgramDetails;
