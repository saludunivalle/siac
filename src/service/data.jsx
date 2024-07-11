import localforage from 'localforage';
import { fetchPostGeneral } from './fetch';

// Nombres de hojas
const hojaProgramas = 'Programas';
const hojaSeguimientos = 'Seguimientos';
const hojaPermisos = 'Permisos';
const hojaProc_Fases = 'Proc_Fases';
const hojaProc_X_Prog = 'Proc_X_Prog';
const hojaProc_X_Prog_Doc = 'Proc_X_Doc'; 
const hojaProc_Fases_Doc = 'Proc_Fases_Doc'; 

// Función para crear la clave de cache
const cacheKey = (sheetName) => `sheet-data-${sheetName}`;

const fetchWithCache = async (sheetName, dataSend = {}) => {
    const cachedData = await localforage.getItem(cacheKey(sheetName));
    if (cachedData) {
      return cachedData;
    }
  
    const response = await fetchPostGeneral({
      dataSend: { ...dataSend, sheetName },
      sheetName,
      urlEndPoint: 'https://siac-server.vercel.app/',
    });
  
    if (response && response.data && Array.isArray(response.data)) {
      await localforage.setItem(cacheKey(sheetName), response.data);
      return response.data;
    } else {
      throw new Error('Error en la respuesta del servidor o datos no son un array');
    }
  };
  

const invalidateCache = async (sheetName) => {
  await localforage.removeItem(cacheKey(sheetName));
};

export const Filtro1 = async (data) => {
  try {
    const response = await fetchWithCache(hojaProgramas, data);
    if (data && data.searchTerm) {
      return response.filter((item) =>
        item['pregrado/posgrado']?.toLowerCase().includes(data.searchTerm.toLowerCase())
      );
    }
    return response;
  } catch (error) {
    console.error('Error en la solicitud en Filtro1:', error.message);
    throw error;
  }
};

export const Filtro2 = async (data) => {
  try {
    const response = await fetchWithCache(hojaProgramas, data);
    if (data && data.searchTerm) {
      return response.filter(item => 
        item['fase rrc']?.toLowerCase().includes(data.searchTerm.toLowerCase())
      );
    }
    return response;
  } catch (error) {
    console.error('Error en la solicitud en Filtro2:', error.message);
    throw error;
  }
};

export const Filtro3 = async (data) => {
  try {
    const response = await fetchWithCache(hojaProgramas, data);
    if (data && data.searchTerm) {
      return response.filter(item => 
        item['nivel de formación']?.toLowerCase().includes(data.searchTerm.toLowerCase())
      );
    }
    return response;
  } catch (error) {
    console.error('Error en la solicitud en Filtro3:', error.message);
    throw error;
  }
};

export const Filtro4 = (datos, termino_a_filtrar) => {
  try {
    if (!Array.isArray(datos)) {
      throw new Error('Los datos proporcionados no son un array');
    }
    if (!termino_a_filtrar || typeof termino_a_filtrar !== 'string') {
      throw new Error('El término de filtrado proporcionado no es válido');
    }
    return datos.filter(item => 
      item['escuela']?.toLowerCase().includes(termino_a_filtrar.toLowerCase())
    );
  } catch (error) {
    console.error('Error en el filtro:', error.message);
    throw error;
  }
};

export const Filtro5 = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {}, 
      sheetName: 'Programas', 
      urlEndPoint: 'https://siac-server.vercel.app/'
    });
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud en Filtro5:', error.message);
    throw error;
  }
};

export const Filtro6 = async (data) => {
  try {
    const response = await fetchPostGeneral({
      dataSend: data,
      sheetName: 'Programas',
      urlEndPoint: 'https://siac-server.vercel.app/'
    });
  
    if (data && data.searchTerm) {
      return response.data.filter(item => 
        item['fase rac']?.toLowerCase().includes(data.searchTerm.toLowerCase())
      );
    }
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud en Filtro6:', error.message);
    throw error;
  }
};

export const Filtro7 = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {}, 
      sheetName: 'Seguimientos', 
      urlEndPoint: 'https://siac-server.vercel.app/'
    });
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud en Filtro7:', error.message);
    throw error;
  }
};

export const sendDataToServer = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    console.log('Enviando datos:', dataSend);
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: hojaSeguimientos,
      urlEndPoint: 'https://siac-server.vercel.app/sendData',
    });
    console.log('Respuesta del servidor:', response);
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

/**
 * Filtro8
 * 
 * @param {Array} datos
 * @param {Array} terminos_a_filtrar
 * @returns {Array}
 */
export const Filtro8 = (datos, terminos_a_filtrar) => {
  try {
    if (!Array.isArray(datos)) {
      throw new Error('Los datos proporcionados no son un array');
    }
    if (!Array.isArray(terminos_a_filtrar) || terminos_a_filtrar.some(term => typeof term !== 'string')) {
      throw new Error('El término de filtrado proporcionado no es válido');
    }
    return datos.filter(item => 
      item['topic'] && terminos_a_filtrar.includes(item['topic'].toLowerCase())
    );
  } catch (error) {
    console.error('Error en el filtro:', error.message);
    return [];
  }
};

/**
 * Filtro9
 * 
 * @param {Array} datos
 * @param {String} termino_a_filtrar
 * @returns {Array}
 */
export const Filtro9 = (datos, termino_a_filtrar) => {
  try {
    if (!Array.isArray(datos)) {
      throw new Error('Los datos proporcionados no son un array');
    }
    if (!termino_a_filtrar || typeof termino_a_filtrar !== 'string') {
      throw new Error('El término de filtrado proporcionado no es válido');
    }
    return datos.filter(item => 
      item['id_programa']?.toLowerCase().includes(termino_a_filtrar.toLowerCase())
    );
  } catch (error) {
    console.error('Error en el filtro:', error.message);
    throw error;
  }
};


export const Filtro10 = async () => {
    try {
      const response = await fetchWithCache(hojaProc_Fases, {});
      return response;
    } catch (error) {
      console.error('Error en la solicitud en Filtro10:', error.message);
      throw error;
    }
  };
  
  export const Filtro21 = async () => {
    try {
      const response = await fetchWithCache(hojaProc_X_Prog_Doc, {});
      
      // Verificar si la respuesta es válida
      if (!response || typeof response !== 'object' || !response.length) {
        throw new Error('Respuesta no válida o vacía');
      }
      
      return response;
    } catch (error) {
      console.error('Error en la solicitud en Filtro21:', error.message);
      
      // Añadir más detalles sobre el error si es posible
      if (error.response) {
        console.error('Detalles del error de respuesta:', error.response.data);
      }
      
      throw new Error(`Error al obtener datos del servidor: ${error.message}`);
    }
  };
  

export const Filtro11 = async () => {
  try {
    const response = await fetchWithCache(hojaProc_X_Prog, {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const Filtro12 = async () => {
  try {
    const response = await fetchWithCache(hojaProc_Fases_Doc, {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const Filtro13 = async () => {
  try {
    const response = await fetchWithCache(hojaSeguimientos, {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const Filtro14 = async () => {
  try {
    const response = await fetchWithCache(hojaPermisos, {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const Filtro15 = async () => {
  try {
    const response = await fetchWithCache(hojaSeguimientos, {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const Filtro16 = async () => {
  try {
    const response = await fetchWithCache(hojaSeguimientos, {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const obtenerFasesProceso = async () => {
    try {
      const hoja1Response = await fetchWithCache(hojaProc_X_Prog, {});
      const hoja1Data = hoja1Response;
      const fasesOrdenadas = hoja1Data.sort((a, b) => {
        const fechaA = convertirFecha(a.fecha);
        const fechaB = convertirFecha(b.fecha);
        return fechaB - fechaA;
      });
      function convertirFecha(fechaStr) {
        const partes = fechaStr.split('/');
        const fecha = new Date(partes[2], partes[1] - 1, partes[0]);
        return fecha;
      }
      return fasesOrdenadas;
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      throw error;
    }
  };

export const sendDataToServerCrea = async (data) => {
  try {
    const dataSend = {
      insertData: [data]
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: hojaProc_X_Prog,
      urlEndPoint: 'https://siac-server.vercel.app/sendData'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache(hojaProc_X_Prog);
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
      urlEndPoint: 'https://siac-server.vercel.app/sendData'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache(hojaProc_X_Prog_Doc);
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
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
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('ESC_PRACTICA');
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
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('REL_ESC_PRACTICA');
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
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('HORARIOS_PRACT');
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
      urlEndPoint: 'https://siac-server.vercel.app/sendDocServ'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('FIRMAS');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const FiltroFirmas = async () => {
  try {
    const response = await fetchWithCache('firmas', {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
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
      urlEndPoint: 'https://siac-server.vercel.app/sendSeguimiento'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('PROGRAMAS_PM');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

export const dataSegui = async () => {
  try {
    const response = await fetchWithCache('Programas_pm', {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const dataEscuelas = async () => {
  try {
    const response = await fetchWithCache('Escuela_om', {});
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
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
      urlEndPoint: 'https://siac-server.vercel.app/sendSeguimiento'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('ESCUELAS');
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
      urlEndPoint: 'https://siac-server.vercel.app/updateSeguimiento'
    });
    if (response.status) {
      console.log('Datos actualizados correctamente en el servidor.');
      await invalidateCache('ESCUELAS');
    } else {
      console.error('Error al actualizar datos en el servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
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
    const dataSend = {
      insertData: data
    };
    const response = await fetchPostGeneral({
      dataSend,
      sheetName: 'REPORTE',
      urlEndPoint: 'https://siac-server.vercel.app/sendReport'
    });
    if (response.status) {
      console.log('Datos enviados correctamente al servidor.');
      await invalidateCache('REPORTE');
    } else {
      console.error('Error al enviar datos al servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
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
      urlEndPoint: 'https://siac-server.vercel.app/updateSeguimiento'
    });
    if (response.status) {
      console.log('Datos actualizados correctamente en el servidor.');
      await invalidateCache('PROGRAMAS_PM');
    } else {
      console.error('Error al actualizar datos en el servidor.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
  }
};

