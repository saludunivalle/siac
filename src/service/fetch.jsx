const 
methodPut = 'PUT',
methodPost = 'POST',
methodGet = 'GET';

/**
 *  General Estruture HTTP REQUEST POST
 * 
 * @param {*} param0 
 * @returns 
 */
export const fetchPostGeneral = ({
    dataSend,
    sheetName,
    urlEndPoint
}) =>
{
    const requestData = {
        ...dataSend,
        sheetName: sheetName
    };

    return fetchGeneral({
        dataSend: requestData,
        urlEndPoint: urlEndPoint,
        type: methodPost     
    })
}

/**
 * General Structure HTTP REQUEST PUT
 * 
 * @param {*} param0 
 * @returns 
 */
export const fetchPutGeneral = ({
    dataSend,
    urlEndPoint
}) => {
    return fetchGeneral({
        dataSend: dataSend,
        urlEndPoint: urlEndPoint,
        type: methodPut    
    })
};

/**
 * General Structure HTTP REQUEST PUT
 * 
 * @param {*} param0 
 * @returns 
 */
export const fetchGetGeneral = ({
    dataSend,
    urlEndPoint
}) => {
    return fetchGeneral({
        dataSend: dataSend,
        urlEndPoint: urlEndPoint,
        type: methodGet  
    })
}

/**
 * General Structure HTTP REQUEST
 * 
 * @param {*} param0 
 * @returns 
 */
const fetchGeneral = async ({
    dataSend,
    urlEndPoint,
    type
}) => {
    try {
        const { sheetName, ...requestData } = dataSend;
        const requestBody = sheetName ? { ...requestData, sheetName } : requestData;

        console.log(`fetchGeneral: Enviando solicitud ${type} a ${urlEndPoint}`, {
            sheetName,
            requestBody: JSON.stringify(requestBody)
        });

        // Agregar timeout a la solicitud
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

        const response = await fetch(urlEndPoint, {
            method: type,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`fetchGeneral: Respuesta recibida - Status: ${response.status}, OK: ${response.ok}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`fetchGeneral: Error HTTP ${response.status}:`, errorText);
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log('fetchGeneral: Datos de respuesta procesados:', responseData);
        
        return responseData;
    } catch (error) {
        // Manejar diferentes tipos de errores
        if (error.name === 'AbortError') {
            console.error('fetchGeneral: Timeout de la solicitud (30s)');
            throw new Error('Timeout de la solicitud - El servidor no respondió en 30 segundos');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('fetchGeneral: Error de red - verificar conectividad');
            throw new Error('Error de red - Verificar conexión a internet y URL del servidor');
        } else if (error.message.includes('Failed to fetch')) {
            console.error('fetchGeneral: Error de fetch - posible problema de CORS o servidor no disponible');
            throw new Error('Error de fetch - Servidor no disponible o problema de CORS');
        }
        
        console.error('fetchGeneral: Error en la solicitud:', {
            error: error.message,
            urlEndPoint,
            type,
            dataSend
        });
        throw error;
    }
};