import React from 'react';
import '/src/styles/simpleTimeline.css';
import logoCircular from '/src/assets/logocircular.png';

const SimpleTimeline = ({ fechaExpedicion, fechaVencimiento, fechasCalculadas }) => {
    const fechaExpedicionDate = fechaExpedicion ? new Date(fechaExpedicion.split('/').reverse().join('-') + 'T00:00:00') : null;
    const fechaVencimientoDate = fechaVencimiento ? new Date(fechaVencimiento.split('/').reverse().join('-') + 'T00:00:00') : null;
    const fechaActual = new Date(); 

    const fechas = [
        { label: ['Expedición'], date: fechaExpedicionDate, color: 'blue' },
        { label: ['1 Año y', '6 Meses Después'], date: fechasCalculadas ? new Date(fechasCalculadas.unAñoSeisMesesDespues.split('/').reverse().join('-') + 'T00:00:00') : null, color: 'green' },
        { label: ['6 Meses Antes', 'de la Mitad'], date: fechasCalculadas ? new Date(fechasCalculadas.seisMesesAntesMitad.split('/').reverse().join('-') + 'T00:00:00') : null, color: 'yellow' },
        { label: ['3 Años Antes', 'del Vencimiento'], date: fechasCalculadas ? new Date(fechasCalculadas.tresAñosAntes.split('/').reverse().join('-') + 'T00:00:00') : null, color: 'orange' },
        { label: ['18 Meses Antes', 'del Vencimiento'], date: fechasCalculadas ? new Date(fechasCalculadas.dieciochoMesesAntes.split('/').reverse().join('-') + 'T00:00:00') : null, color: 'red' },
        { label: ['Fecha del', 'Vencimiento'], date: fechaVencimientoDate, color: 'purple' },
    ].filter(fecha => fecha.date); 

    const totalDuration = fechaVencimientoDate && fechaExpedicionDate ? fechaVencimientoDate - fechaExpedicionDate : null;

    const getPosition = (date) => {
        return totalDuration ? ((date - fechaExpedicionDate) / totalDuration) * 100 : 0;
    };

    const getYearsArray = (startDate, endDate) => {
        const years = [];
        for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
            years.push(year);
        }
        return years;
    };

    const years = fechaExpedicionDate && fechaVencimientoDate ? getYearsArray(fechaExpedicionDate, fechaVencimientoDate) : [];

    return (
        <div className="timeline-container">
            <div className="timeline-line" />
            {years.map((year, index) => {
                const yearStart = new Date(year, 0, 1);
                return (
                    <div
                        key={index}
                        className="timeline-year"
                        style={{ left: `${getPosition(yearStart)}%` }}
                    >
                        <div className="timeline-year-label">{year}</div>
                        <div className="timeline-year-line" />
                    </div>
                );
            })}
            {fechas.map((fecha, index) => (
                <div
                    key={index}
                    className="timeline-point"
                    style={{ left: `${getPosition(fecha.date)}%`, backgroundColor: fecha.color }}
                >
                    <div className="timeline-label">
                        {fecha.label.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                        <div>{fecha.date.toLocaleDateString('es-ES')}</div>
                    </div>
                </div>
            ))}
            <div
                className="timeline-current-date"
                style={{ left: `${getPosition(fechaActual)}%` }}
            >
                <img src={logoCircular} alt="Fecha Actual" className="timeline-current-date-img" />
            </div>
        </div>
    );
};

export default SimpleTimeline;
