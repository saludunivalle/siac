import React from 'react';
import { Box, Typography, Chip, Link, Paper, Divider } from '@mui/material';
import { AccessTime, Description, CheckCircle, Cancel, Timeline as TimelineIcon } from '@mui/icons-material';
import '/src/styles/timeline.css';

const TimelineComponent = ({ data, programaAcademico, showTitle = true }) => {
  // Normalize values - treat "N/A", empty strings, and whitespace as null
  const normalizeValue = (value) => {
    if (!value || value === 'N/A' || value === '' || value === 'NULL' || 
        (typeof value === 'string' && value.trim() === '')) {
      return null;
    }
    return typeof value === 'string' ? value.trim() : value;
  };

  // Parse date - handle both year format (YYYY) and full date format (YYYY-MM-DD)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // If it's just a year (4 digits)
    if (/^\d{4}$/.test(dateStr)) {
      return new Date(parseInt(dateStr), 0, 1);
    }
    
    // If it's a full date
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
    
    // If it's in DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    
    return new Date(dateStr);
  };

  // Calculate end date from duration if fecha_fin is not provided
  const calculateEndDate = (fechaIni, duracion) => {
    if (!fechaIni || !duracion) return null;
    
    const startDate = parseDate(fechaIni);
    if (!startDate) return null;
    
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + parseInt(duracion));
    return endDate;
  };

  // Filter and process data
  const processTimelineData = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    return rawData
      .map(item => ({
        id: item.id,
        id_programa: item.id_programa,
        proceso: normalizeValue(item.proceso),
        resolucion: normalizeValue(item.resolucion),
        fecha_ini: normalizeValue(item.fecha_ini),
        duracion: normalizeValue(item.duracion),
        url_doc: normalizeValue(item.url_doc),
        rechazado_aprobado: normalizeValue(item['rechazado/aprobado']),
        conteo_resolucion: normalizeValue(item.conteo_resolucion),
        fecha_fin: normalizeValue(item.fecha_fin)
      }))
      .filter(item => {
        // All required fields must be non-null for timeline rendering
        const hasRequiredFields = item.resolucion !== null && 
                                 item.fecha_ini !== null && 
                                 item.fecha_fin !== null && 
                                 item.duracion !== null && 
                                 item.conteo_resolucion !== null;
        
        // Validate conteo_resolucion is in valid range {0,1,2,3}
        const validConteo = item.conteo_resolucion !== null && 
                           [0, 1, 2, 3].includes(parseInt(item.conteo_resolucion));
        
        // Validate duracion is >= 0
        const validDuracion = item.duracion !== null && 
                             parseInt(item.duracion) >= 0;
        
        return hasRequiredFields && validConteo && validDuracion;
      })
      .map(item => {
        const startDate = parseDate(item.fecha_ini);
        const endDate = item.fecha_fin ? parseDate(item.fecha_fin) : calculateEndDate(item.fecha_ini, item.duracion);
        
        return {
          ...item,
          startDate,
          endDate,
          isInitial: item.conteo_resolucion === 0,
          isRejected: item.rechazado_aprobado === 'rechazado'
        };
      })
      .sort((a, b) => {
        // Sort by fecha_ini ascending
        if (a.startDate && b.startDate) {
          const dateCompare = a.startDate - b.startDate;
          if (dateCompare !== 0) return dateCompare;
        }
        // If dates are equal, sort by conteo_resolucion ascending
        return (a.conteo_resolucion || 0) - (b.conteo_resolucion || 0);
      });
  };

  const timelineData = processTimelineData(data);

  // Don't render if no valid data
  if (timelineData.length === 0) {
    return null;
  }

  const getTimelineColor = (item) => {
    if (item.isRejected) return '#f44336'; // Red for rejected
    
    // Color mapping based on conteo_resolucion
    const conteo = parseInt(item.conteo_resolucion);
    switch (conteo) {
      case 0: return '#DAA520'; // Amarillo mostaza - Acreditación primera vez
      case 1: return '#4caf50'; // Verde - Primera renovación
      case 2: return '#2196f3'; // Azul - Segunda renovación  
      case 3: return '#9c27b0'; // Morado - Tercera renovación
      default: return '#757575'; // Gris - Fallback
    }
  };

  const getTimelineIcon = (item) => {
    if (item.isRejected) return <Cancel />;
    if (item.isInitial) return <CheckCircle />;
    return <AccessTime />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatYear = (date) => {
    if (!date) return 'N/A';
    return date.getFullYear().toString();
  };

  // Calculate timeline positions for segments
  const getTimelinePosition = (date, minDate, maxDate) => {
    if (!date || !minDate || !maxDate) return 50; // Center by default
    const totalDuration = maxDate - minDate;
    return totalDuration ? 5 + ((date - minDate) / totalDuration) * 90 : 50;
  };

  // Calculate segment width based on duration
  const getSegmentWidth = (startDate, endDate, minDate, maxDate) => {
    if (!startDate || !endDate || !minDate || !maxDate) return 2;
    const totalDuration = maxDate - minDate;
    const segmentDuration = endDate - startDate;
    return totalDuration ? (segmentDuration / totalDuration) * 90 : 2;
  };

  const minDate = timelineData.length > 0 ? Math.min(...timelineData.map(item => item.startDate?.getTime() || 0)) : 0;
  const maxDate = timelineData.length > 0 ? Math.max(...timelineData.map(item => item.endDate?.getTime() || 0)) : 0;

  // Generate year markers for the timeline
  const generateYearMarkers = () => {
    if (!minDate || !maxDate) return [];
    
    const startYear = new Date(minDate).getFullYear();
    const endYear = new Date(maxDate).getFullYear();
    const years = [];
    
    // Add markers every 2-3 years depending on the range
    const step = Math.max(1, Math.ceil((endYear - startYear) / 8));
    
    for (let year = startYear; year <= endYear; year += step) {
      years.push(year);
    }
    
    // Always include the end year if it's not already included
    if (years[years.length - 1] !== endYear) {
      years.push(endYear);
    }
    
    return years;
  };

  const yearMarkers = generateYearMarkers();

  return (
    <div className="historico-timeline-container">
      <div className="historico-timeline-line" />
      
      {timelineData.map((item, index) => {
        const startYear = item.startDate ? item.startDate.getFullYear() : '';
        const endYear = item.endDate ? item.endDate.getFullYear() : '';
        const startPosition = getTimelinePosition(item.startDate, new Date(minDate), new Date(maxDate));
        const segmentWidth = getSegmentWidth(item.startDate, item.endDate, new Date(minDate), new Date(maxDate));
        
        return (
          <div
            key={item.id || index}
            className="historico-timeline-segment"
            style={{ 
              left: `${startPosition}%`,
              width: `${segmentWidth}%`,
              backgroundColor: getTimelineColor(item) 
            }}
          >
            <div className="historico-timeline-label">
              <div>{item.resolucion}</div>
              <div>{startYear} - {endYear}</div>
              {item.url_doc && (
                <a 
                  href={item.url_doc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="historico-timeline-link"
                >
                  📄
                </a>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Year markers below the timeline */}
      {yearMarkers.map((year, index) => {
        const yearDate = new Date(year, 0, 1);
        const position = getTimelinePosition(yearDate, new Date(minDate), new Date(maxDate));
        
        return (
          <div
            key={year}
            className="historico-timeline-year-marker"
            style={{ left: `${position}%` }}
          >
            {year}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineComponent;
