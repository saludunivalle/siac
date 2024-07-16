import { fetchPostGeneral } from './fetch';

const hojaProgramas = 'Programas';
const hojaSeguimientos = 'Seguimientos';
const hojaPermisos = 'Permisos';
const hojaProc_Fases = 'Proc_Fases';
const hojaProc_X_Prog = 'Proc_X_Prog';
const hojaProc_X_Prog_Doc = 'Proc_X_Doc';
const hojaProc_Fases_Doc = 'Proc_Fases_Doc';

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
    throw error;
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
      throw new Error('Los datos proporcionados no son un array');
    }

    if (!termino_a_filtrar || typeof termino_a_filtrar !== 'string') {
      throw new Error('El término de filtrado proporcionado no es válido');
    }

    const filteredData = datos.filter(item => {
      const propiedadValue = item['id_programa'];
      return propiedadValue && propiedadValue.toLowerCase().includes(termino_a_filtrar.toLowerCase());
    });

    return filteredData;
  } catch (error) {
    console.error('Error en el filtro:', error);
    throw error;
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
    const hoja1Data = hoja1Response.data;

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
    console.error('Error en la solicitud:', error);
    throw error;
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
      //console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; 
  }
};

export const Filtro14 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Esc_Practica', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });
      //console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; 
  }
};

export const Filtro15 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Rel_Esc_Practica', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });
      //console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; 
  }
};

export const Filtro16 = async () => {
  try {
      const response = await fetchPostGeneral({
          dataSend: {}, 
          sheetName: 'Horario', 
          urlEndPoint: 'https://siac-server.vercel.app/docServ'
      });
      //console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; 
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const dataEscuelas = async () => {
  try {
    const response = await fetchPostGeneral({
      dataSend: {},
      sheetName: 'Escuela_om',
      urlEndPoint: 'https://siac-server.vercel.app/seguimiento'
    });
    return response.data;
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
      urlEndPoint: 'https://siac-server.vercel.app/sendReport',
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
