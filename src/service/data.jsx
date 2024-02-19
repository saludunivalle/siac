import { fetchPostGeneral } from './fetch';

/**
 * Filtro1
 * 
 * @param {Object} data
 * @returns {Promise<Object[]>}
 */
export const Filtro1 = async (data) => {
    try {
        const response = await fetchPostGeneral({
            dataSend: data,
            urlEndPoint: 'https://siac-5b33.vercel.app/'
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
          dataSend: data,
          urlEndPoint: 'https://siac-5b33.vercel.app/'
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
            dataSend: data,
            urlEndPoint: 'https://siac-5b33.vercel.app//'
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
export const Filtro4 = async (data) => {
    try {
        const response = await fetchPostGeneral({
            dataSend: data,
            urlEndPoint: 'https://siac-5b33.vercel.app/'
        });
  
        if (data) {
            const searchTerm = data.searchTerm; 
  
            if (searchTerm) {
                const filteredData = response.data.filter(item => {
                    const propiedadValue = item['escuela']; 
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
  