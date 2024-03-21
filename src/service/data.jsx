import { fetchPostGeneral } from './fetch';
const hojaProgramas = 'Programas';
const hojaSeguimientos = 'Seguimientos';
const hojaPermisos = 'Permisos';


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
        console.log(response.data);
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
export const Filtro7 = async (data) => {
    try {
        const response = await fetchPostGeneral({
            dataSend: { ...data},
            sheetName: hojaSeguimientos,
            urlEndPoint: 'https://siac-server.vercel.app/'
        });
  
        if (data) {
            const searchTerm = data.searchTerm; 
  
            if (searchTerm) {
                const filteredData = response.data.filter(item => {
                    const propiedadValue = item['id_programa']; 
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
            return propiedadValue && propiedadValue.toLowerCase().includes(termino_a_filtrar.toLowerCase());
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
            const propiedadValue = item['proceso'];
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
        console.log(dataSend, data);
        const response = await fetchPostGeneral({
            dataSend,
            sheetName: hojaSeguimientos, 
            urlEndPoint: 'https://siac-server.vercel.app/sendData', 
        });
        console.log(response);
        if (response.status) {
            console.log('Datos enviados correctamente al servidor.');
        } else {
            console.error('Error al enviar datos al servidor.');
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
    }
};
