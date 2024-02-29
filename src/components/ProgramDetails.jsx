import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '/src/assets/logovalle.png';
import '/src/styles/programDetails.css'; 

const ProgramDetails = () => {
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const departamento = rowData['departamento'];
    const escuela = rowData['escuela'];
    const facultad = rowData['facultad'];
    const sede = rowData['sede'];
    const faseRRC = rowData['fase rrc'];
    const faseRAC = rowData['fase rac'];
    const fechavencrac = rowData['fechavencac'];
    const fechavencrrc = rowData['fechavencrc'];

    const getProcesosRRCBackground = () => {
        if (faseRRC === 'Fase 1') {
            return '#4caf4f36';
        } else if (faseRRC === 'Fase 2') {
            return 'rgba(255, 235, 59, 0.288)';
        } else if (faseRRC === 'Fase 3') {
            return '#ff990079';
        } else if (faseRRC === 'Fase 4') {
            return '#ff562275';
        } else if (faseRRC === 'Fase 5') {
            return '#f443368e';
        } else {
            return 'rgb(241, 241, 241)'; 
        }
    };

    const procesosRRCStyle = {
        backgroundColor: getProcesosRRCBackground()
    };

    const getProcesosRACBackground = () => {
        if (faseRAC === 'Fase 1') {
            return '#4caf4f36';
        } else if (faseRAC === 'Fase 2') {
            return 'rgba(255, 235, 59, 0.288)';
        } else if (faseRAC === 'Fase 3') {
            return '#ff990079';
        } else if (faseRAC === 'Fase 4') {
            return '#ff562275';
        } else if (faseRAC === 'Fase 5') {
            return '#f443368e';
        } else {
            return 'rgb(241, 241, 241)'; 
        }
    };

    const procesosRACStyle = {
        backgroundColor: getProcesosRACBackground()
    };

    return (
        <div>
        <div className='logo'><img src={logo} alt="Logo" /></div>
        <div className='title-program'><h2>{programaAcademico}</h2></div>
        <div className='procesos'>
            <div className='procesosRRC' style={procesosRRCStyle}>
                 RRC <br/>
                 {faseRRC} <br/>
                {fechavencrrc}   
            </div>
            <div className='procesosRAC' style={procesosRACStyle}> 
                RAC <br/>
                {faseRAC} <br/>
                {fechavencrac}
            </div>
            <div className='procesosAC'>
                AC<br/>
                N/A
            </div>
            <div className='procesosCREA'> 
                CREA <br/>
                N/A
            </div>
            <div className='procesosMOD'> 
                MOD <br/>
                N/A
            </div>
        </div>
        <ul>  
            <li>Departamento: {departamento}</li>
            <li>Escuela: {escuela}</li>
            <li>Facultad: {facultad}</li>
            <li>Sede: {sede}</li>
        </ul> 
        {/* <pre>{JSON.stringify(rowData, null, 2)}</pre> */}
        <Link to="/">
            <button className='button-reverse'>
                REGRESAR
            </button>
        </Link>

        </div>
    );
};

export default ProgramDetails;
