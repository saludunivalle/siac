import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
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
  const [counts, setCounts] = useState({
    CREA: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    MOD: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    RRC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    AAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    RAAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    INT: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
  });
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
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [rowData, setRowData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);
  const [isLoading, setIsLoading] = useState(false); 
  const [selectedRow, setSelectedRow] = useState(null); 

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
      console.log("Datos filtrados por Posgrados:", filtered);
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
          //console.log("Datos de Posgrados filtrados en fetchData:", response);
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

        //console.log("Datos de programas filtrados en fetchData:", response);

        const seguimientos = await Filtro7();
        processSeguimientos(seguimientos, response);
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

  const processSeguimientos = (seguimientos, programas) => {
    const estados = {
      CREA: programas.filter(item => item['estado'] === 'En Creación').map(item => item.id_programa),
      MOD: programas.filter(item => item['mod'] === 'SI').map(item => item.id_programa),
      RRC: programas.filter(item => item['rc vigente'] === 'SI' && item['fase rrc'] !== 'N/A').map(item => item.id_programa),
      AAC: programas.filter(item => item['aac_1a'] === 'SI').map(item => item.id_programa),
      RAAC: programas.filter(item => item['ac vigente'] === 'SI' && item['fase rac'] !== 'N/A').map(item => item.id_programa),
    };

    //console.log("Estados procesados:", estados);

    const newCounts = {
      CREA: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      MOD: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      RRC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      AAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      RAAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      INT: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 }, 
    };

    Object.keys(estados).forEach((estado) => {
      const filtered = seguimientos.filter((item) => estados[estado].includes(item.id_programa));
      //console.log(`Seguimientos filtrados para ${estado}:`, filtered);

      const latestSeguimientos = {};
      filtered.forEach(item => {
        const idPrograma = item.id_programa;
        if (!latestSeguimientos[idPrograma] || new Date(item.timestamp) > new Date(latestSeguimientos[idPrograma].timestamp)) {
          latestSeguimientos[idPrograma] = item;
        }
      });

      Object.values(latestSeguimientos).forEach(item => {
        const riesgo = item.riesgo;
        if (riesgo === 'Alto') {
          newCounts[estado].Alto += 1;
        } else if (riesgo === 'Medio') {
          newCounts[estado].Medio += 1;
        } else if (riesgo === 'Bajo') {
          newCounts[estado].Bajo += 1;
        }
      });

      const sinRegistro = estados[estado].length - Object.keys(latestSeguimientos).length;
      newCounts[estado].SinRegistro += sinRegistro;
    });

    //console.log("Conteos actualizados:", newCounts);
    setCounts(newCounts);
  };

  const handleBackClick = () => {
    setProgramasVisible(true);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);
    setSelectedValue();
    setSelectedRow(null);
    setButtonsVisible(true); 
  };

  const handleRowClick = (buttonValue, globalVar, rowKey) => {
    setSelectedValue(buttonValue);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);
  
    const validRowKeys = ['CREA', 'MOD', 'RRC', 'AAC', 'RAAC'];
    if (validRowKeys.includes(rowKey)) {
      setSelectedRow(rowKey);
    } else {
      setSelectedRow(null);
    }
  
    if (buttonValue === 'option1') {
      setSemaforoVisible(true);
    } else if (buttonValue === 'option2') {
      setSemaforoAcVisible(true);
    }
    setProgramasVisible(false);
    setButtonsVisible(false); 
    setGlobalVariable(globalVar);
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
    setIsLoading(true); 
    try {
        const spreadsheetId = '1R4Ugfx43AoBjxjsEKYl7qZsAY8AfFNUN_gwcqETwgio';
        const sheetName = 'REPORTE';

        await clearSheetExceptFirstRow(spreadsheetId, sheetName);

        const reportData = await prepareReportData();
        //console.log('Datos preparados para enviar:', reportData);

        const dataToSend = reportData.map(item => [
            item.timeStamp,
            item.programaAcademico,
            item.topic,
            item.mensaje,
            item.riesgo,
            item.urlAdjunto,
            item.fase
        ]);

        await sendDataToSheetNew(dataToSend);

        downloadSheet(spreadsheetId);
        //console.log('Todos los datos han sido enviados.');
    } catch (error) {
        console.error('Error al generar reporte:', error);
    } finally {
        setIsLoading(false); 
    }
  };

  const getTitle = () => {
    switch (selectedRow) {
      case 'CREA':
        return 'Programas en Proceso de Creación';
      case 'MOD':
        return 'Programas en Proceso de Modificación';
      case 'RRC':
        return 'Programas en Proceso de Renovación Registro Calificado';
      case 'RAAC':
        return 'Programas en Proceso de Renovación Acreditación';
      case 'AAC':
        return 'Programas en Proceso de Acreditación';
      default:
        return 'Procesos de Calidad';
    }
  };

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <CircularProgress color="inherit" />
        </div>
      )}
      <Header />
      <div className='container-general' style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', paddingTop: '20px' }}>
      <div className='alltogetherGeneral' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
        <div style={{ fontSize: '25px', width: '100%', paddingBottom: '60px', display: 'flex', justifyContent: 'center' }}>
          {getTitle()}
        </div>
        <div className='alltogether'>
          <table className='buttons-table' style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                {selectedRow === null && <th>Proceso</th>}
                <th>Alto</th>
                <th>Medio</th>
                <th>Bajo</th>
                <th>Sin registro</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedRow === null ? (
                <>
                  <tr>
                    <td colSpan="6" className="section-header">Registro Calificado</td>
                  </tr>
                  <tr onClick={() => handleRowClick('option4', 'CREA', 'CREA')} className="hoverable-row">
                    <td>CREA</td>
                    <td>{counts.CREA.Alto}</td>
                    <td>{counts.CREA.Medio}</td>
                    <td>{counts.CREA.Bajo}</td>
                    <td>{counts.CREA.SinRegistro}</td>
                    <td><strong>{counts.CREA.Alto + counts.CREA.Medio + counts.CREA.Bajo + counts.CREA.SinRegistro}</strong></td>
                  </tr>
                  <tr onClick={() => handleRowClick('option5', 'MOD', 'MOD')} className="hoverable-row">
                    <td>MOD</td>
                    <td>{counts.MOD.Alto}</td>
                    <td>{counts.MOD.Medio}</td>
                    <td>{counts.MOD.Bajo}</td>
                    <td>{counts.MOD.SinRegistro}</td>
                    <td><strong>{counts.MOD.Alto + counts.MOD.Medio + counts.MOD.Bajo + counts.MOD.SinRegistro}</strong></td>
                  </tr>
                  <tr onClick={() => handleRowClick('option1', 'RRC', 'RRC')} className="hoverable-row">
                    <td>RRC</td>
                    <td>{counts.RRC.Alto}</td>
                    <td>{counts.RRC.Medio}</td>
                    <td>{counts.RRC.Bajo}</td>
                    <td>{counts.RRC.SinRegistro}</td>
                    <td><strong>{counts.RRC.Alto + counts.RRC.Medio + counts.RRC.Bajo + counts.RRC.SinRegistro}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="section-header">Acreditación de Alta Calidad</td>
                  </tr>
                  <tr onClick={() => handleRowClick('option3', 'AAC', 'AAC')} className="hoverable-row">
                    <td>AAC</td>
                    <td>{counts.AAC.Alto}</td>
                    <td>{counts.AAC.Medio}</td>
                    <td>{counts.AAC.Bajo}</td>
                    <td>{counts.AAC.SinRegistro}</td>
                    <td><strong>{counts.AAC.Alto + counts.AAC.Medio + counts.AAC.Bajo + counts.AAC.SinRegistro}</strong></td>
                  </tr>
                  <tr onClick={() => handleRowClick('option2', 'RAAC', 'RAAC')} className="hoverable-row">
                    <td>RAAC</td>
                    <td>{counts.RAAC.Alto}</td>
                    <td>{counts.RAAC.Medio}</td>
                    <td>{counts.RAAC.Bajo}</td>
                    <td>{counts.RAAC.SinRegistro}</td>
                    <td><strong>{counts.RAAC.Alto + counts.RAAC.Medio + counts.RAAC.Bajo + counts.RAAC.SinRegistro}</strong></td>
                  </tr>
                  <tr className="hoverable-row">
                    <td>INT</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td><strong>0</strong></td>
                  </tr>
                  <tr>
                    <td><strong>TOTAL</strong></td>
                    <td><strong>{counts.CREA.Alto + counts.MOD.Alto + counts.RRC.Alto + counts.AAC.Alto + counts.RAAC.Alto}</strong></td>
                    <td><strong>{counts.CREA.Medio + counts.MOD.Medio + counts.RRC.Medio + counts.AAC.Medio + counts.RAAC.Medio}</strong></td>
                    <td><strong>{counts.CREA.Bajo + counts.MOD.Bajo + counts.RRC.Bajo + counts.AAC.Bajo + counts.RAAC.Bajo}</strong></td>
                    <td><strong>{counts.CREA.SinRegistro + counts.MOD.SinRegistro + counts.RRC.SinRegistro + counts.AAC.SinRegistro + counts.RAAC.SinRegistro + counts.INT.SinRegistro}</strong></td>
                  </tr>
                </>
              ) : counts[selectedRow] ? (
                <tr>
                  <td>{counts[selectedRow].Alto}</td>
                  <td>{counts[selectedRow].Medio}</td>
                  <td>{counts[selectedRow].Bajo}</td>
                  <td>{counts[selectedRow].SinRegistro}</td>
                  <td>{counts[selectedRow].Alto + counts[selectedRow].Medio + counts[selectedRow].Bajo + counts[selectedRow].SinRegistro}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="5">No hay datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
      </div>
        {programasVisible && (
          <div style={{ width:'25%' }}>
          <div style={{ fontSize: '25px', width:'100%', display: 'flex', justifyContent:'center', marginTop:'-40px' }}>Programas</div>
          <div className='programas' onClick={handleClick} style={{  width:'100%', alignSelf: 'flex-start', marginLeft: '20px' }}>
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
          </div>
        )}
      </div>
      {buttonsVisible && ( 
        <>
          <div  style={{width:"100%", display:"flex", justifyContent:"center", marginTop: '20px', flexDirection:'row', gap:'20px' }}>
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
              }}
              sx={{
                '&:hover': {
                  backgroundColor: '#666666',
                  color: '#ffffff',
                },
              }}
            >
              Seguimiento PM 
            </Button>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/docencia-servicio')}
              style={{
                marginTop: '20px',
                backgroundColor: '#ffffff',
                color: '#666666',
                border: '2px solid #666666',
                borderRadius: '6px',
                width: '200px',
              }}
              sx={{
                '&:hover': {
                  backgroundColor: '#666666',
                  color: '#ffffff',
                },
              }}
            >
              Docencia Servicio 
            </Button>
          </div>
        </>
      )}
      {selectedValue === 'option1' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <Semaforo globalVariable={globalVariable} />
          
        </>
      )}
      {selectedValue === 'option2' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <SemaforoAc globalVariable={globalVariable} />
        </>
      )}
      {selectedValue === 'option4' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <Crea globalVariable={globalVariable} />
        </>
      )}
      {selectedValue === 'option3' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <Aac globalVariable={globalVariable} />
        </>
      )}
      {selectedValue === 'option5' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <Mod globalVariable={globalVariable} />
        </>
      )}
    </>
  );
}

export default Home;
