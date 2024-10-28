import React, { useState, useEffect, useCallback } from 'react';
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
  const [expiryCounts, setExpiryCounts] = useState({
    RRC: { oneYear: 0, twoYears: 0, threeYears: 0 },
    AAC: { oneYear: 0, twoYears: 0, threeYears: 0 },
  });
  const [expiryPrograms, setExpiryPrograms] = useState({
    RRC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
    AAC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
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
  const [programasVisible, setProgramasVisible] = useState(true);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [rowData, setRowData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);
  const [isLoading, setIsLoading] = useState(false); 
  const [selectedRow, setSelectedRow] = useState(null); 
  const [expiredRRCCount, setExpiredRRCCount] = useState(0);
  const [expiredRACCount, setExpiredRACCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
      if (sessionStorage.getItem('logged')) {
          const res = JSON.parse(sessionStorage.getItem('logged'));
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
              } else {
                  response = await Filtro5();
              }

              if (!response) {
                  throw new Error("response is undefined");
              }

              // Contar y setear los programas en base a su estado
              setActivosCount(response.filter(item => item['estado'] === 'Activo').length);
              setActivoSedesCount(response.filter(item => item['estado'] === 'Activo - Sede').length);
              setCreacionCount(response.filter(item => item['estado'] === 'En Creación').length);
              setCreacionSedesCount(response.filter(item => item['estado'] === 'En Creación - Sede' || item['estado'] === 'En Creación*').length);
              setOtrosCount(response.filter(item => item['estado'] === 'Negación RC').length);
              setInactivosCount(response.filter(item => item['estado'] === 'Inactivo' || item['estado'] === 'Inactivo - Sede' || item['estado'] === 'Inactivo - Vencido RC' || item['estado'] === 'Desistido' || item['estado'] === 'Rechazado' || item['estado'] === 'Desistido Interno' || item['estado'] === 'Desistido Interno - Sede' || item['estado'] === 'Desistido MEN' || item['estado'] === 'Desistido MEN - Sede').length);
              setAacCount(response.filter(item => item['aac_1a'] === 'SI').length);
              setRrcCount(response.filter(item => item['rc vigente'] === 'SI' && item['fase rrc'] !== 'N/A').length);
              setRaacCount(response.filter(item => item['ac vigente'] === 'SI' && item['fase rac'] !== 'N/A').length);
              setModCount(response.filter(item => item['mod'] === 'SI').length);
              setRowData(response);
              setFilteredData(response);

              // Obtener los programas vencidos utilizando las nuevas funciones
              const expiredRRCPrograms = getExpiredRRCPrograms(response);
              const expiredRACPrograms = getExpiredRACPrograms(response);

              console.log('Programas RRC vencidos:', expiredRRCPrograms);
              console.log('Programas RAC vencidos:', expiredRACPrograms);

              // Actualizar el estado con los programas vencidos
              setExpiryPrograms(prevState => ({
                  ...prevState,
                  RRC: { ...prevState.RRC, expired: expiredRRCPrograms },
                  AAC: { ...prevState.AAC, expired: expiredRACPrograms }
              }));

              // Conteo para visualización (si quieres mantener los contadores)
              setExpiredRRCCount(expiredRRCPrograms.length);
              setExpiredRACCount(expiredRACPrograms.length);

              const seguimientos = await Filtro7();
              processSeguimientos(seguimientos, response);
              countExpiringPrograms(response);
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

  const countExpiringPrograms = (programas) => {
    const currentYear = new Date().getFullYear();
    const counts = {
      RRC: { oneYear: 0, twoYears: 0, threeYears: 0 },
      AAC: { oneYear: 0, twoYears: 0, threeYears: 0 },
    };
  
    const expiringPrograms = {
      RRC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
      AAC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
    };
  
    programas.forEach(program => {
      const rrcYear = program['fechavencrc'] ? parseInt(program['fechavencrc'].split('/')[2]) : null;
      const aacYear = program['fechavencac'] ? parseInt(program['fechavencac'].split('/')[2]) : null;
  
      // Para programas RRC
      if (rrcYear) {
        if (rrcYear === currentYear + 1) {
          counts.RRC.oneYear++;
          expiringPrograms.RRC.oneYear.push(program);
        } else if (rrcYear === currentYear + 2) {
          counts.RRC.twoYears++;
          expiringPrograms.RRC.twoYears.push(program);
        } else if (rrcYear === currentYear + 3) {
          counts.RRC.threeYears++;
          expiringPrograms.RRC.threeYears.push(program);
        } else if (rrcYear < currentYear) {
          expiringPrograms.RRC.expired.push(program); // Agregar programas vencidos
        }
      }
  
      // Para programas AAC
      if (aacYear) {
        if (aacYear === currentYear + 1) {
          counts.AAC.oneYear++;
          expiringPrograms.AAC.oneYear.push(program);
        } else if (aacYear === currentYear + 2) {
          counts.AAC.twoYears++;
          expiringPrograms.AAC.twoYears.push(program);
        } else if (aacYear === currentYear + 3) {
          counts.AAC.threeYears++;
          expiringPrograms.AAC.threeYears.push(program);
        } else if (aacYear < currentYear) {
          expiringPrograms.AAC.expired.push(program); 
        }
      }
    });
  
    console.log('Expiring programs:', expiringPrograms); 
    setExpiryCounts(counts);
    setExpiryPrograms(expiringPrograms);
  };  

  const getExpiredRRCPrograms = (programas) => {
      return programas.filter((program) => program['fase rrc'] === 'Vencido');
  };

  const getExpiredRACPrograms = (programas) => {
      return programas.filter((program) => program['fase rac'] === 'Vencido');
  };

  
  const processSeguimientos = useCallback((seguimientos, programas) => {
    if (!seguimientos || !Array.isArray(seguimientos)) {
        console.error('Seguimientos is undefined or not an array');
        return;
    }

    const estados = {
        CREA: programas.filter(item => item['estado'] === 'En Creación').map(item => item.id_programa),
        MOD: programas.filter(item => item['mod'] === 'SI').map(item => item.id_programa),
        RRC: programas.filter(item => item['rc vigente'] === 'SI' && item['fase rrc'] !== 'N/A').map(item => item.id_programa),
        AAC: programas.filter(item => item['aac_1a'] === 'SI').map(item => item.id_programa),
        RAAC: programas.filter(item => item['ac vigente'] === 'SI' && item['fase rac'] !== 'N/A').map(item => item.id_programa),
    };

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

    setCounts(newCounts);
}, []);

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

  const handleExpiryClick = () => {
    navigate('/programas-venc', { state: { expiryPrograms } });
    console.log('Expiry Programs:', expiryPrograms);
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

  const GeneralProcessTable = ({ counts, handleRowClick }) => (
      <div className='alltogetherGeneral' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop:'30px'}}>
        <div style={{ fontSize: '25px', width: '100%', paddingBottom: '60px', display: 'flex', justifyContent: 'center' }}>
                  {getTitle()}
       </div>
        <div className='alltogether'>
          <table className='buttons-table' style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Proceso</th>
                <th>Alto</th>
                <th>Medio</th>
                <th>Bajo</th>
                <th>Sin registro</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
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
                <td colSpan="6" className="section-header">Acreditación en Alta Calidad</td>
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
            </tbody>
          </table>
        </div>
      </div>
  );

  const DetailedProcessTable = ({ counts, selectedRow }) => (
    <div className='detailed-container' style={{ display: 'flex', flexDirection: 'column', width: '100%' }}> 
      <div style={{
        width: '100vw', 
        paddingTop: '20px',
        paddingBottom: '0px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: '25px', textAlign: 'center' }}>
          {getTitle()}
        </div>
      </div>
  
      <div className='detailed-table-wrapper' style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', paddingRight: '50px', boxSizing: 'border-box', paddingTop: '20px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'right' }}>
          <h3 style={{ marginBottom: '5px' }}>Nivel de Riesgo</h3>
          <table className='buttons-table' style={{ marginTop: '5px', width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr>
                <th>Alto</th>
                <th>Medio</th>
                <th>Bajo</th>
                <th>Sin registro</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {counts[selectedRow] ? (
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
    </div>
  );

  
  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <CircularProgress color="inherit" />
        </div>
      )}
      <Header />
      <div className='container-general' style={{ display: 'flex', justifyContent: selectedRow ? 'flex-end' : 'center', alignItems: selectedRow ? 'flex-end' : 'flex-start', width: '100%', paddingTop: '20px' }}>
        <div className='alltogether' >
          <div>
            {selectedRow === null ? (
              <GeneralProcessTable counts={counts} handleRowClick={handleRowClick} />
            ) : (
              <DetailedProcessTable counts={counts} selectedRow={selectedRow} />
            )}
          </div>
        </div>

        {programasVisible && (
          <div style={{ width:'25%' }}>
          <div style={{ fontSize: '25px', width:'100%', display: 'flex', justifyContent:'center', marginTop:'-40px' }}>Programas</div>
          <div className='programas' onClick={handleClick} style={{  width:'100%', alignSelf: 'flex-start', marginLeft: '20px' }}>
            <table>
              <thead>
                <tr></tr>
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
          <div className='new-table' style={{ width:'100%', alignSelf: 'flex-start', marginLeft: '20px', marginTop: '20px' }}>
            <div style={{ fontSize: '25px', width:'100%', display: 'flex', justifyContent:'center', marginTop:'-20px' }}>Próximos a vencerse</div>
            <table className='buttons-table' style={{ marginTop: '5px' }}>
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>1 año</th>
                  <th>2 años</th>
                  <th>3 años</th>
                  <th>Vencidos</th> 
                </tr>
              </thead>
              <tbody>
                <tr onClick={handleExpiryClick}>
                  <td>RRC</td>
                  <td>{expiryCounts.RRC.oneYear}</td>
                  <td>{expiryCounts.RRC.twoYears}</td>
                  <td>{expiryCounts.RRC.threeYears}</td>
                  <td>{expiredRRCCount}</td> 
                </tr>
                <tr onClick={handleExpiryClick}>
                  <td>AAC</td>
                  <td>{expiryCounts.AAC.oneYear}</td>
                  <td>{expiryCounts.AAC.twoYears}</td>
                  <td>{expiryCounts.AAC.threeYears}</td>
                  <td>{expiredRACCount}</td> 
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
            {(isCargo.includes('Creación') || isCargo.includes('Sistemas')) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/creacion-programa')}
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
                Creación
              </Button>
            )}
          </div>
        </>
      )}
      {selectedValue === 'option1' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <h3 style={{ textAlign: 'start', marginTop: '40px', marginLeft:'20px'}}>Trazabillidad del Proceso</h3>
          <Semaforo globalVariable={globalVariable} />
          
        </>
      )}
      {selectedValue === 'option2' && (
        <>
          <button onClick={handleBackClick} className="back-button-bottom">Atrás</button>
          <h3 style={{ textAlign: 'start', marginTop: '40px', marginLeft:'20px' }}>Trazabillidad del Proceso</h3>
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
