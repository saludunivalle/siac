import React from 'react';
import '/src/styles/simpleTimeline.css';
import logoCircular from '/src/assets/logocircular.png';

const parseDate = (dateString) => dateString ? new Date(dateString.split('/').reverse().join('-') + 'T00:00:00') : null;

// Componente SimpleTimeline
const SimpleTimeline = ({ fechaExpedicion, fechaVencimiento, fechasCalculadas, tipo }) => {
    const fechaExpedicionDate = parseDate(fechaExpedicion);
    const fechaVencimientoDate = parseDate(fechaVencimiento);
    const fechaActual = new Date(); 

    // Títulos y cálculos basados en el tipo (RRC o RAAC)
    const isRRC = tipo === 'RRC';
    const tipoTexto = isRRC ? 'RRC' : 'RAAC';

    const fechas = [
        { label: [`Reciben ${tipoTexto}`], date: fechaExpedicionDate, color: 'blue' },
        { label: ['Rediseño del', 'plan de mejoramiento'], date: parseDate(fechasCalculadas?.unAñoSeisMesesDespues), color: 'green' },
        { label: ['Autoevaluación para', `${tipoTexto}`], date: parseDate(fechasCalculadas?.cuatroAñosAntesVencimiento), color: 'yellow' },
        { label: ['Radicación documento', 'en DACA'], date: parseDate(fechasCalculadas?.dosAñosAntesVencimiento), color: 'orange' },
        { label: ['Radica al MEN'], date: parseDate(fechasCalculadas?.dieciochoMesesAntes), color: 'red' },
        { label: [`Renovación de ${tipoTexto}`], date: fechaVencimientoDate, color: 'purple' },
    ].filter(fecha => fecha.date);

    const totalDuration = fechaVencimientoDate && fechaExpedicionDate ? fechaVencimientoDate - fechaExpedicionDate : null;

    const getPosition = (date) => (totalDuration ? ((date - fechaExpedicionDate) / totalDuration) * 100 : 0);

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
