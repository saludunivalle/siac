import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filtro4, Filtro5, Filtro7 } from '../service/data';
import '/src/styles/home.css'; 
import CollapsibleButton from './CollapsibleButton';
import { Button, ButtonGroup } from "@mui/material";
import * as XLSX from 'xlsx';

const Mod = ({ globalVariable }) => {
    const location = useLocation();
    const rowData = location.state; 
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedValues, setSelectedValues] = useState(['option1', 'option2']);
    const [filteredDataSeg, setFilteredDataSeg] = useState(rowData);
    const [updateTrigger, setUpdateTrigger] = useState(false); 

    // Permisos
    const [user, setUser] = useState('');
    const [isCargo, setCargo] = useState([' ']);

    useEffect(() => {
        if (sessionStorage.getItem('logged')) {
            let res = JSON.parse(sessionStorage.getItem('logged'));
            const permisos = res.map(item => item.permiso).flat();
            setCargo(permisos);
            setUser(res[0].user);
            //console.log("Permisos del usuario:", permisos);
        }
    }, []);

    useEffect(() => {
        if (isCargo.includes('Posgrados')) {
            const filtered = rowData?.filter(item => item['pregrado/posgrado'] === 'Posgrado');
            setFilteredData(filtered);
        } else {
            setFilteredData(rowData);
        }
    }, [rowData, isCargo]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seguimientos = await Filtro7();
                const response2 = seguimientos.filter(item => item['id_programa']);
                setFilteredDataSeg(response2);
            } catch (error) {
                console.error('Error al filtrar datos:', error);
            }
        };
    
        fetchData();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;
                if (isCargo.includes('Posgrados')) {
                    const filtered = await Filtro5();
                    response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
                } else {
                    response = await Filtro5();
                }
                setFilteredData(response.filter(item => item['mod'] === 'SI'));
            } catch (error) {
                console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
    }, [isCargo]);

    const handleRowClick = (rowData) => {
        navigate('/program_details', { state: { ...rowData, globalVariable } });
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Filtrados');
        XLSX.writeFile(workbook, 'datos_MOD.xlsx');
      };

    const getBackgroundColor = (data) => {
        if (!data || !data.id_programa) {
            return 'white'; 
        }
        try {
            const seguimientos = filteredDataSeg;   
            const response = seguimientos.filter(item => item['id_programa'] === data.id_programa);
            
            if (response.length === 0) {
                return 'white';
            }
            
            const seguimientoMasReciente = response.reduce((prev, current) =>
                new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
            );
            
            let color;
            switch (seguimientoMasReciente.riesgo) {
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
                    color = 'white';
            }
            return color;
        } catch (error) {
            console.error('Error al obtener el color de fondo:', error);
            return 'white';     
        }
    };
    
    const handleButtonClick = async (buttonValue) => {
        let response;
        if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro5();
            response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        } else {
            response = await Filtro5();
        }
        const result = response.filter(item => item['mod'] === 'SI');
        setSelectedValues(prevSelectedValues => {
            let newSelectedValues;

            if (prevSelectedValues.includes(buttonValue)) {
                newSelectedValues = prevSelectedValues.filter(val => val !== buttonValue);
            } else {
                newSelectedValues = [...prevSelectedValues, buttonValue];
            }

            let filteredResult = result.filter(item => {
                const filterByOption = option => {
                    switch (option) {
                        default:
                            return true;
                    }
                };

                const filterResults = newSelectedValues.map(filterByOption);
                return filterResults.every(result => result === true);
            });
            
            if (newSelectedValues.includes('option1') || newSelectedValues.includes('option2')) {
                filteredResult = filteredResult.filter(item => {
                    return newSelectedValues.includes('option1') && (item['mod_sus'] === 'SI') ||
                           newSelectedValues.includes('option2') && (item['mod_sus'] === 'NO');
                });
            }

            setFilteredData(filteredResult);

            return newSelectedValues;
        });
    };
    
    const isButtonSelected = (buttonValue) => {
        return selectedValues.includes(buttonValue);
    };

    const setButtonStyles = (buttonValue) => {
        return {
            color: isButtonSelected(buttonValue) ? 'white' : 'grey',
            backgroundColor: isButtonSelected(buttonValue) ? 'grey' : 'transparent',
            border: `2px solid ${isButtonSelected(buttonValue) ? 'grey' : 'grey'}`,
            borderRadius: '6px',
            width: '300px',
            height: '50px',
            marginTop: '10px',
        };
    };

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

    const renderFilteredTable = (data) => {
        if (!data || data.length === 0) {
            return <p>Ningún programa por mostrar</p>;
        }
        if (isCargo.includes('Posgrados')) {
            data = data.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        }
        const colors = {};
        for (const item of data) {
            const color = getBackgroundColor(item);
            colors[item.id_programa] = color;
        }
    
        return (
            <div className='table-container'>
                <table>
                    <tbody>
                        {data.map((item, index) => {
                            const color = colors[item.id_programa] || 'white';
                            const rrcYear = item['fechavencrc'] ? parseInt(item['fechavencrc'].split('/')[2]) : null;
                            const aacYear = item['fechavencac'] ? parseInt(item['fechavencac'].split('/')[2]) : null;

                            const rrcColor = rrcYear ? getSemaforoColor(rrcYear) : 'transparent';
                            const aacColor = aacYear ? getSemaforoColor(aacYear) : 'transparent';

                            return (
                                <tr key={index} onClick={() => handleRowClick(item)}>
                                    <td className="bold" style={{backgroundColor: color, fontSize:'14px', textAlign: 'left', paddingLeft:'5px'}}>{item['programa académico']}</td> 
                                    <td>{item['departamento']}</td> 
                                    <td>{item['sección']}</td> 
                                    {/* <td>{item['estado']}</td> */}
                                    <td>{item['pregrado/posgrado']}</td>
                                    <td>{item['nivel de formación']}</td>
                                    <td>{item['rc vigente']}</td>
                                    <td style={{ backgroundColor: rrcColor }}>{item['fechavencrc']}</td>
                                    <td>{item['ac vigente']}</td>
                                    <td style={{ backgroundColor: aacColor }}>{item['fechavencac']}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <ButtonGroup style={{gap:'10px', marginLeft:'20px', marginTop:'10px', width: '100%', justifyContent:'center'}} >
                <Button value="option1" className="custom-radio2"
                    style={setButtonStyles('option1')}
                    onClick={() => handleButtonClick('option1')} > Sustanciales </Button>
                <Button value="option2" className="custom-radio2" 
                    style={setButtonStyles('option2')}
                    onClick={() => handleButtonClick('option2')} > No Sustanciales </Button>
            </ButtonGroup>
            <div> 
                <button style={{marginTop:'20px', marginLeft:'20px'}} onClick={handleDownloadExcel} className="download-button">Generar Excel</button>
                {filteredData && filteredData.length > 0 ? (
                    <div className='row-container'>
                        <table style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                                    <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                                    <th style={{ backgroundColor: headerBackgroundColor }}>Sección</th>
                                    {/* <th style={{ backgroundColor: headerBackgroundColor }}>Estado</th> */}
                                    <th style={{ backgroundColor: headerBackgroundColor }}>Nivel Académico</th>
                                    <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
                                    <th style={{ backgroundColor: headerBackgroundColor }}>RC Vigente</th>
                                    <th style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento RC</th>
                                    <th style={{ backgroundColor: headerBackgroundColor }}>AAC Vigente</th>
                                    <th style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento AAC</th>
                                </tr>
                            </thead>
                        </table>  
                        {filteredData.some(data => data['escuela'] === 'Bacteriología y Lab. Clínico') && 
                            <CollapsibleButton buttonText={`Bacteriología y Lab. Clínico (${Filtro4(filteredData, 'Bacteriología y Lab. Clínico').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Bacteriología y Lab. Clínico'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Ciencias Básicas') && 
                            <CollapsibleButton buttonText={`Ciencias Básicas (${Filtro4(filteredData, 'Ciencias Básicas').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Ciencias Básicas'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Enfermería') && 
                            <CollapsibleButton buttonText={`Enfermería (${Filtro4(filteredData, 'Enfermería').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Enfermería'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Medicina') && 
                            <CollapsibleButton buttonText={`Medicina (${Filtro4(filteredData, 'Medicina').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Medicina'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Odontología') && 
                            <CollapsibleButton buttonText={`Odontología (${Filtro4(filteredData, 'Odontología').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Odontología'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Rehabilitación Humana') && 
                            <CollapsibleButton buttonText={`Rehabilitación Humana (${Filtro4(filteredData, 'Rehabilitación Humana').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Rehabilitación Humana'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Salud Pública') && 
                            <CollapsibleButton buttonText={`Salud Pública (${Filtro4(filteredData, 'Salud Pública').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Salud Pública'))} />
                        }
                        {filteredData.some(data => data['escuela'] === 'Dirección de Posgrados') && 
                            <CollapsibleButton buttonText={`Dirección de Posgrados (${Filtro4(filteredData, 'Dirección de Posgrados').length})`} content={renderFilteredTable(Filtro4(filteredData, 'Dirección de Posgrados'))} />
                        }
                        {filteredData.some(data => data['escuela'] === ' ' && data['escuela'] === '???' && data['escuela'] === 'SALE PARA TULIÁ') &&
                            <CollapsibleButton buttonText={`No Aplica`} content={renderFilteredTable(Filtro4(filteredData, 'No Aplica'))} />
                        }
                    </div>
                ) : (
                    <p>Ningún programa por mostrar</p>
                )}        
            </div>
        </>
    );
};

export default Mod;
