// Home.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonGroup, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Semaforo from './Semaforo';
import SemaforoAc from './SemaforoAc';
import { Filtro5, Filtro7, Filtro10, clearSheetExceptFirstRow, sendDataToSheetNew } from '../service/data';
import Header from './Header';
import '/src/styles/home.css';
import Crea from './Crea';
import Aac from './Aac';
import Mod from './Mod';

const Home = () => {
  const [globalVariable, setGlobalVariable] = useState(); // Variable global
  const [selectedValue, setSelectedValue] = useState();
  const [semaforoVisible, setSemaforoVisible] = useState(false);
  const [semaforoAcVisible, setSemaforoAcVisible] = useState(false);
  const [activosCount, setActivosCount] = useState(0);
  const [creacionCount, setCreacionCount] = useState(0);
  const [creacionSedesCount, setCreacionSedesCount] = useState(0);
  const [activoSedesCount, setActivoSedesCount] = useState(0);
  const [inactivosCount, setInactivosCount] = useState(0);
  const [otrosCount, setOtrosCount] = useState(0);
  const [aacCount, setAacCount] = useState(0);
  const [rrcCount, setRrcCount] = useState(0);
  const [raacCount, setRaacCount] = useState(0);
  const [modCount, setModCount] = useState(0);
  const navigate = useNavigate();
  const [programasVisible, setProgramasVisible] = useState(true);
  const [rowData, setRowData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);

  useEffect(() => {
    if (sessionStorage.getItem('logged')) {
      let res = JSON.parse(sessionStorage.getItem('logged'));
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      setUser(res[0].user);
      console.log("Permisos del usuario:", permisos);
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
        let response;
        if (isCargo.includes('Posgrados')) {
          const filtered = await Filtro5();
          response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        } else {
          response = await Filtro5();
        }
        setActivosCount(response.filter(item => item['estado'] === 'Activo').length);
        setActivoSedesCount(response.filter(item => item['estado'] === 'Activo - Sede').length);
        setCreacionCount(response.filter(item => item['estado'] === 'En Creación').length);
        setCreacionSedesCount(response.filter(item => item['estado'] === 'En Creación - Sede' || item['estado'] === 'En Creación*').length);
        setOtrosCount(response.filter(item => item['estado'] === 'En conjunto con otra facultad' || item['estado'] === 'Pte. Acred. ARCOSUR').length);
        setInactivosCount(response.filter(item => item['estado'] === 'Inactivo' || item['estado'] === 'Desistido' || item['estado'] === 'Rechazado').length);
        setAacCount(response.filter(item => item['aac_1a'] === 'SI').length);
        setRrcCount(response.filter(item => item['rc vigente'] === 'SI' && item['fase rrc'] !== 'N/A').length);
        setRaacCount(response.filter(item => item['ac vigente'] === 'SI' && item['fase rac'] !== 'N/A').length);
        setModCount(response.filter(item => item['mod'] === 'SI').length);
        setRowData(response);
        setFilteredData(response);
      } catch (error) {
        console.error('Error al filtrar datos:', error);
      }
    };
    const buttonGoogle = document.getElementById("buttonDiv");
    if (buttonGoogle) {
      buttonGoogle.classList.add('_display_none');
    }
    fetchData();
  }, [isCargo]);

  const handleBackClick = () => {
    setProgramasVisible(true);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);
    setSelectedValue();
  };

  const setButtonStyles = (buttonValue) => {
    return {
      color: selectedValue === buttonValue ? 'white' : 'grey',
      backgroundColor: selectedValue === buttonValue ? 'grey' : 'transparent',
      border: `2px solid ${selectedValue === buttonValue ? 'grey' : 'grey'}`,
      borderRadius: '6px',
    };
  };

  const handleButtonClick = (buttonValue) => {
    setSelectedValue(buttonValue);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);

    if (buttonValue === 'option1') {
      setSemaforoVisible(true);
    } else if (buttonValue === 'option2') {
      setSemaforoAcVisible(true);
    }
    setProgramasVisible(false);
  };

  const handleClick = () => {
    if (filteredData) {
      navigate('/programas', { state: filteredData });
    }
  };

  const prepareReportData = async () => {
    try {
        const seguimientos = await Filtro7();
        const programas = await Filtro5();
        const fases = await Filtro10();

        const filteredSeguimientos = seguimientos.filter(seg => seg.usuario === user);

        const reportData = filteredSeguimientos.map(seg => {
            const programa = programas.find(prog => prog.id_programa === seg.id_programa);
            const fase = fases.find(f => f.id === seg.fase);

            return {
                timeStamp: seg.timestamp || '', 
                programaAcademico: programa ? programa['programa académico'] : '', 
                topic: seg.topic || '', 
                mensaje: seg.mensaje || '', 
                riesgo: seg.riesgo || '', 
                urlAdjunto: seg.url_adjunto || '', 
                fase: fase ? fase.fase : '' 
            };
        });

        return reportData;
    } catch (error) {
        console.error('Error al preparar datos del reporte:', error);
        throw error;
    }
};
  

  const downloadSheet = (spreadsheetId) => {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    window.open(url, '_blank');
  };

  const handleReporteActividades = async () => {
    try {
        const spreadsheetId = '1R4Ugfx43AoBjxjsEKYl7qZsAY8AfFNUN_gwcqETwgio';
        const sheetName = 'REPORTE';

        await clearSheetExceptFirstRow(spreadsheetId, sheetName);

        const reportData = await prepareReportData();
        console.log('Datos preparados para enviar:', reportData); 

        const dataToSend = reportData.map(item => ({
            timeStamp: item.timeStamp,
            programaAcademico: item.programaAcademico,
            topic: item.topic,
            mensaje: item.mensaje,
            riesgo: item.riesgo,
            urlAdjunto: item.urlAdjunto,
            fase: item.fase
        }));

        // Itera sobre cada elemento de dataToSend y envíalo
        for (const item of dataToSend) {
            const dataSend = [
                item.timeStamp,
                item.programaAcademico,
                item.topic,
                item.mensaje,
                item.riesgo,
                item.urlAdjunto,
                item.fase
            ];

            await sendDataToSheetNew(dataSend);
        }

        downloadSheet(spreadsheetId);
        console.log('Todos los datos han sido enviados.');
    } catch (error) {
        console.error('Error al generar reporte:', error);
    }
};

  return (
    <>
      <Header />
      <div className='container-general'>
        <div className='alltogetherGeneral'>
          <div style={{ fontSize: '25px', paddingBottom: '60px' }}>Procesos de Calidad</div>
          <div className='alltogether'>
            <div className='alltogether1'>
              <div className="banner">
                <div className="linea1"></div>
                <div className="text">Registro Calificado</div>
                <div className="linea1"></div>
              </div>
              <div className='buttons-container'>
                <ButtonGroup
                  aria-label="gender"
                  name="controlled-radio-buttons-group"
                  className='radio-group'
                >
                  <Button value="option4" className="custom-radio"
                    style={setButtonStyles('option4')}
                    onClick={() => { handleButtonClick('option4'), setGlobalVariable('CREA') }}
                  > CREA <br />
                    {creacionCount !== 0 ? creacionCount : <CircularProgress size={20} />}
                  </Button>
                  <Button value="option5" className="custom-radio"
                    style={setButtonStyles('option5')}
                    onClick={() => { handleButtonClick('option5'), setGlobalVariable('MOD') }}
                  > MOD <br />
                    {modCount !== 0 ? modCount : <CircularProgress size={20} />}
                  </Button>
                  <Button value="option1" className="custom-radio"
                    style={setButtonStyles('option1')}
                    onClick={() => { handleButtonClick('option1'), setGlobalVariable('RRC') }}
                  > RRC <br />
                    {rrcCount !== 0 ? rrcCount : <CircularProgress size={20} />}
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className='alltogether1'>
              <div className="banner">
                <div className="linea2"></div>
                <div className="text">Acreditación</div>
                <div className="linea2"></div>
              </div>
              <div className='buttons-container'>
                <ButtonGroup
                  aria-label="gender"
                  name="controlled-radio-buttons-group"
                  className='radio-group'
                >
                  <Button value="option3" className="custom-radio"
                    style={setButtonStyles('option3')}
                    onClick={() => { handleButtonClick('option3'), setGlobalVariable('AAC') }}
                  > AAC <br />
                    {aacCount !== 0 ? aacCount : <CircularProgress size={20} />}
                  </Button>
                  <Button value="option2" className="custom-radio"
                    style={setButtonStyles('option2')}
                    onClick={() => { handleButtonClick('option2'), setGlobalVariable('RAAC') }}
                  > RAAC  <br />
                    {raacCount !== 0 ? raacCount : <CircularProgress size={20} />}
                  </Button>
                  <Button value="option3" className="custom-radio"
                    style={{ color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> INT </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </div>
        {programasVisible && (
          <div className='programas' onClick={handleClick}>
            <div className='title'><strong>Programas</strong></div>
            <table>
              <thead>
                <tr>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingRight: '4px' }}>Activos Cali</td>
                  <td>{activosCount !== 0 ? activosCount : <CircularProgress size={20} />}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}>Activos Sedes</td>
                  <td>{activoSedesCount !== 0 ? activoSedesCount : <CircularProgress size={20} />}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}>En Creación</td>
                  <td>{creacionCount !== 0 ? creacionCount : <CircularProgress size={20} />}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}>En Creación (Sedes y otros)</td>
                  <td>{creacionSedesCount !== 0 ? creacionSedesCount : <CircularProgress size={20} />}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}>Otros</td>
                  <td>{otrosCount !== 0 ? otrosCount : <CircularProgress size={20} />}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}><strong>SUB-TOTAL:</strong></td>
                  <td>{activosCount + creacionCount + creacionSedesCount + activoSedesCount + otrosCount}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}>Inactivos - Desistidos - Rechazados</td>
                  <td>{inactivosCount !== 0 ? inactivosCount : <CircularProgress size={20} />}</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '4px' }}><strong>TOTAL:</strong></td>
                  <td>{activosCount + creacionCount + creacionSedesCount + activoSedesCount + otrosCount + inactivosCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{width:"68%", display:"flex", justifyContent:"center"}}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/seguimiento-inicio')}
          style={{
            marginTop: '20px',
            backgroundColor: '#ffffff',
            color: '#666666',
            border: '2px solid #666666',
            borderRadius: '6px',
            width: '200px',
            margin: '0 auto',
          }}
          sx={{
            '&:hover': {
              backgroundColor: '#666666',
              color: '#ffffff',
            },
          }}
        >
          Seguimiento P.M 
        </Button>
      </div>
      <div style={{width:"68%", display:"flex", justifyContent:"center", marginTop:"15px"}}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleReporteActividades}
          style={{
            marginTop: '20px',
            backgroundColor: '#ffffff',
            color: '#666666',
            border: '2px solid #666666',
            borderRadius: '6px',
            width: '200px',
            margin: '0 auto',
          }}
          sx={{
            '&:hover': {
              backgroundColor: '#666666',
              color: '#ffffff',
            },
          }}
        >
          Reporte Actividades
        </Button>
      </div>
      {selectedValue === 'option1' && (
        <>
          <Semaforo globalVariable={globalVariable} />
          <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
        </>
      )}
      {selectedValue === 'option2' && (
        <>
          <SemaforoAc globalVariable={globalVariable} />
          <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
        </>
      )}
      {selectedValue === 'option4' && (
        <>
          <Crea globalVariable={globalVariable} />
          <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
        </>
      )}
      {selectedValue === 'option3' && (
        <>
          <Aac globalVariable={globalVariable} />
          <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
        </>
      )}
      {selectedValue === 'option5' && (
        <>
          <Mod globalVariable={globalVariable} />
          <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
        </>
      )}
    </>
  );
}

export default Home;
