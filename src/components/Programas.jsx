import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { Button, ButtonGroup, Tooltip, CircularProgress, Checkbox } from "@mui/material"; // Añadir Checkbox
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { Filtro4, Filtro5, Filtro7 } from "../service/data";
import CollapsibleButton from "./CollapsibleButton";
import '/src/styles/home.css';
import '/src/styles/table.css';


const Programas = () => {
    const location = useLocation();
    const rowData = location.state;
    const navigate = useNavigate();
    const [selectedValues, setSelectedValues] = useState(['option3', 'option7']);
    const [filteredData, setFilteredData] = useState([]);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');
    const [loading, setLoading] = useState(false);
    const [loadingState, setLoadingState] = useState({
        activos: true,
        activosSede: true,
        creacion: true,
        creacionSedes: true,
        inactivos: true,
        inactive: true,
        vencidoRC: true,
        desistidoMen: true,
        desistidoInterno: true,
        rechazado: true
    });
    const [activosCount, setActivosCount] = useState(0); // Este ahora será solo 'Activo'
    const [creacionCount, setCreacionCount] = useState(0);
    const [creacionSedesCount, setCreacionSedesCount] = useState(0);
    const [activoSedesCount, setActivoSedesCount] = useState(0);
    const [inactivosCount, setInactivosCount] = useState(0);
    const [otrosCount, setOtrosCount] = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);
    const [vencidoRCCount, setVencidoRCCount] = useState(0);
    const [desistidoMenCount, setDesistidoMenCount] = useState(0);
    const [desistidoInternoCount, setDesistidoInternoCount] = useState(0);
    const [rechazadoCount, setRechazadoCount] = useState(0);
    const [filteredDataSeg, setFilteredDataSeg] = useState([]);
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [user, setUser] = useState('');
    const [isCargo, setCargo] = useState([' ']);
    const [showInactiveButtons, setShowInactiveButtons] = useState(false);

    useEffect(() => {
        const loggedUser = sessionStorage.getItem('logged');
        if (loggedUser) {
            const res = JSON.parse(loggedUser);
            const permisos = res.map(item => item.permiso).flat();
            setCargo(permisos);
            setUser(res[0].user);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seguimientos = await Filtro7();
                setFilteredDataSeg(seguimientos);
            } catch (error) {
                console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchDataAndFilter = async () => {
            setLoading(true);
            try {
                const allProgramsGlobal = await Filtro5(); // Fetch all programs

                // --- Logic for Button Counts ---
                let programsForCounting = [...allProgramsGlobal];
                // 1. Primero filtrar por Pregrado/Posgrado
                if (selectedValues.includes('option1')) { // Pregrado selected for counts
                    programsForCounting = allProgramsGlobal.filter(item => item['pregrado/posgrado'] === 'Pregrado' || item['pregrado/posgrado'] === 'Pregrado-Tec');
                } else if (selectedValues.includes('option2')) { // Posgrado selected for counts
                    programsForCounting = allProgramsGlobal.filter(item => item['pregrado/posgrado'] === 'Posgrado');
                    
                    // 2. Si hay filtros de nivel de formación seleccionados, aplicarlos también
                    const nivelesFormacionSeleccionados = selectedValues.filter(val =>
                        ['doctorado', 'especializacionMedico', 'especializacionUni', 'maestria', 'otras'].includes(val)
                    );
                    
                    if (nivelesFormacionSeleccionados.length > 0) {
                        programsForCounting = programsForCounting.filter(item => {
                            return nivelesFormacionSeleccionados.some(option => {
                                switch (option) {
                                    case 'doctorado': return item['nivel de formación'] === 'Doctorado';
                                    case 'especializacionMedico': return item['nivel de formación'] === 'Especialización Médico Quirúrgica';
                                    case 'especializacionUni': return item['nivel de formación'] === 'Especialización Universitaria';
                                    case 'maestria': return item['nivel de formación'] === 'Maestría';
                                    case 'otras': return item['nivel de formación'] === ''; 
                                    default: return false;
                                }
                            });
                        });
                    }
                } else if (isCargo.includes('Posgrados')) { // Default for Posgrados role if no specific pre/pos selected
                    programsForCounting = allProgramsGlobal.filter(item => item['pregrado/posgrado'] === 'Posgrado');
                }

                // 3. Ahora calcular los contadores con programsForCounting ya correctamente filtrado
                setActivosCount(programsForCounting.filter(item => item['estado'] === 'Activo').length);
                setLoadingState(prev => ({...prev, activos: false}));
                
                setActivoSedesCount(programsForCounting.filter(item => item['estado'] === 'Activo - Sede').length);
                setLoadingState(prev => ({...prev, activosSede: false}));
                
                setCreacionCount(programsForCounting.filter(item => item['estado'] === 'En Creación').length);
                setLoadingState(prev => ({...prev, creacion: false}));
                
                setCreacionSedesCount(programsForCounting.filter(item => item['estado'] === 'En Creación - Sede' || item['estado'] === 'En Creación*').length);
                setLoadingState(prev => ({...prev, creacionSedes: false}));
                
                const inactiveStatesForCount = ['Negación RC', 'Negación AAC', 'Inactivo', 'Inactivo - Sede', 'Inactivo - Vencido RC', 'Desistido', 'Desistido Interno', 'Desistido Interno - Sede', 'Desistido MEN', 'Desistido MEN - Sede', 'Rechazado'];
                setInactivosCount(programsForCounting.filter(item => inactiveStatesForCount.includes(item['estado'])).length);
                setLoadingState(prev => ({...prev, inactivos: false}));
                
                setInactiveCount(programsForCounting.filter(item => item['estado'] === 'Inactivo' || item['estado'] === 'Inactivo - Sede').length);
                setLoadingState(prev => ({...prev, inactive: false}));
                
                setVencidoRCCount(programsForCounting.filter(item => item['estado'] === 'Inactivo - Vencido RC').length);
                setLoadingState(prev => ({...prev, vencidoRC: false}));
                
                setDesistidoMenCount(programsForCounting.filter(item => item['estado'] === 'Desistido MEN' || item['estado'] === 'Desistido MEN - Sede').length);
                setLoadingState(prev => ({...prev, desistidoMen: false}));
                
                setDesistidoInternoCount(programsForCounting.filter(item => item['estado'] === 'Desistido Interno' || item['estado'] === 'Desistido Interno - Sede').length);
                setLoadingState(prev => ({...prev, desistidoInterno: false}));
                
                setRechazadoCount(programsForCounting.filter(item => ['Rechazado', 'Negación RC', 'Negación AAC'].includes(item['estado'])).length);
                setLoadingState(prev => ({...prev, rechazado: false}));

                // --- Logic for Table Data (filteredData) ---
                let result = rowData || [...allProgramsGlobal]; // Prioritize rowData from navigation, else use all fetched programs

                // 1. Apply isCargo filter if user has 'Posgrados' role AND no specific pre/pos filter ('option1'/'option2') is active
                if (isCargo.includes('Posgrados') && !selectedValues.includes('option1') && !selectedValues.includes('option2')) {
                    result = result.filter(item => item['pregrado/posgrado'] === 'Posgrado');
                }

                // 2. Filter by Pregrado/Posgrado based on selectedValues ('option1', 'option2')
                // This overrides the general isCargo filter if option1 or option2 is selected.
                if (selectedValues.includes('option1')) { // Pregrado
                    result = result.filter(item => item['pregrado/posgrado'] === 'Pregrado' || item['pregrado/posgrado'] === 'Pregrado-Tec');
                } else if (selectedValues.includes('option2')) { // Posgrado
                    result = result.filter(item => item['pregrado/posgrado'] === 'Posgrado');
                    
                    // 2a. If Posgrado is selected, further filter by Nivel de Formación if any are selected
                    const nivelesFormacionSeleccionados = selectedValues.filter(val =>
                        ['doctorado', 'especializacionMedico', 'especializacionUni', 'maestria', 'otras'].includes(val)
                    );
                    if (nivelesFormacionSeleccionados.length > 0) {
                        result = result.filter(item => {
                            return nivelesFormacionSeleccionados.some(option => {
                                switch (option) {
                                    case 'doctorado': return item['nivel de formación'] === 'Doctorado';
                                    case 'especializacionMedico': return item['nivel de formación'] === 'Especialización Médico Quirúrgica';
                                    case 'especializacionUni': return item['nivel de formación'] === 'Especialización Universitaria';
                                    case 'maestria': return item['nivel de formación'] === 'Maestría';
                                    case 'otras': return item['nivel de formación'] === ''; 
                                    default: return false;
                                }
                            });
                        });
                    }
                }

                // 3. Filter by Estado based on selectedValues (option3, option4, etc. and inactive sub-buttons)
                const hasEstadoFilters = selectedValues.some(option => 
                    ['option3', 'option4', 'option7', 'option8', 
                     'inactive', 'vencido-rc', 'desistido', 'desistido-int', 'rechazado'].includes(option)
                );

                if (hasEstadoFilters) {
                    result = result.filter(item => {
                        return selectedValues.some(option => { 
                            switch (option) {
                                case 'option3': return item['estado'] === 'Activo'; // Activos Cali
                                case 'option7': return item['estado'] === 'Activo - Sede'; // Activos Sedes
                                case 'option4': return item['estado'] === 'En Creación'; // Creacion Cali
                                case 'option8': return item['estado'] === 'En Creación*' || item['estado'] === 'En Creación - Sede'; // Creacion Sedes/Otros
                                case 'inactive': return item['estado'] === 'Inactivo' || item['estado'] === 'Inactivo - Sede';
                                case 'vencido-rc': return item['estado'] === 'Inactivo - Vencido RC';
                                case 'desistido': return item['estado'] === 'Desistido' || item['estado'] === 'Desistido MEN' || item['estado'] === 'Desistido MEN - Sede';
                                case 'desistido-int': return item['estado'] === 'Desistido Interno' || item['estado'] === 'Desistido Interno - Sede';
                                case 'rechazado': return item['estado'] === 'Rechazado' || item['estado'] === 'Negación RC' || item['estado'] === 'Negación AAC';
                                default: return false;
                            }
                        });
                    });
                }
                
                setFilteredData(result);

            } catch (error) {
                console.error('Error al obtener y filtrar datos:', error);
                setFilteredData([]); 
                setLoadingState({
                    activos: false,
                    activosSede: false,
                    creacion: false,
                    creacionSedes: false,
                    inactivos: false,
                    inactive: false,
                    vencidoRC: false,
                    desistidoMen: false,
                    desistidoInterno: false,
                    rechazado: false
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndFilter();
    }, [isCargo, selectedValues, rowData]); // Key dependencies

    useEffect(() => {
        if (loading) {
            setLoadingState({
                activos: true,
                activosSede: true,
                creacion: true,
                creacionSedes: true,
                inactivos: true,
                inactive: true,
                vencidoRC: true,
                desistidoMen: true,
                desistidoInterno: true,
                rechazado: true
            });
            
            const timers = [];
            
            Object.keys(loadingState).forEach(key => {
                const timer = setTimeout(() => {
                    setLoadingState(prev => ({...prev, [key]: false}));
                }, 5000);
                timers.push(timer);
            });
            
            return () => timers.forEach(timer => clearTimeout(timer));
        }
    }, [loading]);

    const handleRowClick = (rowData) => {
        navigate('/program_details', { state: rowData });
    };

    const getCellBackgroundColor = (item, process) => {
        const seguimientos = filteredDataSeg.filter(seg => seg.id_programa === item.id_programa);
        const defaultGreyCondition = (process === 'CREA' && (item['estado'] === 'En Creación' || item['estado'] === 'En Creación*')) ||
                                     (process === 'MOD' && item['mod'] === 'SI') ||
                                     (process === 'RRC' && item['rc vigente'] === 'SI') ||
                                     (process === 'AAC' && item['aac_1a'] === 'SI') ||
                                     (process === 'RAAC' && item['ac vigente'] === 'SI');

        if (seguimientos.length === 0) {
            return defaultGreyCondition ? '#E0E0E0' : 'white';
        }

        // Mapa de tópicos
        const topicMap = {
            CREA: 'Creación',
            MOD: 'Modificación',
            RRC: 'Renovación Registro Calificado',
            AAC: 'Acreditación',
            RAAC: 'Renovación Acreditación'
        };

        // Filtra los seguimientos por proceso
        const seguimientosPorProceso = seguimientos.filter(seg => seg.topic === topicMap[process]);

        if (seguimientosPorProceso.length === 0) {
            return defaultGreyCondition ? '#E0E0E0' : 'white';
        }

        // Obtiene el seguimiento más reciente
        const recentSeguimiento = seguimientosPorProceso.reduce((prev, current) =>
            new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
        );

        switch (recentSeguimiento.riesgo) {
            case 'Alto':
                return '#FED5D1';
            case 'Medio':
                return '#FEFBD1';
            case 'Bajo':
                return '#E6FFE6';
            default:
                return 'white';
        }
    };

    const ButtonsContainer = styled('div')({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        '@media (max-width:600px)': {
            flexDirection: 'column',
        },
    });

    const ButtonRow = styled('div')({
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '20px',
    });

    const handleBackClick = () => {
        navigate('/');
    };

    // Función para obtener el color del semáforo según el año de vencimiento
    const getSemaforoColor = (vencimientoYear) => {
        const currentYear = new Date().getFullYear();
    
        if (vencimientoYear < currentYear) {
        return '#D3D3D3'; // Gris para vencido
        } else if (vencimientoYear <= currentYear + 1) {
        return '#FED5D1'; // Rojo para vencimiento en el próximo año
        } else if (vencimientoYear > currentYear + 1 && vencimientoYear <= currentYear + 3) {
        return '#FEFBD1'; // Amarillo para vencimiento entre un año y tres años
        } else {
        return '#E6FFE6'; // Verde para más de tres años de vencimiento
        }
    };
    

    const handleButtonClick = (buttonValue) => {
        setSelectedValues(prevSelectedValues => {
            let newSelectedValues = [...prevSelectedValues];

            // Si es Pregrado o Posgrado
            if (buttonValue === 'option1' || buttonValue === 'option2') {
                // Si ya está seleccionado, lo quitamos
                if (newSelectedValues.includes(buttonValue)) {
                    newSelectedValues = newSelectedValues.filter(val => val !== buttonValue);
                } else {
                    // Si no está seleccionado:
                    // 1. Quitamos la otra opción (si option1, quitamos option2 y viceversa)
                    newSelectedValues = newSelectedValues.filter(val => 
                        val !== (buttonValue === 'option1' ? 'option2' : 'option1')
                    );
                    // 2. Agregamos el buttonValue
                    newSelectedValues.push(buttonValue);
                }
                
                // Siempre nos aseguramos que option3 y option7 estén incluidos
                if (!newSelectedValues.includes('option3')) newSelectedValues.push('option3');
                if (!newSelectedValues.includes('option7')) newSelectedValues.push('option7');
            } 
            // Para Inactivos (option6) - mantener lógica actual
            else if (buttonValue === 'option6') {
                const inactiveSubButtons = ['inactive', 'desistido', 'desistido-int', 'rechazado', 'vencido-rc'];
                if (!newSelectedValues.includes(buttonValue)) {
                    newSelectedValues.push(buttonValue);
                    inactiveSubButtons.forEach(sub => {
                        if (!newSelectedValues.includes(sub)) newSelectedValues.push(sub);
                    });
                } else {
                    newSelectedValues = newSelectedValues.filter(val => val !== buttonValue);
                    newSelectedValues = newSelectedValues.filter(val => !inactiveSubButtons.includes(val));
                }
                setShowInactiveButtons(prevState => !prevState);
            }
            // Para otros botones
            else {
                if (newSelectedValues.includes(buttonValue)) {
                    newSelectedValues = newSelectedValues.filter(val => val !== buttonValue);
                } else {
                    newSelectedValues.push(buttonValue);
                }
            }

            // El resto de la lógica de filtrado se mantiene igual
            let filteredResult = rowData.filter(item => {
                // Filtra por "Pregrado" o "Posgrado" primero, si se seleccionó alguno
                const pregradoOrPosgradoFilter = newSelectedValues.includes('option1') 
                    ? item['pregrado/posgrado'] === 'Pregrado' || item['pregrado/posgrado'] === 'Pregrado-Tec'
                    : newSelectedValues.includes('option2')
                        ? item['pregrado/posgrado'] === 'Posgrado'
                        : true;

                // Filtra por los niveles de formación seleccionados (Doctorado, Especialización, etc.)
                const nivelesFormacionFilter = newSelectedValues.some(option => {
                    switch (option) {
                        case 'doctorado':
                            return item['nivel de formación'] === 'Doctorado';
                        case 'especializacion':
                            return item['nivel de formación'] === 'Especialización';
                        case 'especializacionMedico':
                            return item['nivel de formación'] === 'Especialización Médico Quirúrgica';
                        case 'especializacionUni':
                            return item['nivel de formación'] === 'Especialización Universitaria';
                        case 'maestria':
                            return item['nivel de formación'] === 'Maestría';
                        case 'otras':
                            return item['nivel de formación'] === '';
                        default:
                            return false;
                    }
                });

                // Devuelve true si cumple con ambos filtros
                return pregradoOrPosgradoFilter && (nivelesFormacionFilter || !newSelectedValues.some(val => ['doctorado', 'especializacion', 'especializacionMedico', 'especializacionUni', 'maestria', 'otras'].includes(val)));
            });

            if (newSelectedValues.some(option => ['option3', 'option4', 'option5', 'option6', 'option7', 'option8', 'inactive', 'desistido', 'desistido-int', 'rechazado', 'vencido-rc'].includes(option))) {
                filteredResult = filteredResult.filter(item => {
                    return newSelectedValues.some(option => {
                        switch (option) {
                            case 'option3': return item['estado'] === 'Activo';
                            case 'option4': return item['estado'] === 'En Creación';
                            case 'option5': return item['estado'] === 'Negación RC' || item['estado'] === 'Negación AAC';
                            case 'inactive': return item['estado'] === 'Inactivo' || item['estado'] === 'Inactivo - Sede';
                            case 'desistido': return item['estado'] === 'Desistido' || item['estado'] === 'Desistido MEN' || item['estado'] === 'Desistido MEN - Sede';
                            case 'desistido-int': return item['estado'] === 'Desistido Interno' || item['estado'] === 'Desistido Interno - Sede';
                            case 'rechazado': return item['estado'] === 'Rechazado' || item['estado'] === 'Negación RC' || item['estado'] === 'Negación AAC';
                            case 'option7': return item['estado'] === 'Activo - Sede';
                            case 'option8': return item['estado'] === 'En Creación*' || item['estado'] === 'En Creación - Sede';
                            case 'vencido-rc': return item['estado'] === 'Inactivo - Vencido RC';
                            default: return false;
                        }
                    });
                });
            }

            setFilteredData(filteredResult);
            return newSelectedValues;
        });
    };

    const isButtonSelected = (buttonValue) => {
        return selectedValues.includes(buttonValue);
    };

    const setButtonStyles = (buttonValue) => ({
        color: isButtonSelected(buttonValue) ? 'white' : 'grey',
        backgroundColor: isButtonSelected(buttonValue) ? 'grey' : 'transparent',
        border: `2px solid ${isButtonSelected(buttonValue) ? 'grey' : 'grey'}`,
        borderRadius: '6px',
    });

    const renderCount = (count, type) => {
        if (count !== 0) return count;
        if (!loadingState[type]) return 0;
        return <CircularProgress size={20} />;
    };

    // Función para renderizar la tabla filtrada
    const renderFilteredTable = (data, filter) => {
        if (!data || data.length === 0) return <p>Ningún programa por mostrar</p>;

        let filteredData = filter === 'No Aplica'
            ? data.filter(item => item['escuela'] === '' || item['escuela'] === '???' || item['escuela'] === 'SALE PARA TULIÁ')
            : Filtro4(data, filter);

        if (filteredData.length === 0) return <p>Ningún programa por mostrar</p>;

        if (isCargo.includes('Posgrados')) {
            filteredData = filteredData.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        }

        return (
            <div className='table-container'>
                {loading ? (
                    <p>Cargando datos...</p>
                ) : (
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {filteredData.map((item, index) => {
                                const rrcYear = item['fechavencrc'] ? parseInt(item['fechavencrc'].split('/')[2]) : null;
                                const aacYear = item['fechavencac'] ? parseInt(item['fechavencac'].split('/')[2]) : null;
    
                                const rrcColor = rrcYear ? getSemaforoColor(rrcYear) : 'transparent';
                                const aacColor = aacYear ? getSemaforoColor(aacYear) : 'transparent';

                                return (
                                    <tr key={index} onClick={() => handleRowClick(item)}>
                                        <td className="bold" style={{ width: '25%', fontSize: '14px', textAlign: 'left', paddingLeft: '5px' }}>{item['programa académico']}</td>
                                        <td>{item['departamento']}</td>
                                        <td>{item['sección']}</td>
                                        <td>{item['estado']}</td>
                                        <td>{item['pregrado/posgrado']}</td>
                                        <td>{item['nivel de formación']}</td>
                                        <td>{item['rc vigente']}</td>
                                        <td style={{ backgroundColor: rrcColor }}>
                                            {item['fechavencrc'] ? item['fechavencrc'] : 'N/A'}
                                        </td>
                                        <td>{item['ac vigente']}</td>
                                        <td style={{ backgroundColor: aacColor }}>
                                            {item['fechavencac'] ? item['fechavencac'] : 'N/A'}
                                        </td>
                                        {/* <Tooltip title="CREA" arrow>
                                            <td className="hover-darken" style={{ width: '5%', backgroundColor: getCellBackgroundColor(item, 'CREA') }}></td>
                                        </Tooltip>
                                        <Tooltip title="MOD" arrow>
                                            <td className="hover-darken" style={{ width: '5%', backgroundColor: getCellBackgroundColor(item, 'MOD') }}></td>
                                        </Tooltip>
                                        <Tooltip title="RRC" arrow>
                                            <td className="hover-darken" style={{ width: '5%', backgroundColor: getCellBackgroundColor(item, 'RRC') }}></td>
                                        </Tooltip>
                                        <Tooltip title="AAC" arrow>
                                            <td className="hover-darken" style={{ width: '5%', backgroundColor: getCellBackgroundColor(item, 'AAC') }}></td>
                                        </Tooltip>
                                        <Tooltip title="RAAC" arrow>
                                            <td className="hover-darken" style={{ width: '5%', backgroundColor: getCellBackgroundColor(item, 'RAAC') }}></td>
                                        </Tooltip>
                                        <Tooltip title="INT" arrow>
                                            <td className="hover-darken" style={{ width: '5%', backgroundColor: getCellBackgroundColor(item, 'INT') }}></td>
                                        </Tooltip> */}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    return (
        <>
            <Header />
            <div className='table-buttons'>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px' }}><strong>Total Programas: </strong> {filteredData.length} </div>
                    <ButtonsContainer>
                        {/* Fila de Pregrado y Posgrado */}
                        <ButtonRow>
                            <Button value="option1" className="custom-radio2"
                                style={setButtonStyles('option1')}
                                onClick={() => handleButtonClick('option1')}>
                                <Checkbox
                                    checked={selectedValues.includes('option1')}
                                    style={{ color: isButtonSelected('option1') ? 'white' : 'grey', padding: '0 5px 0 0' }}
                                    size="small"
                                />
                                Pregrado
                            </Button>
                            <Button value="option2" className="custom-radio2"
                                style={setButtonStyles('option2')}
                                onClick={() => handleButtonClick('option2')}>
                                <Checkbox
                                    checked={selectedValues.includes('option2')}
                                    style={{ color: isButtonSelected('option2') ? 'white' : 'grey', padding: '0 5px 0 0' }}
                                    size="small"
                                />
                                Posgrado
                            </Button>
                        </ButtonRow>
                        {/* Mostrar fila de niveles de formación solo si se selecciona Posgrado */}
                        {selectedValues.includes('option2') && (
                            <ButtonRow>
                                <Button value="doctorado" className="custom-radio2"
                                    style={setButtonStyles('doctorado')}
                                    onClick={() => handleButtonClick('doctorado')}> Doctorado </Button>
                                {/* <Button value="especializacion" className="custom-radio2"
                                    style={setButtonStyles('especializacion')}
                                    onClick={() => handleButtonClick('especializacion')}> Especialización </Button> */}
                                <Button value="especializacionMedico" className="custom-radio2"
                                    style={setButtonStyles('especializacionMedico')}
                                    onClick={() => handleButtonClick('especializacionMedico')}> Especialización Médico Quirúrgica </Button>
                                <Button value="especializacionUni" className="custom-radio2"
                                    style={setButtonStyles('especializacionUni')}
                                    onClick={() => handleButtonClick('especializacionUni')}> Especialización Universitaria </Button>
                                <Button value="maestria" className="custom-radio2"
                                    style={setButtonStyles('maestria')}
                                    onClick={() => handleButtonClick('maestria')}> Maestría </Button>
                                <Button value="otras" className="custom-radio2"
                                    style={setButtonStyles('otras')}
                                    onClick={() => handleButtonClick('otras')}> Otras (Vacío) </Button>
                            </ButtonRow>
                        )}
                        {/* Fila de estado */}
                        <ButtonRow>
                            <Button value="option3" className="custom-radio2"
                                style={setButtonStyles('option3')}
                                onClick={() => handleButtonClick('option3')}>
                                Activos Cali<br /> {renderCount(activosCount, 'activos')}
                            </Button>
                            <Button value="option7" className="custom-radio2"
                                style={setButtonStyles('option7')}
                                onClick={() => handleButtonClick('option7')}>
                                Activos Sedes <br /> {renderCount(activoSedesCount, 'activosSede')}
                            </Button>
                            <Button value="option4" className="custom-radio2"
                                style={setButtonStyles('option4')}
                                onClick={() => handleButtonClick('option4')}>
                                Creación Cali<br /> {renderCount(creacionCount, 'creacion')}
                            </Button>
                            <Button value="option8" className="custom-radio2"
                                style={setButtonStyles('option8')}
                                onClick={() => handleButtonClick('option8')}>
                                Creación (Sedes y otros) <br /> {renderCount(creacionSedesCount, 'creacionSedes')}
                            </Button>
                            <Button value="option6" className="custom-radio2"
                                style={setButtonStyles('option6')}
                                onClick={() => handleButtonClick('option6')}>
                                Inactivos <br /> {renderCount(inactivosCount, 'inactivos')}
                            </Button>
                        </ButtonRow>
                        {showInactiveButtons && (
                            <ButtonRow>
                                <Button value="inactive" className="custom-radio2"
                                    style={setButtonStyles('inactive')}
                                    onClick={() => handleButtonClick('inactive')}> Inactivo <br /> {renderCount(inactiveCount, 'inactive')}</Button>
                                <Button value="vencido-rc" className="custom-radio2"
                                    style={setButtonStyles('vencido-rc')}
                                    onClick={() => handleButtonClick('vencido-rc')}> Vencido RC <br /> {renderCount(vencidoRCCount, 'vencidoRC')}</Button>
                                <Button value="desistido" className="custom-radio2"
                                    style={setButtonStyles('desistido')}
                                    onClick={() => handleButtonClick('desistido')}> Desistido MEN <br /> {renderCount(desistidoMenCount, 'desistidoMen')}</Button>
                                <Button value="desistido-int" className="custom-radio2"
                                    style={setButtonStyles('desistido-int')}
                                    onClick={() => handleButtonClick('desistido-int')}> Desistido Interno <br /> {renderCount(desistidoInternoCount, 'desistidoInterno')}</Button>
                                <Button value="rechazado" className="custom-radio2"
                                    style={setButtonStyles('rechazado')}
                                    onClick={() => handleButtonClick('rechazado')}> Rechazado <br /> {renderCount(rechazadoCount, 'rechazado')}</Button>
                            </ButtonRow>
                        )}
                    </ButtonsContainer>
                </div>
            </div>
            {filteredData && filteredData.length > 0 ? (
                <div className='row-container'>
                    <table style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                        <thead>
                            <tr>
                                <th className="bold" style={{ width: '25%', backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Sección</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Estado</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Nivel Académico</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>RC Vigente</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento RC</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>AAC Vigente</th>
                                <th style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento AAC</th>
                                {/* <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>CREA</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>MOD</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>RRC</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>AAC</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>RAAC</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>INT</th> */}
                            </tr>
                        </thead>
                    </table>
                    {filteredData.some(data => data['escuela'] === 'Bacteriología y Lab. Clínico') &&
                        <CollapsibleButton buttonText={`Bacteriología y Lab. Clínico (${Filtro4(filteredData, 'Bacteriología y Lab. Clínico').length})`} content={renderFilteredTable(filteredData, 'Bacteriología y Lab. Clínico')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Ciencias Básicas') &&
                        <CollapsibleButton buttonText={`Ciencias Básicas (${Filtro4(filteredData, 'Ciencias Básicas').length})`} content={renderFilteredTable(filteredData, 'Ciencias Básicas')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Enfermería') &&
                        <CollapsibleButton buttonText={`Enfermería (${Filtro4(filteredData, 'Enfermería').length})`} content={renderFilteredTable(filteredData, 'Enfermería')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Medicina') &&
                        <CollapsibleButton buttonText={`Medicina (${Filtro4(filteredData, 'Medicina').length})`} content={renderFilteredTable(filteredData, 'Medicina')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Odontología') &&
                        <CollapsibleButton buttonText={`Odontología (${Filtro4(filteredData, 'Odontología').length})`} content={renderFilteredTable(filteredData, 'Odontología')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Rehabilitación Humana') &&
                        <CollapsibleButton buttonText={`Rehabilitación Humana (${Filtro4(filteredData, 'Rehabilitación Humana').length})`} content={renderFilteredTable(filteredData, 'Rehabilitación Humana')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Salud Pública') &&
                        <CollapsibleButton buttonText={`Salud Pública (${Filtro4(filteredData, 'Salud Pública').length})`} content={renderFilteredTable(filteredData, 'Salud Pública')} />
                    }
                    {filteredData.some(data => data['escuela'] === 'Dirección de Posgrados') &&
                        <CollapsibleButton buttonText={`Dirección de Posgrados (${Filtro4(filteredData, 'Dirección de Posgrados').length})`} content={renderFilteredTable(filteredData, 'Dirección de Posgrados')} />
                    }
                    {filteredData.some(item => item['escuela'] === ' ' || item['escuela'] === '???' || item['escuela'] === 'SALE PARA TULIÁ') &&
                        <CollapsibleButton buttonText={`No Aplica`} content={renderFilteredTable(filteredData, 'No Aplica')} />
                    }
                </div>
            ) : (
                <p>Ningún programa por mostrar</p>
            )}
            <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
        </>
    );
};

export default Programas;
