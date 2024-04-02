import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';


const ProgramDetails = () => {
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const departamento = rowData['departamento'];
    const escuela = rowData['escuela'];
    const facultad = rowData['facultad'];
    const sede = rowData['sede'];
    const seccion = rowData['seccion']
    const faseRRC = rowData['fase rrc'];
    const faseRAC = rowData['fase rac'];
    const fechavencrac = rowData['fechavencac'];
    const fechavencrrc = rowData['fechavencrc'];
    const navigate = useNavigate();

    const [reloadSeguimiento, setReloadSeguimiento] = useState(false);

    useEffect(() => {

        const timeout = setTimeout(() => {
            setReloadSeguimiento(prevState => !prevState); 
        }, 0); 

        return () => clearTimeout(timeout); 
    }, [rowData]); 

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

    const handleBackClick = () => {
        navigate('/');
    };

    const procesosRRCStyle = {
        backgroundColor: getProcesosRRCBackground(),
        //cursor: getProcesosRRCBackground() !== 'rgb(241, 241, 241)' ? 'pointer' : 'default',
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
        backgroundColor: getProcesosRACBackground(),
        //cursor: getProcesosRRCBackground() !== 'rgb(241, 241, 241)' ? 'pointer' : 'default',
    };

    return (
        <div>
        <Header/>
        <div><button className= 'buttonreturn' onClick={handleBackClick}>Atras</button></div>
        <div className='title-program'><h2>{programaAcademico}</h2></div>
        <div className='about-program'>
        <div className='about-program'><strong>Facultad-</strong> {facultad}</div>
        <div className='about-program'><strong>Escuela- </strong> {escuela}</div>
        <div className='about-program'><strong>Sede- </strong> {sede}</div>
        <div className='about-program'><strong>Departamento-</strong> {departamento}</div>
        <div className='about-program'><strong>Sección-</strong> {seccion}</div>
        </div>
        <div className='procesos'>
            <div className='procesosCREA'> 
                <strong>CREA</strong> N/A
            </div>
            <div className='procesosRRC' style={procesosRRCStyle}>
                 <strong>RRC</strong> {fechavencrrc}   
            </div>
            <div className='procesosRAC' style={procesosRACStyle}> 
                <strong>RAAC</strong> {fechavencrac}
            </div>
            <div className='procesosAC'>
                <strong>AAC</strong> N/A
            </div>
            <div className='procesosMOD'> 
                <strong>MOD</strong> N/A
            </div>
        </div>
        <Seguimiento key={reloadSeguimiento}/>
        {/* <pre>{JSON.stringify(rowData, null, 2)}</pre> */}
        </div>
    );
};

export default ProgramDetails;
