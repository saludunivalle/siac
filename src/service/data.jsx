import { fetchPostGeneral } from './fetch';

const hojaProgramas = 'Programas';
const hojaSeguimientos = 'Seguimientos';
const hojaPermisos = 'Permisos';
const hojaProc_Fases = 'Proc_Fases';
const hojaProc_X_Prog = 'Proc_X_Prog';
const hojaProc_X_Prog_Doc = 'Proc_X_Doc';
const hojaProc_Fases_Doc = 'Proc_Fases_Doc';
const hojaHistorico = 'HISTORICO';

/**
 * Generic filter function
 * @param {string} sheetName 
 * @param {Object} data 
 * @param {string} propertyName 
 * @returns {Promise<Object[]>}
 */
const filterByProperty = async (sheetName, data, propertyName) => {
  try {
    const response = await fetchPostGeneral({
      dataSend: { ...data },
      sheetName,
      urlEndPoint: 'https://siac-server.vercel.app/'
    });

    // Validar que response exista
    if (!response) {
      console.error('Error: No se recibió respuesta del servidor');
      return [];
    }

    // Validar el status de la respuesta
    if (response.status === false) {
      console.error('Error del servidor:', response.error || 'Error desconocido');
      return [];
    }

    // Validar que response.data exista y sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', response);
      return [];
    }

    if (data) {
      const searchTerm = data.searchTerm;

      if (searchTerm) {
        const filteredData = response.data.filter(item => {
          const propiedadValue = item[propertyName];
          return propiedadValue && propiedadValue.toLowerCase().includes(searchTerm.toLowerCase());
        });
        return filteredData;
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    return []; // Retornar array vacío en caso de error
  }
};

export const Filtro1 = (data) => filterByProperty(hojaProgramas, data, 'pregrado/posgrado');
export const Filtro2 = (data) => filterByProperty(hojaProgramas, data, 'fase rrc');
export const Filtro3 = (data) => filterByProperty(hojaProgramas, data, 'nivel de formación');
export const Filtro4 = (datos, termino_a_filtrar) => {
  try {
    if (!Array.isArray(datos)) {
      throw new Error('Los datos proporcionados no son un array');
    }

    if (!termino_a_filtrar || typeof termino_a_filtrar !== 'string') {
      throw new Error('El término de filtrado proporcionado no es válido');
    }

    const filteredData = datos.filter(item => {
      const propiedadValue = item['escuela'];
      return propiedadValue && propiedadValue.toLowerCase().includes(termino_a_filtrar.toLowerCase());
    });

    return filteredData;
  } catch (error) {
    console.error('Error en el filtro:', error);
    throw error;
  }
};

export const Filtro5 = () => filterByProperty(hojaProgramas, {}, '');
export const Filtro6 = (data) => filterByProperty(hojaProgramas, data, 'fase rac');
export const Filtro7 = () => filterByProperty(hojaSeguimientos, {}, '');

export const Filtro8 = (datos, terminos_a_filtrar) => {
  try {
    if (!Array.isArray(datos)) {
      throw new Error('Los datos proporcionados no son un array');
    }

    if (!Array.isArray(terminos_a_filtrar) || terminos_a_filtrar.some(term => typeof term !== 'string')) {
      throw new Error('El término de filtrado proporcionado no es válido');
    }

    const filteredData = datos.filter(item => {
      const propiedadValue = item['topic'];
      return propiedadValue && terminos_a_filtrar.includes(propiedadValue.toLowerCase());
    });

    return filteredData;
  } catch (error) {
    console.error('Error en el filtro:', error);
    return [];
  }
};

export const Filtro9 = (datos, termino_a_filtrar) => {
  try {
    if (!Array.isArray(datos)) {
      console.warn('Filtro9: Los datos proporcionados no son un array, retornando array vacío');
      return [];
    }

    // Validar que el término de filtrado sea válido
    if (!termino_a_filtrar || 
        typeof termino_a_filtrar !== 'string' || 
        termino_a_filtrar.trim() === '' || 
        termino_a_filtrar === 'N/A') {
      console.warn('Filtro9: El término de filtrado no es válido:', termino_a_filtrar, 'retornando array vacío');
      return [];
    }

    const filteredData = datos.filter(item => {
      const propiedadValue = item['id_programa'];
      return propiedadValue && propiedadValue.toString().toLowerCase().includes(termino_a_filtrar.toLowerCase());
    });

    return filteredData;
  } catch (error) {
    console.error('Error en Filtro9:', error);
    return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const sendDataToServer = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: hojaSeguimientos,
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const sendDataToServerPrograms = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: hojaProgramas,
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const sendDataToServerHistorico = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: hojaHistorico,
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const Filtro10 = () => filterByProperty(hojaProc_Fases, {}, '');
export const sendDataToServerCrea = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: hojaProc_X_Prog,
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const sendDataToServerDoc = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'PROC_X_PROG_DOCS',
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const Filtro11 = () => filterByProperty(hojaProc_X_Prog, {}, '');
export const Filtro21 = () => filterByProperty(hojaProc_X_Prog_Doc, {}, '');

export const obtenerFasesProceso = async () => {
  try {
    const hoja1Response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'Proc_X_Prog',
      urlEndPoint: 'https://siac-server.vercel.app/'
    });

    // Validar que la respuesta sea exitosa
    if (!hoja1Response || hoja1Response.status === false) {
      console.error('Error del servidor en obtenerFasesProceso:', hoja1Response?.error || 'Error desconocido');
      return [];
    }

    // Validar que response.data exista y sea un array
    if (!hoja1Response.data || !Array.isArray(hoja1Response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', hoja1Response);
      return [];
    }

    const hoja1Data = hoja1Response.data;

    const fasesOrdenadas = hoja1Data.sort((a, b) => {
      const fechaA = convertirFecha(a.fecha);
      const fechaB = convertirFecha(b.fecha);
      return fechaB - fechaA;
    });

    function convertirFecha(fechaStr) {
      if (!fechaStr || typeof fechaStr !== 'string') return new Date(0);
      try {
        const partes = fechaStr.split('/');
        if (partes.length !== 3) return new Date(0);
        const fecha = new Date(partes[2], partes[1] - 1, partes[0]);
        return isNaN(fecha.getTime()) ? new Date(0) : fecha;
      } catch (error) {
        console.warn('Error al convertir fecha:', fechaStr, error);
        return new Date(0);
      }
    }

    return fasesOrdenadas;
  } catch (error) {
    console.error('Error en obtenerFasesProceso:', error);
    return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const Filtro12 = () => filterByProperty(hojaProc_Fases_Doc, {}, '');
export const Filtro13 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Asig_X_Prog', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });

      // Validar que la respuesta sea exitosa
      if (!response || response.status === false) {
        console.error('Error del servidor en Filtro13:', response?.error || 'Error desconocido');
        return [];
      }

      // Validar que response.data exista y sea un array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Error: La respuesta no contiene un array válido en data:', response);
        return [];
      }

      return response.data;
  } catch (error) {
      console.error('Error en Filtro13:', error);
      return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const Filtro14 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Esc_Practica', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });

      // Validar que la respuesta sea exitosa
      if (!response || response.status === false) {
        console.error('Error del servidor en Filtro14:', response?.error || 'Error desconocido');
        return [];
      }

      // Validar que response.data exista y sea un array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Error: La respuesta no contiene un array válido en data:', response);
        return [];
      }

      return response.data;
  } catch (error) {
      console.error('Error en Filtro14:', error);
      return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const Filtro15 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Rel_Esc_Practica', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });

      // Validar que la respuesta sea exitosa
      if (!response || response.status === false) {
        console.error('Error del servidor en Filtro15:', response?.error || 'Error desconocido');
        return [];
      }

      // Validar que response.data exista y sea un array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Error: La respuesta no contiene un array válido en data:', response);
        return [];
      }

      return response.data;
  } catch (error) {
      console.error('Error en Filtro15:', error);
      return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const Filtro16 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Horario', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });

      // Validar que la respuesta sea exitosa
      if (!response || response.status === false) {
        console.error('Error del servidor en Filtro16:', response?.error || 'Error desconocido');
        return [];
      }

      // Validar que response.data exista y sea un array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Error: La respuesta no contiene un array válido en data:', response);
        return [];
      }

      return response.data;
  } catch (error) {
      console.error('Error en Filtro16:', error);
      return []; // Retornar array vacío en lugar de lanzar error
  }
};


export const sendDataEscPract = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'ESC_PRACTICA',
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const sendDataRelEscPract = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'REL_ESC_PRACTICA',
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const sendDataHorariosPract = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'HORARIOS_PRACT',
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const sendDataFirma = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'FIRMAS',
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const FiltroFirmas = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'firmas',
      urlEndPoint: 'https://siac-server.vercel.app/docServ'
    });

    // Validar que la respuesta sea exitosa
    if (!response || response.status === false) {
      console.error('Error del servidor en FiltroFirmas:', response?.error || 'Error desconocido');
      return [];
    }

    // Validar que response.data exista y sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', response);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error en FiltroFirmas:', error);
    return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const sendDataSegui = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'PROGRAMAS_PM',
      urlEndPoint: 'https://siac-server.vercel.app/sendSeguimiento',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const dataSegui = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'Programas_pm',
      urlEndPoint: 'https://siac-server.vercel.app/seguimiento'
    });

    // Validar que la respuesta sea exitosa
    if (!response || response.status === false) {
      console.error('Error del servidor en dataSegui:', response?.error || 'Error desconocido');
      return [];
    }

    // Validar que response.data exista y sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', response);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error en dataSegui:', error);
    return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const dataEscuelas = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'Escuela_om',
      urlEndPoint: 'https://siac-server.vercel.app/seguimiento'
    });

    // Validar que la respuesta sea exitosa
    if (!response || response.status === false) {
      console.error('Error del servidor en dataEscuelas:', response?.error || 'Error desconocido');
      return [];
    }

    // Validar que response.data exista y sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', response);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error en dataEscuelas:', error);
    return []; // Retornar array vacío en lugar de lanzar error
  }
};

export const sendDataEscula = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'ESCUELAS',
      urlEndPoint: 'https://siac-server.vercel.app/sendSeguimiento',
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const updateDataEscuela = async (data, id) => {
  try {
    const dataSend = {
      updateData: data,
      id: id
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'ESCUELAS',
      urlEndPoint: 'https://siac-server.vercel.app/updateSeguimiento',
    });
    if (response.status) {
      console.log('Datos actualizados correctamente en el servidor.');
    } else {
      console.error('Error al actualizar datos en el servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const dataProgramas = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'Programas', // Nombre de la hoja en el backend
      urlEndPoint: 'https://siac-server.vercel.app/seguimiento' // Endpoint principal
    });

    // Validar que la respuesta sea exitosa
    if (!response || response.status === false) {
      console.error('Error del servidor en dataProgramas:', response?.error || 'Error desconocido');
      return [];
    }

    // Validar que response.data exista y sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', response);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error en dataProgramas:', error);
    return []; // Retornar array vacío en lugar de lanzar error
  }
};



export const clearSheetExceptFirstRow = async (spreadsheetId, sheetName) => {
  try {
    const response = await fetch('https://siac-server.vercel.app/clearSheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ spreadsheetId, sheetName })
    });
    if (!response.ok) {
      throw new Error('Error al limpiar la hoja');
    }
    console.log('Hoja limpiada correctamente');
  } catch (error) {
    console.error('Error al limpiar la hoja:', error);
  }
};

export const sendDataToSheetNew = async (data) => {
  try {
    const batchSize = 50; // Tamaño del lote
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const dataSend = {
        insertData: batch,
      };

      const response = await fetchPostGeneral({
        dataSend,
        sheetName: 'REPORTE',
        urlEndPoint: 'https://siac-server.vercel.app/sendReport',
      });

      if (!response.status) {
        console.error('Error al enviar lote de datos al servidor.');
        throw new Error('Error al enviar lote de datos.');
      }
    }
    console.log('Datos enviados correctamente en lotes.');
  } catch (error) {
    console.error('Error al procesar la solicitud por lotes:', error);
    throw error;
  }
};

export const updateDataSegui = async (data, id) => {
  try {
    const dataSend = {
      updateData: data,
      id: id
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'PROGRAMAS_PM',
      urlEndPoint: 'https://siac-server.vercel.app/updateSeguimiento',
    });
    if (response.status) {
      console.log('Datos actualizados correctamente en el servidor.');
    } else {
      console.error('Error al actualizar datos en el servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};


export const FiltroHistorico = () => filterByProperty(hojaHistorico, {}, '');

// Funciones para documentos de escenario y instituciones
export const FiltroInstituciones = () => filterByProperty('INFO_ESC', {}, '');

export const sendDataDocEscenario = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'ANEXOS_ESC',
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    if (response.status) {
      console.log('Documento de escenario enviado correctamente al servidor.');
    } else {
      console.error('Error al enviar documento de escenario al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const getSeguimientoPMByPrograma = async (idPrograma) => {
  try {
    console.log('Buscando datos de seguimiento PM para programa:', idPrograma);
    const response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'Programas_pm',
      urlEndPoint: 'https://siac-server.vercel.app/seguimiento'
    });
    
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error('Error: La respuesta no contiene un array válido en data:', response);
      return null;
    }

    console.log('Todos los datos de seguimiento PM:', response.data);

    // Filtrar por id_programa y obtener el registro más reciente
    const filteredData = response.data
      .filter(record => {
        const recordId = String(record.id_programa || '').trim();
        const searchId = String(idPrograma || '').trim();
        console.log('Comparando:', recordId, 'con', searchId);
        return recordId === searchId;
      })
      .sort((a, b) => {
        // Ordenar por fecha descendente si existe, sino por ID
        if (a.fecha && b.fecha) {
          const fechaA = new Date(a.fecha.split('/').reverse().join('-'));
          const fechaB = new Date(b.fecha.split('/').reverse().join('-'));
          return fechaB - fechaA;
        }
        return (b.id || 0) - (a.id || 0);
      });

    console.log('Datos filtrados para programa', idPrograma, ':', filteredData);
    return filteredData.length > 0 ? filteredData[0] : null;
  } catch (error) {
    console.error('Error al obtener datos de seguimiento PM:', error);
    return null;
  }
};