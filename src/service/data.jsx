import { fetchPostGeneral } from './fetch';
const hojaProgramas = 'Programas';
const hojaSeguimientos = 'Seguimientos';
const hojaPermisos = 'Permisos';
const hojaProc_Fases = 'Proc_Fases';
const hojaProc_X_Prog='Proc_X_Prog';
const hojaProc_X_Prog_Doc='Proc_X_Doc';
const hojaProc_Fases_Doc = 'Proc_Fases_Doc';




/**
 * Filtro1
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
export const Filtro1 = async (data) => {
    try {
        const response = await fetchPostGeneral({
            dataSend: { ...data, sheetName: hojaProgramas },
            urlEndPoint: 'https://siac-server.vercel.app/'
        });

        if (data) {
            const searchTerm = data.searchTerm; 

            if (searchTerm) {
                const filteredData = response.data.filter(item => {
                    const propiedadValue = item['pregrado/posgrado']; 
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

/**
 * Filtro2
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
export const Filtro2 = async (data) => {
  try {
      const response = await fetchPostGeneral({
          dataSend: { ...data },
          sheetName: 'Programas',
          urlEndPoint: 'https://siac-server.vercel.app/'
      });

      if (data) {
          const searchTerm = data.searchTerm; 

          if (searchTerm) {
              const filteredData = response.data.filter(item => {
                  const propiedadValue = item['fase rrc']; 
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


/**
 * Filtro3
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
export const Filtro3 = async (data) => {
    try {
        const response = await fetchPostGeneral({
            dataSend: { ...data, sheetName: hojaProgramas },
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
  
        if (data) {
            const searchTerm = data.searchTerm; 
  
            if (searchTerm) {
                const filteredData = response.data.filter(item => {
                    const propiedadValue = item['nivel de formación']; 
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
  
/**
 * Filtro4
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
*/
// export const Filtro4 = async (data) => {
//     try {
//         const response = await fetchPostGeneral({
//             dataSend: data,
//             urlEndPoint: 'https://siac-server.vercel.app/'
//         });
  
//         if (data) {
//             const searchTerm = data.searchTerm; 
  
//             if (searchTerm) {
//                 const filteredData = response.data.filter(item => {
//                     const propiedadValue = item['escuela']; 
//                     return propiedadValue && propiedadValue.toLowerCase().includes(searchTerm.toLowerCase());
//                 });
  
//                 return filteredData;
//             }
//         }
  
//         return response.data;
//     } catch (error) {
//         console.error('Error en la solicitud:', error);
//         throw error; 
//     }
//   };

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


export const Filtro5 = async () => {
    try {
        const response = await fetchPostGeneral({
            dataSend: {}, 
            sheetName: 'Programas', 
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};



/**
 * Filtro6
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
export const Filtro6 = async (data) => {
    try {
        const response = await fetchPostGeneral({
            dataSend: data,
            sheetName: 'Programas',
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
  
        if (data) {
            const searchTerm = data.searchTerm; 
  
            if (searchTerm) {
                const filteredData = response.data.filter(item => {
                    const propiedadValue = item['fase rac']; 
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

  /**
 * Filtro7
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
export const Filtro7 = async () => {
    try {
        const response = await fetchPostGeneral({
            dataSend: {}, 
            sheetName: 'Seguimientos', 
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
  };
  
   /**
 * Filtro8
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
  export const Filtro8 = (datos, termino_a_filtrar) => {
    try {
        if (!Array.isArray(datos)) {
            throw new Error('Los datos proporcionados no son un array');
        }

        if (!termino_a_filtrar || typeof termino_a_filtrar !== 'string') {
            throw new Error('El término de filtrado proporcionado no es válido');
        }

        const filteredData = datos.filter(item => {
            const propiedadValue = item['topic'];
            return propiedadValue && propiedadValue.toLowerCase() === termino_a_filtrar.toLowerCase();
        });

        return filteredData;
    } catch (error) {
        console.error('Error en el filtro:', error);
        throw error;
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
            insertData:[
                data
            ]
        };
        //console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: hojaSeguimientos, 
            urlEndPoint: 'https://siac-server.vercel.app/sendData', 
        });
        //console.log(response);
        if (response.status) {
            console.log('Datos enviados correctamente al servidor.');
        } else {
            console.error('Error al enviar datos al servidor.');
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
    }
};


// export const handleFileUpload = async () => {
//     const files = fileInputRef.current.files;
    
//     if(files.length > 0){
//     const formData = new FormData();

//     for(let i=0;i<files.length;i++){
//     formData.append("files", files[i])
//     }

//     try {
//         const response = await fetch("https://siac-server.vercel.app/upload",{
//             method: 'POST',
//             body: formData
//         })
//         const data = await response.json();
//         console.log("uploaded files: ", data.files);
//     } catch (error) {
//         console.log("error archivo");
//     }
//     }
// };

export const Filtro10 = async () => {
    try {
        const response = await fetchPostGeneral({
            dataSend: {}, 
            sheetName: 'Proc_Fases', 
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};

export const sendDataToServerCrea = async (data) => {
    try {
        const dataSend = {
            insertData:[
                data
            ]
        };
        //console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: hojaProc_X_Prog, 
            urlEndPoint: 'https://siac-server.vercel.app/sendData', 
        });
        //console.log(response);
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
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'PROC_X_PROG_DOCS', 
            urlEndPoint: 'https://siac-server.vercel.app/sendData', 
        });
        //console.log(response);
        if (response.status) {
            console.log('Datos enviados correctamente al servidor.');
        } else {
            console.error('Error al enviar datos al servidor.');
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
    }
};

export const Filtro11 = async () => {
    try {
        const response = await fetchPostGeneral({
            dataSend: {}, 
            sheetName: 'Proc_X_Prog', 
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        console.log("hoja de nuevo esta es",response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};

export const Filtro21 = async () => {
    try {
        const response = await fetchPostGeneral({
            dataSend: {}, 
            sheetName: hojaProc_X_Prog_Doc, 
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        console.log("hoja de nuevo esta es",response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};

export const obtenerFasesProceso = async () => {
    try {
        const hoja1Response = await fetchPostGeneral({
            dataSend: {},
            sheetName: 'Proc_X_Prog',
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        const hoja1Data = hoja1Response.data;
        //console.log("hoja 1:",hoja1Data );

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
        
        //console.log("hoja final:", fasesOrdenadas);
        
        return fasesOrdenadas
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
};

export const Filtro12 = async () => {
    try {
        const response = await fetchPostGeneral({
            dataSend: {}, 
            sheetName: 'Proc_Fases_Doc', 
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};

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
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'ESC_PRACTICA', 
            urlEndPoint: 'https://siac-server.vercel.app/sendDocServ', 
        });
        //console.log(response);
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
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'REL_ESC_PRACTICA', 
            urlEndPoint: 'https://siac-server.vercel.app/sendDocServ', 
        });
        //console.log(response);
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
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'HORARIOS_PRACT', 
            urlEndPoint: 'https://siac-server.vercel.app/sendDocServ', 
        });
        //console.log(response);
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
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'FIRMAS', 
            urlEndPoint: 'https://siac-server.vercel.app/sendDocServ', 
        });
        //console.log(response);
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
        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};


export const sendDataSegui= async (data) => {
    try {
        const dataSend = {
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'PROGRAMAS_PM', 
            urlEndPoint: 'https://siac-server.vercel.app/sendSeguimiento', 
        });
        //console.log(response);
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
        //console.log(response.data);
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
        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }
};

export const sendDataEscula= async (data) => {
    try {
        const dataSend = {
            insertData:[
                data
            ]
        };
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: 'ESCUELAS', 
            urlEndPoint: 'https://siac-server.vercel.app/sendSeguimiento', 
        });
        //console.log(response);
        if (response.status) {
            console.log('Datos enviados correctamente al servidor.');
        } else {
            console.error('Error al enviar datos al servidor.');
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
    }
};