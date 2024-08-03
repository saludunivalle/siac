import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { Button, ButtonGroup, Tooltip, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { Filtro4, Filtro5, Filtro7 } from "../service/data";
import CollapsibleButton from "./CollapsibleButton";
import '/src/styles/home.css';

const Programas = () => {
    const location = useLocation();
    const rowData = location.state;
    const navigate = useNavigate();
    const [selectedValues, setSelectedValues] = useState(['option3', 'option4']);
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');
    const [loading, setLoading] = useState(false);
    const [activosCount, setActivosCount] = useState(0);
    const [creacionCount, setCreacionCount] = useState(0);
    const [creacionSedesCount, setCreacionSedesCount] = useState(0);
    const [activoSedesCount, setActivoSedesCount] = useState(0);
    const [inactivosCount, setInactivosCount] = useState(0);
    const [otrosCount, setOtrosCount] = useState(0);
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
        const filtered = isCargo.includes('Posgrados')
            ? rowData?.filter(item => item['pregrado/posgrado'] === 'Posgrado')
            : rowData;
        setFilteredData(filtered);
    }, [isCargo, rowData]);

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
        const fetchData = async () => {
            try {
                const response = isCargo.includes('Posgrados')
                    ? (await Filtro5()).filter(item => item['pregrado/posgrado'] === 'Posgrado')
                    : await Filtro5();

                setActivosCount(response.filter(item => item['estado'] === 'Activo').length);
                setActivoSedesCount(response.filter(item => item['estado'] === 'Activo - Sede').length);
                setCreacionCount(response.filter(item => item['estado'] === 'En Creación').length);
                setCreacionSedesCount(response.filter(item => item['estado'] === 'En Creación - Sede' || item['estado'] === 'En Creación*').length);
                setOtrosCount(response.filter(item => item['estado'] === 'Negación RC' || item['estado'] === 'Negación AAC').length);
                setInactivosCount(response.filter(item => item['estado'] === 'Inactivo' || item['estado'] === 'Desistido' || item['estado'] === 'Desistido Interno' || item['estado'] === 'Desistido Interno - Sede' || item['estado'] === 'Desistido MEN' || item['estado'] === 'Desistido MEN - Sede' || item['estado'] === 'Rechazado').length);
                setFilteredData(response);
            } catch (error) {
                console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
    }, [isCargo]);

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

        const topicMap = {
            CREA: 'Creación',
            MOD: 'Modificación',
            RRC: 'Renovación Registro Calificado',
            AAC: 'Acreditación',
            RAAC: 'Renovación Acreditación'
        };

        const seguimientosPorProceso = seguimientos.filter(seg => seg.topic === topicMap[process]);

        if (seguimientosPorProceso.length === 0) {
            return defaultGreyCondition ? '#E0E0E0' : 'white';
        }

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
        placeItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        '@media (max-width:600px)': {
            flexDirection: 'column',
        },
    });

    const handleBackClick = () => {
        navigate('/');
    };

    const handleButtonClick = (buttonValue) => {
        setSelectedValues(prevSelectedValues => {
            let newSelectedValues = prevSelectedValues.includes(buttonValue)
                ? prevSelectedValues.filter(val => val !== buttonValue)
                : buttonValue === 'option1' || buttonValue === 'option2'
                    ? [buttonValue]
                    : [...prevSelectedValues, buttonValue];

            // Si se hace clic en "Inactivos", seleccionar automáticamente "Inactivo", "Desistido" y "Rechazado"
            if (buttonValue === 'option6') {
                newSelectedValues = newSelectedValues.includes('option6')
                    ? newSelectedValues.filter(val => !['inactive', 'desistido', , 'desistido-int', 'rechazado'].includes(val))
                    : [...newSelectedValues, 'inactive', 'desistido', , 'desistido-int', 'rechazado'];
                setShowInactiveButtons(prevState => !prevState);
            }

            let filteredResult = rowData.filter(item => {
                const filterByOption = option => {
                    switch (option) {
                        case 'option1':
                            return item['pregrado/posgrado'] === 'Pregrado' || item['pregrado/posgrado'] === 'Pregrado-Tec';
                        case 'option2':
                            return item['pregrado/posgrado'] === 'Posgrado';
                        default:
                            return true;
                    }
                };
                return newSelectedValues.map(filterByOption).every(result => result === true);
            });

            if (newSelectedValues.some(option => ['option3', 'option4', 'option5', 'option6', 'option7', 'option8', 'inactive', 'desistido','desistido-int', 'rechazado'].includes(option))) {
                filteredResult = filteredResult.filter(item => {
                    return newSelectedValues.includes('option3') && (item['estado'] === 'Activo') ||
                        newSelectedValues.includes('option4') && (item['estado'] === 'En Creación') ||
                        newSelectedValues.includes('option5') && (item['estado'] === 'Negación RC' || item['estado'] === 'Negación AAC' ) ||
                        newSelectedValues.includes('inactive') && (item['estado'] === 'Inactivo') ||
                        newSelectedValues.includes('desistido') && (item['estado'] === 'Desistido' || item['estado'] === 'Desistido MEN' || item['estado'] === 'Desistido MEN - Sede') ||
                        newSelectedValues.includes('desistido-int') && (item['estado'] === 'Desistido Interno' || item['estado'] === 'Desistido Interno - Sede') ||
                        newSelectedValues.includes('rechazado') && (item['estado'] === 'Rechazado') ||
                        newSelectedValues.includes('option7') && (item['estado'] === 'Activo - Sede') ||
                        newSelectedValues.includes('option8') && (item['estado'] === 'En Creación*' || item['estado'] === 'En Creación - Sede');
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
                    <table>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index} onClick={() => handleRowClick(item)}>
                                    <td className="bold" style={{ width: '25%', fontSize: '14px', textAlign: 'left', paddingLeft: '5px' }}>{item['programa académico']}</td>
                                    <td>{item['departamento']}</td>
                                    <td>{item['sección']}</td>
                                    <td>{item['estado']}</td>
                                    <td>{item['nivel de formación']}</td>
                                    <Tooltip title="CREA" arrow>
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
                                    </Tooltip>
                                </tr>
                            ))}
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
                        <div className="contenedorButtonGroup">
                            <ButtonGroup style={{ gap: '10px' }}>
                                <Button value="option1" className="custom-radio2"
                                    style={setButtonStyles('option1')}
                                    onClick={() => handleButtonClick('option1')}> Pregrado </Button>
                                <Button value="option2" className="custom-radio2"
                                    style={setButtonStyles('option2')}
                                    onClick={() => handleButtonClick('option2')}> Posgrado </Button>
                            </ButtonGroup>
                        </div>
                        <div className="contenedorButtonGroup">
                            <ButtonGroup style={{ gap: '10px' }}>
                                <Button value="option3" className="custom-radio2"
                                    style={setButtonStyles('option3')}
                                    onClick={() => handleButtonClick('option3')}> Activos <br /> {activosCount !== 0 ? activosCount : <CircularProgress size={20} /> } </Button>
                                <Button value="option7" className="custom-radio2"
                                    style={setButtonStyles('option7')}
                                    onClick={() => handleButtonClick('option7')}> Activos Sedes <br /> {activoSedesCount !== 0 ? activoSedesCount : <CircularProgress size={20} /> }</Button>
                                <Button value="option4" className="custom-radio2"
                                    style={setButtonStyles('option4')}
                                    onClick={() => handleButtonClick('option4')}> Creación <br /> {creacionCount !== 0 ? creacionCount : <CircularProgress size={20} /> } </Button>
                                <Button value="option8" className="custom-radio2"
                                    style={setButtonStyles('option8')}
                                    onClick={() => handleButtonClick('option8')}> Creación (Sedes y otros) <br /> {creacionSedesCount !== 0 ? creacionSedesCount : <CircularProgress size={20} /> }</Button>
                                <Button value="option5"
                                    style={setButtonStyles('option5')}
                                    onClick={() => handleButtonClick('option5')}> Negación <br /> {otrosCount !== 0 ? otrosCount : <CircularProgress size={20} /> } </Button>
                                <Button value="option6"
                                    style={setButtonStyles('option6')}
                                    onClick={() => handleButtonClick('option6')}> Inactivos <br /> {inactivosCount !== 0 ? inactivosCount : <CircularProgress size={20} /> }</Button>
                            </ButtonGroup>
                        </div>
                        {showInactiveButtons && (
                            <div className="contenedorButtonGroup" style={{ marginTop: '10px' }}>
                                <ButtonGroup style={{ gap: '10px' }}>
                                    <Button value="inactive"
                                        style={setButtonStyles('inactive')}
                                        onClick={() => handleButtonClick('inactive')}> Inactivo </Button>
                                    <Button value="desistido"
                                        style={setButtonStyles('desistido')}
                                        onClick={() => handleButtonClick('desistido')}> Desistido MEN</Button>
                                    <Button value="desistido-int"
                                        style={setButtonStyles('desistido-int')}
                                        onClick={() => handleButtonClick('desistido-int')}> Desistido Interno</Button>
                                    <Button value="rechazado"
                                        style={setButtonStyles('rechazado')}
                                        onClick={() => handleButtonClick('rechazado')}> Rechazado </Button>
                                </ButtonGroup>
                            </div>
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
                                <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>CREA</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>MOD</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>RRC</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>AAC</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>RAAC</th>
                                <th style={{ width: '5%', backgroundColor: headerBackgroundColor }}>INT</th>
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
