import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header"
import { Button, ButtonGroup } from "@mui/material";
import { useState } from "react";
import { styled } from '@mui/material/styles';
import { Filtro4 } from "../service/data";
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
                    return item['pregrado/posgrado'] === 'Pregrado';
                } else if (newSelectedValues.includes('option2')) { 
                    return item['pregrado/posgrado'] === 'Posgrado';
                }
                return true; 
            }).filter(item => {
                if (newSelectedValues.includes('option3')) { 
                    return item['estado'] === 'Activo';
                } else if (newSelectedValues.includes('option4')) { 
                    return item['estado'] === 'En Creación';
                }
                return true; 
            }).filter(item => {
                if (newSelectedValues.includes('option5')) { 
                    return item['sede'] !== 'Cali';
                }
                return true; 
            });
    
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
    const filteredData = Filtro4(data, filter);
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
                    <td className="bold">{item['programa académico']}</td> 
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
            <div><button className= 'buttonreturn' onClick={handleBackClick}>Atras</button></div>
            <div className='table-buttons'>
            <div className='programas2'>
                <div className='title'><strong>Programas</strong></div>
                <div className='activos'><strong>Activos </strong>..... {(rowData.filter(item => item['estado'] === 'Activo').length) !== 0 ? (rowData.filter(item => item['estado'] === 'Activo').length) : <CircularProgress size={20} /> }</div>
                <div className='creacion'><strong>En Creación</strong>..... {(rowData.filter(item => item['estado'] === 'En Creación').length) !== 0 ? (rowData.filter(item => item['estado'] === 'En Creación').length) : <CircularProgress size={20} /> }</div>
                <div className='sedes'><strong>En sedes</strong>..... {(rowData.filter(item => item['sede'] !== 'Cali').length) !== 0 ? (rowData.filter(item => item['sede'] !== 'Cali').length) : <CircularProgress size={20} /> }</div>
                <div className='total-programas'>Total Programas de la Facultad: {(rowData.length) !== 0 ? (rowData.length) : <CircularProgress size={20} /> }</div>
            </div>
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
                    <Button value="option5" className="custom-radio2" 
                        style={setButtonStyles('option5')}
                        onClick={() => handleButtonClick('option5')} > Sedes </Button> 
                </ButtonGroup>
                </div>
            </ButtonsContainer>  
            </div> 
            {filteredData && filteredData.length > 0 ? (
              <div className='row-container'>
                <table style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                      <th style={{ backgroundColor: headerBackgroundColor }}>Sección</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Estado</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
                    </tr>
                  </thead>
                </table>  
                <CollapsibleButton buttonText="Bacteriología y Lab. Clínico" content={renderFilteredTable(filteredData, 'Bacteriología y Lab. Clínico')} />
                <CollapsibleButton buttonText="Ciencias Básicas" content={renderFilteredTable(filteredData, 'Ciencias Básicas')} />
                <CollapsibleButton buttonText="Enfermería" content={renderFilteredTable(filteredData, 'Enfermería')} />
                <CollapsibleButton buttonText="Medicina" content={renderFilteredTable(filteredData, 'Medicina')} />
                <CollapsibleButton buttonText="Odontología" content={renderFilteredTable(filteredData, 'Odontología')} />
                <CollapsibleButton buttonText="Rehabilitación Humana" content={renderFilteredTable(filteredData, 'Rehabilitación Humana')} />
                <CollapsibleButton buttonText="Salud Pública" content={renderFilteredTable(filteredData, 'Salud Pública')} />
                <CollapsibleButton buttonText="No Aplica" content={renderFilteredTable(filteredData, 'No Aplica')} />
              </div>
            ) : (
              <p>Ningún progama por mostrar</p>
            )}        
        </>
    );

}

export default Programas;
