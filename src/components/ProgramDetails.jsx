import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';
import { Filtro5, Filtro7, FiltroHistorico } from "../service/data";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; 
import { Tabs, Tab, Box, Button, TextField, Grid } from '@mui/material';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 

const normalizeValue = (value) => {
    return typeof value === 'string' && value.trim().toUpperCase() === '#N/A'
      ? 'N/A'
      : value;
  };

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

    const [options, setOptions] = useState({
        Sede: [],
        Escuela: [],
        Departamento: [],
        Sección: [],
        'Nivel Académico': [],
        'Nivel de Formación': [],
        Jornada: [],
        Modalidad: [],
        Periodicidad: [],
        Acreditable: [],
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await Filtro5(); 
                const uniqueOptions = {
                    Sede: [...new Set(data.map((item) => item.sede).filter(option => option && option.trim() !== " "))],
                    Escuela: [...new Set(data.map((item) => item.escuela).filter(option => option && option.trim() !== " "))],
                    Departamento: [...new Set(data.map((item) => item.departamento).filter(option => option && option.trim() !== " "))],
                    Sección: [...new Set(data.map((item) => item.sección).filter(option => option && option.trim() !== " "))],
                    'Nivel Académico': [...new Set(data.map((item) => item['pregrado/posgrado']).filter(option => option && option.trim() !== " "))],
                    'Nivel de Formación': [...new Set(data.map((item) => item['nivel de formación']).filter(option => option && option.trim() !== " "))],
                    Jornada: [...new Set(data.map((item) => item.jornada).filter(option => option && option.trim() !== " "))],
                    Modalidad: [...new Set(data.map((item) => item.modalidad).filter(option => option && option.trim() !== " "))],
                    Periodicidad: [...new Set(data.map((item) => item.periodicidad).filter(option => option && option.trim() !== " "))],
                    Acreditable: [...new Set(data.map((item) => item.acreditable).filter(option => option && option.trim() !== " "))],
                };
                setOptions(uniqueOptions);
            } catch (error) {
                console.error('Error al obtener las opciones de Filtro5:', error);
            }
        };
        fetchOptions();
    }, []);

    // Función para manejar el cambio de fecha
    const handleDateChange = (date, field) => {
        setFormData({
            ...formData,
            [field]: date ? format(date, 'dd/MM/yyyy') : '',
        });
    };

    const {
        'programa académico': programaAcademico,
        departamento,
        escuela,
        facultad,
        sede,
        'pregrado/posgrado': academico,
        'nivel de formación': formacion,
        'sección': seccion,
        fechaexpedrc,
        fechavencrc,
        fechaexpedac,
        fechavencac,
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
        Sede: normalizeValue(sede),
        Facultad: normalizeValue(facultad),
        Escuela: normalizeValue(escuela),
        Departamento: normalizeValue(departamento),
        Sección: normalizeValue(seccion),
        'Nivel Académico': normalizeValue(academico),
        'Nivel de Formación': normalizeValue(formacion),
        'Titulo a Conceder': normalizeValue(titulo),
        Jornada: normalizeValue(jornada),
        Modalidad: normalizeValue(modalidad),
        Créditos: normalizeValue(creditos),
        Periodicidad: normalizeValue(periodicidad),
        Duración: normalizeValue(duracion),
        'FechaExp RRC': normalizeValue(fechaexpedrc),
        'Fecha RRC': normalizeValue(fechavencrc),
        'FechaExp RAAC': normalizeValue(fechaexpedac),
        'Fecha RAAC': normalizeValue(fechavencac),
        Acreditable: normalizeValue(acreditable),
        Contingencia: normalizeValue(contingencia),
        'Número renovaciones RRC': normalizeValue(rowData['número renovaciones RRC']) || 1,
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

    //  Función para obtener el color de fondo de los botones de seguimiento
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

    // Función para ajustar el color de fondo de los botones de seguimiento
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

    // Función para enviar los datos actualizados al servidor
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
    
    // Estilos de los botones de seguimiento
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
                        {/* Sección 1: Facultad hasta Sede */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Facultad: </strong>&nbsp; {formData['Facultad'] || 'N/A'}</div>
                            <div className='about-program'><strong>Escuela: </strong>&nbsp; {formData['Escuela'] || 'N/A'}</div>
                            <div className='about-program'><strong>Departamento: </strong>&nbsp; {formData['Departamento'] || 'N/A'}</div>
                            <div className='about-program'><strong>Sección: </strong>&nbsp; {formData['Sección'] || 'N/A'}</div>
                            <div className='about-program'><strong>Sede: </strong>&nbsp; {formData['Sede'] || 'N/A'}</div>
                        </div>
                                            
                        {/* Sección 2: Nivel Académico hasta Modalidad */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Nivel Académico: </strong>&nbsp; {formData['Nivel Académico'] || 'N/A'}</div>
                            <div className='about-program'><strong>Nivel de Formación: </strong>&nbsp; {formData['Nivel de Formación'] || 'N/A'}</div>
                            <div className='about-program'><strong>Jornada: </strong>&nbsp; {formData['Jornada'] || 'N/A'}</div>
                            <div className='about-program'><strong>Modalidad: </strong>&nbsp; {formData['Modalidad'] || 'N/A'}</div>
                        </div>
                             
                        {/* Sección 3: Título a conceder hasta Proceso de Contingencia */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Título a Conceder: </strong>&nbsp; {formData['Titulo a Conceder'] || 'N/A'}</div>
                            <div className='about-program'><strong>Créditos: </strong>&nbsp; {formData['Créditos'] || 'N/A'}</div>
                            <div className='about-program'><strong>Periodicidad: </strong>&nbsp; {formData['Periodicidad'] || 'N/A'}</div>
                            <div className='about-program'><strong>Duración: </strong>&nbsp; {formData['Duración'] || 'N/A'}</div>
                            <div className='about-program'><strong>Proceso de Contingencia: </strong>&nbsp; {formData['Contingencia'] || 'N/A'}</div>
                        </div>

                        {/* Sección 4: Fecha Otorgamiento RRC hasta Número Renovaciones RRC */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Fecha Otorgamiento RRC: </strong>&nbsp; {formData['FechaExp RRC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Fecha Vencimiento RRC: </strong>&nbsp; {formData['Fecha RRC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Resolución RRC: </strong>&nbsp; <span dangerouslySetInnerHTML={{ __html: documentLinks.rrc || 'N/A' }} /></div>
                            <div className='about-program'><strong>Número Renovaciones RRC: </strong>&nbsp; {formData['Número renovaciones RRC'] || 'N/A'}</div>
                        </div>

                        {/* Sección 5: Fecha Otorgamiento RAAC hasta Resolución RAAC */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Fecha Otorgamiento RAAC: </strong>&nbsp; {formData['FechaExp RAAC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Fecha Vencimiento RAAC: </strong>&nbsp; {formData['Fecha RAAC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Resolución RAAC: </strong>&nbsp; <span dangerouslySetInnerHTML={{ __html: documentLinks.raac || 'N/A' }} /></div>
                            <div className='about-program'><strong>Acreditable: </strong>&nbsp; {formData['Acreditable'] || 'N/A'}</div>
                        </div>
                    </div>
                    
                ) : (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
                        {Object.keys(formData).map((key, index) => {
                            if (['FechaExp RRC', 'Fecha RRC', 'FechaExp RAAC', 'Fecha RAAC'].includes(key)) {
                            // Agrupar las fechas en pares para mostrarlas en filas de dos columnas
                            if (['FechaExp RRC', 'FechaExp RAAC'].includes(key)) {
                                return (
                                <Grid container spacing={2} key={index} style={{ marginBottom: '20px' }}>
                                    <Grid item xs={6}>
                                    <DatePicker
                                        label={key === 'FechaExp RRC' ? 'Fecha Otorgamiento RRC' : key === 'FechaExp RAAC' ? 'Fecha Otorgamiento RAAC' : key}
                                        value={
                                        formData[key]
                                            ? new Date(formData[key].split('/').reverse().join('-'))
                                            : null
                                        }
                                        onChange={(newValue) => handleDateChange(newValue, key)}
                                        renderInput={(params) => (
                                        <TextField {...params} fullWidth margin="normal" />
                                        )}
                                    />
                                    </Grid>
                                    <Grid item xs={6}>
                                    <DatePicker
                                        label={key === 'FechaExp RRC' ? 'Fecha Vencimiento RRC' : 'Fecha Vencimiento RAAC'}
                                        value={
                                        formData[key === 'FechaExp RRC' ? 'Fecha RRC' : 'Fecha RAAC']
                                            ? new Date(
                                                formData[key === 'FechaExp RRC' ? 'Fecha RRC' : 'Fecha RAAC']
                                                .split('/')
                                                .reverse()
                                                .join('-')
                                            )
                                            : null
                                        }
                                        onChange={(newValue) =>
                                        handleDateChange(
                                            newValue,
                                            key === 'FechaExp RRC' ? 'Fecha RRC' : 'Fecha RAAC'
                                        )
                                        }
                                        renderInput={(params) => (
                                        <TextField {...params} fullWidth margin="normal" />
                                        )}
                                    />
                                    </Grid>
                                </Grid>
                                );
                            }
                            return null;
                            }
                            return (
                            <div key={key}>
                                {key === 'Créditos' || key === 'Número renovaciones RRC' ? (
                                <TextField
                                    label={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    inputMode="numeric"
                                    onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                    }}
                                    inputProps={{ min: 0 }}
                                />
                                ) : options[key] && options[key].length > 0 ? (
                                <TextField
                                    select
                                    label={key}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    SelectProps={{
                                    native: true,
                                    }}
                                >
                                    <option value="" disabled></option>
                                    {options[key].map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                    ))}
                                </TextField>
                                ) : (
                                <TextField
                                    label={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                />
                                )}
                            </div>
                            );
                        })}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ margin: '10px 0' }}
                        >
                            Actualizar Datos
                        </Button>
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="contained"
                            color="secondary"
                            style={{ margin: '10px 0', marginLeft: '10px' }}
                        >
                            Cancelar
                        </Button>
                        </form>
                    </LocalizationProvider>
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
                <Seguimiento handleButtonClick={clickedButton} key={reloadSeguimiento} fechavencrc={rowData.fechavencrc} />
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
