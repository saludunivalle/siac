import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';

const ProgramDetails = () => {
    const location = useLocation();
    const rowData = location.state; 
    const { globalVariable, userEmail } = location.state; // Extrae el userEmail del estado
    const navigate = useNavigate();
    const [clickedButton, setClickedButton] = useState(null);
    const [reloadSeguimiento, setReloadSeguimiento] = useState(false);

    const {
        'programa académico': programaAcademico,
        departamento,
        escuela,
        facultad,
        sede,
        'pregrado/posgrado': formacion,
        'sección': seccion,
        'fase rrc': faseRRC,
        'fase rac': faseRAC,
        fechavencrac,
        fechavencrc,
        'titulo a conceder': titulo,
        jornada,
        modalidad,
        'créditos': creditos,
        periodicidad,
        'duración': duracion,
        accesos: isemail
    } = rowData;

    useEffect(() => {
        switch (globalVariable) {
            case 'RRC':
                setClickedButton('rrc');
                break;
            case 'RAAC':
                setClickedButton('raac');
                break;
            case 'CREA':
                setClickedButton('crea');
                break;
            case 'AAC':
                setClickedButton('aac');
                break;
            case 'MOD':
                setClickedButton('mod');
                break;
            default:
                setClickedButton(null);
                break;
        }
        setReloadSeguimiento(prevState => !prevState); 
    }, [globalVariable]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setReloadSeguimiento(prevState => !prevState); 
        }, 0); 

        return () => clearTimeout(timeout); 
    }, [rowData]);

    const handleButtonClick = (buttonType) => {
        setClickedButton(buttonType);
    };

    const getBackgroundColor = (fase, type) => {
        const colors = {
            'Fase 1': '#4caf4f36',
            'Fase 2': 'rgba(255, 235, 59, 0.288)',
            'Fase 3': '#ff990079',
            'Fase 4': '#ff562275',
            'Fase 5': '#f443368e',
        };
        return colors[fase] || 'rgb(241, 241, 241)';
    };

    const setButtonStyles = (buttonType, isClicked) => {
        let backgroundColor;
        switch (buttonType) {
            case 'raac':
                backgroundColor = isClicked ? 'rgba(163, 163, 163, 0.562)' : getBackgroundColor(faseRAC, 'RAC');
                break;
            case 'rrc':
                backgroundColor = isClicked ? 'rgba(163, 163, 163, 0.562)' : getBackgroundColor(faseRRC, 'RRC');
                break;
            default:
                backgroundColor = isClicked ? 'rgba(163, 163, 163, 0.562)' : 'rgb(241, 241, 241)';
        }
        return {
            backgroundColor,
            color: '#000',
        };
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <>
            <Header />
            <div className='containerTotal'>
                <div className='title-program'><h2>{programaAcademico}</h2></div>
                <div className='about-program-general'>
                    <div className='about-program'><strong>Facultad: </strong>&nbsp; {facultad}</div>
                    <div className='about-program'><strong>Escuela: </strong>&nbsp; {escuela}</div>
                    <div className='about-program'><strong>Sede: </strong>&nbsp; {sede}</div>
                    {departamento && <div className='about-program'><strong>Departamento: </strong>&nbsp; {departamento}</div>}
                    {seccion && <div className='about-program'><strong>Sección: </strong>&nbsp; {seccion}</div>}
                    <div className='about-program'><strong>Nivel de Formación: </strong>&nbsp; {formacion}</div>
                    <div className='about-program'><strong>Título a Conceder: </strong>&nbsp; {titulo}</div>
                    <div className='about-program'><strong>Jornada: </strong>&nbsp; {jornada}</div>
                    <div className='about-program'><strong>Modalidad: </strong>&nbsp; {modalidad}</div>
                    <div className='about-program'><strong>Créditos: </strong>&nbsp; {creditos}</div>
                    <div className='about-program'><strong>Periodicidad: </strong>&nbsp; {periodicidad}</div>
                    <div className='about-program'><strong>Duración: </strong>&nbsp; {duracion}</div>
                    <div className='about-program'><strong>Fecha RRC: </strong>&nbsp; {fechavencrc}</div>
                    <div className='about-program'><strong>Fecha RAAC: </strong>&nbsp; {fechavencrac}</div>
                </div>
                <div className='procesos'>
                    <div className='procesosCREA' style={setButtonStyles('crea', clickedButton === 'crea')} onClick={() => handleButtonClick('crea')}>
                        <strong>CREA</strong>
                    </div>
                    <div className='procesosMOD' style={setButtonStyles('mod', clickedButton === 'mod')} onClick={() => handleButtonClick('mod')}>
                        <strong>MOD</strong>
                    </div>
                    <div className='procesosRRC' style={setButtonStyles('rrc', clickedButton === 'rrc')} onClick={() => handleButtonClick('rrc')}>
                        <strong>RRC</strong>
                    </div>
                    <div className='procesosAC' style={setButtonStyles('aac', clickedButton === 'aac')} onClick={() => handleButtonClick('aac')}>
                        <strong>AAC</strong>
                    </div>
                    <div className='procesosRAC' style={setButtonStyles('raac', clickedButton === 'raac')} onClick={() => handleButtonClick('raac')}>
                        <strong>RAAC</strong>
                    </div>
                    <div className='procesosCONV' style={setButtonStyles('conv', clickedButton === 'conv')} onClick={() => handleButtonClick('conv')}>
                        <strong>Docencia Servicio</strong>
                    </div>
                    <div className='procesosSeg' style={setButtonStyles('Seg', clickedButton === 'Seg')} onClick={() => handleButtonClick('Seg')}>
                        <strong>Seguimiento PM</strong>
                    </div>
                </div>
                <Seguimiento handleButtonClick={clickedButton} key={reloadSeguimiento} />
                {!userEmail && !isemail && (
                    <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px' }}>Atrás</button>
                )}
            </div>
        </>
    );
};

export default ProgramDetails;
