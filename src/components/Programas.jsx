import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header"
import { Button, ButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { Filtro4, Filtro5 } from "../service/data";
import CircularProgress from '@mui/material/CircularProgress';
import CollapsibleButton from "./CollapsibleButton";
import '/src/styles/home.css'; 


const Programas = () => {
    const location = useLocation();
    const rowData = location.state; 
    const navigate = useNavigate();
    const [selectedValues, setSelectedValues] = useState([]);
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
    const [loading, setLoading] = useState(false);
    const [activosCount, setActivosCount]= useState(0);
    const [creacionCount, setCreacionCount]= useState(0);
    const [creacionSedesCount, setCreacionSedesCount]= useState(0);
    const [activoSedesCount, setActivoSedesCount]= useState(0);
    const [inactivosCount, setInactivosCount]= useState(0);
    const [otrosCount, setOtrosCount]= useState(0);

    console.log('datos', rowData);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await Filtro5(); 
            setActivosCount(response.filter(item => item['estado'] === 'Activo').length);   
            setActivoSedesCount(response.filter(item => item['estado'] === 'Activo - Sede').length);   
            setCreacionCount(response.filter(item => item['estado'] === 'En Creación').length);  
            setCreacionSedesCount(response.filter(item => item['estado'] === 'En Creación - Sede' || item['estado'] === 'En Creación*').length);     
            setOtrosCount(response.filter(item => item['estado'] === 'En conjunto con otra facultad' || item['estado'] === 'Pte. Acred. ARCOSUR').length);  
            setInactivosCount(response.filter(item => item['estado'] === 'Inactivo' || item['estado'] === 'Desistido' || item['estado'] === 'Rechazado').length);  
            setRowData(response);         
          } catch (error) {
            console.error('Error al filtrar datos:', error);
          }
        };
        const buttonGoogle = document.getElementById("buttonDiv")
        if (buttonGoogle){
          buttonGoogle.classList.add('_display_none');
        }
        fetchData();
      }, []);

    const handleRowClick = (rowData) => {
        console.log('Datos de la fila:', rowData);
        navigate('/program_details', { state: rowData });
    };

    const ButtonsContainer = styled('div')({
        display: 'flex',
        flexDirection: 'row',
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
            let newSelectedValues;
    
            if ((buttonValue === 'option1' && prevSelectedValues.includes('option2')) ||
                (buttonValue === 'option2' && prevSelectedValues.includes('option1'))) {
                newSelectedValues = [buttonValue];
            }
            else if ((buttonValue === 'option3' && prevSelectedValues.includes('option4')) ||
                     (buttonValue === 'option4' && prevSelectedValues.includes('option3'))) {
                newSelectedValues = [buttonValue, ...prevSelectedValues.filter(val => val === 'option1' || val === 'option2')];
            }
            else if (buttonValue === 'option5' && prevSelectedValues.includes('option5')) {
                newSelectedValues = prevSelectedValues.filter(value => value !== buttonValue);
            }
            else {
                newSelectedValues = prevSelectedValues.includes(buttonValue)
                    ? prevSelectedValues.filter(value => value !== buttonValue)
                    : [...prevSelectedValues, buttonValue];
            }
    
            let filteredResult = rowData.filter(item => {
                if (newSelectedValues.includes('option1')) { 
                    return item['pregrado/posgrado'] === 'Pregrado' || item['pregrado/posgrado'] === 'Pregrado-Tec';
                } else if (newSelectedValues.includes('option2')) { 
                    return item['pregrado/posgrado'] === 'Posgrado';
                }
                return true; 
            }).filter(item => {
                if (newSelectedValues.includes('option3')) { 
                    return (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede');
                } else if (newSelectedValues.includes('option4')) { 
                    return (item['estado'] === 'En Creación' || item['estado'] === 'En Creación*' || item['estado'] === 'En Creación - Sede');
                }
                return true; 
            }).filter(item => {
                if (newSelectedValues.includes('option5')) { 
                    return item['sede'] !== 'Cali';
                }
                return true; 
            });

            if (newSelectedValues.includes('option6')) {
                filteredResult = filteredResult.filter(item => item['estado'] === 'Inactivo');
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
        };
    };

    const renderFilteredTable = (data, filter) => {
    let filteredData;
    if (filter === 'No Aplica'){
        filteredData = (data.filter(item => item['escuela'] === '' || item['escuela'] === '???' || item['escuela'] === 'Dirección de Posgrados' || item['escuela'] === 'SALE PARA TULIÁ' || item['escuela'] === 'Dirección de Posgrados (varias)' ));
    } else {
        filteredData = Filtro4(data, filter);
    }
    if (filteredData.length === 0) {
        return <p>Ningún progama por mostrar</p>;
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
                    <td className="bold" style={{fontSize:'14px', textAlign: 'left', paddingLeft:'5px'}}>{item['programa académico']}</td> 
                    <td>{item['departamento']}</td> 
                    <td>{item['sección']}</td> 
                    <td>{item['estado']}</td> 
                    <td>{item['nivel de formación']}</td> 
                </tr>
                ))}
            </tbody>
            </table>
            )}
            </div>
    );
    };

    return(
        <>
            <Header/>
            <div className='table-buttons'>
            <div className='programas2'>
                <div className='title'><strong>Programas</strong></div>
                <table>
                <thead>
                    <tr>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td style={{paddingRight:'4px'}}>Activos Cali</td>
                    <td>{activosCount !== 0 ? activosCount : <CircularProgress size={20} /> }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}>Activos Sedes</td>
                    <td>{activoSedesCount !== 0 ? activoSedesCount : <CircularProgress size={20} /> }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}>En Creación</td>
                    <td>{creacionCount !== 0 ? creacionCount : <CircularProgress size={20} /> }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}>En Creación (Sedes y otros)</td>
                    <td>{creacionSedesCount !== 0 ? creacionSedesCount : <CircularProgress size={20} /> }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}>Otros</td>
                    <td>{otrosCount !== 0 ? otrosCount : <CircularProgress size={20} /> }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}><strong>SUB-TOTAL:</strong></td>
                    <td>{activosCount + creacionCount + creacionSedesCount + activoSedesCount + otrosCount }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}>Inactivos - Desistidos - Rechazados</td>
                    <td>{inactivosCount !== 0 ? inactivosCount : <CircularProgress size={20} /> }</td>
                    </tr>
                    <tr>
                    <td style={{paddingRight:'4px'}}><strong>TOTAL:</strong></td>
                    <td>{activosCount + creacionCount + creacionSedesCount + activoSedesCount + otrosCount + inactivosCount}</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap: '40px', justifyContent:'center', textAlign:'center'}}>
                <div style={{fontSize:'18px'}}><strong>Total Progamas: </strong> {filteredData.length}</div>
            <ButtonsContainer>
                <div className="contenedorButtonGroup">
                <ButtonGroup >
                    <Button value="option1" className="custom-radio2"
                        style={setButtonStyles('option1')}
                        onClick={() => handleButtonClick('option1')} > Pregrado </Button>
                    <Button value="option2" className="custom-radio2" 
                        style={setButtonStyles('option2')}
                        onClick={() => handleButtonClick('option2')} > Posgrado </Button>
                </ButtonGroup>
                </div>
                <div className="contenedorButtonGroup">
                <ButtonGroup>
                    <Button value="option3" className="custom-radio2" 
                        style={setButtonStyles('option3')}
                        onClick={() => handleButtonClick('option3')} > Activos </Button>
                    <Button value="option4" className="custom-radio2" 
                        style={setButtonStyles('option4')}
                        onClick={() => handleButtonClick('option4')} > Creacion </Button>
                </ButtonGroup>
                </div>
                <div className="contenedorButtonGroup">
                <ButtonGroup >
                    <Button value="option5" className="custom-radio2" 
                            style={setButtonStyles('option5')}
                            onClick={() => handleButtonClick('option5')} > Sedes </Button> 
                </ButtonGroup>
                </div>
                <div className="contenedorButtonGroup">
                <ButtonGroup >
                    <Button value="option6" 
                            style={setButtonStyles('option6')}
                            onClick={() => handleButtonClick('option6')} > Ver Inactivos </Button> 
                </ButtonGroup>
                </div>
            </ButtonsContainer> 
            </div> 
            </div> 
            {filteredData && filteredData.length > 0 ? (
              <div className='row-container'>
                <table style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th className="bold" style={{ backgroundColor: headerBackgroundColor}}>Programa Académico</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                      <th style={{ backgroundColor: headerBackgroundColor }}>Sección</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Estado</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
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
                    <CollapsibleButton buttonText={`No Aplica`} content={renderFilteredTable(filteredData, 'No Aplica')} />
                {/* <CollapsibleButton buttonText="Bacteriología y Lab. Clínico" content={renderFilteredTable(filteredData, 'Bacteriología y Lab. Clínico')} />
                <CollapsibleButton buttonText="Ciencias Básicas" content={renderFilteredTable(filteredData, 'Ciencias Básicas')} />
                <CollapsibleButton buttonText="Enfermería" content={renderFilteredTable(filteredData, 'Enfermería')} />
                <CollapsibleButton buttonText="Medicina" content={renderFilteredTable(filteredData, 'Medicina')} />
                <CollapsibleButton buttonText="Odontología" content={renderFilteredTable(filteredData, 'Odontología')} />
                <CollapsibleButton buttonText="Rehabilitación Humana" content={renderFilteredTable(filteredData, 'Rehabilitación Humana')} />
                <CollapsibleButton buttonText="Salud Pública" content={renderFilteredTable(filteredData, 'Salud Pública')} />
                <CollapsibleButton buttonText="No Aplica" content={renderFilteredTable(filteredData, 'No Aplica')} /> */}
              </div>
            ) : (
              <p>Ningún progama por mostrar</p>
            )}      
            <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>  
        </>
    );

}

export default Programas;
