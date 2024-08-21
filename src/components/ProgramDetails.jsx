import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';
import { Filtro7, FiltroHistorico } from "../service/data";
import { Tabs, Tab, Box, Button, TextField } from '@mui/material';

const ProgramDetails = () => {
    const location = useLocation();
    const rowData = location.state;
    const { globalVariable, userEmail } = location.state || {}; 
    const navigate = useNavigate();
    const [clickedButton, setClickedButton] = useState(''); 
    const [reloadSeguimiento, setReloadSeguimiento] = useState(false);
    const [filteredDataSeg, setFilteredDataSeg] = useState(() => {
        const cachedData = localStorage.getItem('filteredDataSeg');
        return cachedData ? JSON.parse(cachedData) : [];
    });
    const [documentLinks, setDocumentLinks] = useState({
        rrc: '',
        raac: '',
    });
    const [isEditing, setIsEditing] = useState(false);

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
        accesos: isemail, 
        acreditable, 
        contingencia,
    } = rowData || {};

    const [formData, setFormData] = useState({
        Sede: sede,
        Facultad: facultad,
        Escuela: escuela,
        Departamento: departamento,
        Sección: seccion,
        'Nivel de Formación': formacion,
        'Titulo a Conceder': titulo,
        Jornada: jornada,
        Modalidad: modalidad,
        Créditos: creditos,
        Periodicidad: periodicidad,
        Duración: duracion,
        'Fecha RRC': fechavencrc,
        'Fecha RAAC': fechavencrac,
        Acreditable: acreditable,
        Contingencia: contingencia, 
    });

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

    useEffect(() => {
        const fetchFiltroHistorico = async () => {
            try {
                const historial = await FiltroHistorico();
                console.log('Datos de FiltroHistorico:', historial); 
                const filteredHistorial = historial.filter(item => item.id_programa === rowData.id_programa);
                
                filteredHistorial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                let rrcLinks = [];
                let raacLinks = [];

                filteredHistorial.forEach((item, index) => {
                    const link = `<a href="${item.url_doc}" target="_blank" style="color: blue;">Enlace${index + 1}</a>`;
                    if (item.proceso === 'crea' || item.proceso === 'rrc') {
                        rrcLinks.push(link);
                    } else if (item.proceso === 'aac' || item.proceso === 'raac') {
                        raacLinks.push(link);
                    }
                });

                setDocumentLinks({
                    rrc: rrcLinks.join(' '),
                    raac: raacLinks.join(' '),
                });
            } catch (error) {
                console.error('Error al obtener el historial:', error);
            }
        };

        fetchFiltroHistorico();
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://siac-server.vercel.app/updateData', {
                id: rowData.id_programa,
                ...formData,
            });
            if (response.data.status) {
                alert('Datos actualizados correctamente');
                setReloadSeguimiento(!reloadSeguimiento);
                setIsEditing(false);
            } else {
                alert('Error al actualizar datos: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            alert('Error al actualizar datos');
        }
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
                <div className='title-program'>
                    <h2>{programaAcademico || 'N/A'}</h2>
                </div>
                {!isEditing ? (
                    <div className='about-program-general'>
                        <div className='about-program'><strong>Facultad: </strong>&nbsp; {facultad || 'N/A'}</div>
                        <div className='about-program'><strong>Escuela: </strong>&nbsp; {escuela || 'N/A'}</div>
                        <div className='about-program'><strong>Sede: </strong>&nbsp; {sede || 'N/A'}</div>
                        <div className='about-program'><strong>Departamento: </strong>&nbsp; {departamento || 'N/A'}</div>
                        <div className='about-program'><strong>Sección: </strong>&nbsp; {seccion || 'N/A'}</div>
                        <div className='about-program'><strong>Nivel de Formación: </strong>&nbsp; {formacion || 'N/A'}</div>
                        <div className='about-program'><strong>Título a Conceder: </strong>&nbsp; {titulo || 'N/A'}</div>
                        <div className='about-program'><strong>Jornada: </strong>&nbsp; {jornada || 'N/A'}</div>
                        <div className='about-program'><strong>Modalidad: </strong>&nbsp; {modalidad || 'N/A'}</div>
                        <div className='about-program'><strong>Créditos: </strong>&nbsp; {creditos || 'N/A'}</div>
                        <div className='about-program'><strong>Periodicidad: </strong>&nbsp; {periodicidad || 'N/A'}</div>
                        <div className='about-program'><strong>Duración: </strong>&nbsp; {duracion || 'N/A'}</div>
                        <div className='about-program'><strong>Fecha RRC: </strong>&nbsp; {fechavencrc || 'N/A'}</div>
                        <div className='about-program'><strong>Fecha RAAC: </strong>&nbsp; {fechavencrac || 'N/A'}</div>
                        <div className='about-program'><strong>Documento RRC: </strong>&nbsp; <span dangerouslySetInnerHTML={{ __html: documentLinks.rrc || 'N/A' }} /></div>
                        <div className='about-program'><strong>Documento RAAC: </strong>&nbsp; <span dangerouslySetInnerHTML={{ __html: documentLinks.raac || 'N/A' }} /></div>
                        <div className='about-program'><strong>Acreditable: </strong>&nbsp; {acreditable || 'N/A'}</div>
                        <div className='about-program'><strong>Proceso de Contingencia: </strong>&nbsp; {contingencia || 'N/A'}</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
                        {Object.keys(formData).map((key) => (
                            <div key={key}>
                                <TextField
                                    label={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                        ))}
                        <Button type="submit" variant="contained" color="primary" style={{ margin: '10px 0' }}>
                            Actualizar Datos
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="contained" color="secondary" style={{ margin: '10px 0', marginLeft: '10px' }}>
                            Cancelar
                        </Button>
                    </form>
                )}
                {!isEditing && (
                        <Button variant="contained" color="primary" onClick={() => setIsEditing(true)} style={{ marginBottom: '20px' }}>
                            Actualizar Datos
                        </Button>
                )}
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
                    <Button onClick={handleBackClick} variant="contained" style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', margin: '10px 0px -15px' }}>
                        Atrás
                    </Button>
                )}
            </div>
        </>
    );
};

export default ProgramDetails;
