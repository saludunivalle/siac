const 
methodPut = 'PUT',
methodPost = 'POST',
methodGet = 'GET';

// Sistema de caché para reducir solicitudes a la API
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
const CACHE_DURATION_LONG = 10 * 60 * 1000; // 10 minutos para datos que cambian menos frecuentemente

// Endpoints que deben usar caché de larga duración
const LONG_CACHE_ENDPOINTS = [
    'https://siac-server.vercel.app/',
    'https://siac-server.vercel.app/seguimiento'
];

// Endpoints que NO deben usar caché (escritura de datos)
const NO_CACHE_ENDPOINTS = [
    'https://siac-server.vercel.app/sendData',
    'https://siac-server.vercel.app/updateData',
    'https://siac-server.vercel.app/sendSeguimiento',
    'https://siac-server.vercel.app/updateSeguimiento',
    'https://siac-server.vercel.app/sendDocServ',
    'https://siac-server.vercel.app/sendReport',
    'https://siac-server.vercel.app/clearSheet'
];

/**
 * Genera una clave única para el caché basada en la solicitud
 */
const generateCacheKey = (urlEndPoint, type, requestBody) => {
    const bodyStr = JSON.stringify(requestBody);
    return `${type}:${urlEndPoint}:${bodyStr}`;
};

/**
 * Verifica si una solicitud debe usar caché
 */
const shouldUseCache = (urlEndPoint, type, requestBody) => {
    // No usar caché para operaciones PUT
    if (type === methodPut) {
        return false;
    }
    
    // Para POST, verificar si es un endpoint de escritura
    if (type === methodPost) {
        // Verificar si es un endpoint de escritura (tiene insertData o updateData)
        const hasWriteOperation = requestBody && (
            requestBody.insertData !== undefined || 
            requestBody.updateData !== undefined
        );
        
        // Si tiene operación de escritura O está en la lista de no caché, no usar caché
        if (hasWriteOperation || NO_CACHE_ENDPOINTS.some(endpoint => urlEndPoint.includes(endpoint))) {
            return false;
        }
    }
    
    // Para GET y POST de lectura, usar caché
    return true;
};

/**
 * Obtiene datos del caché si están disponibles y no han expirado
 */
const getFromCache = (cacheKey) => {
    const cached = cache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiresAt) {
        cache.delete(cacheKey);
        return null;
    }
    
    console.log('fetchGeneral: Datos obtenidos del caché');
    return cached.data;
};

/**
 * Almacena datos en el caché
 */
const setCache = (cacheKey, data, urlEndPoint) => {
    const isLongCache = LONG_CACHE_ENDPOINTS.some(endpoint => urlEndPoint.includes(endpoint));
    const duration = isLongCache ? CACHE_DURATION_LONG : CACHE_DURATION;
    
    cache.set(cacheKey, {
        data: data,
        expiresAt: Date.now() + duration
    });
    
    // Limpiar entradas expiradas periódicamente
    if (cache.size > 100) {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now > value.expiresAt) {
                cache.delete(key);
            }
        }
    }
};

/**
 * Limpia el caché (útil para invalidar después de operaciones de escritura)
 */
export const clearCache = (pattern = null) => {
    if (pattern) {
        // Limpiar solo entradas que coincidan con el patrón
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
        console.log(`Caché limpiado para patrón: ${pattern}`);
    } else {
        cache.clear();
        console.log('Caché completamente limpiado');
    }
};

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

        // Verificar caché antes de hacer la solicitud
        const useCache = shouldUseCache(urlEndPoint, type, requestBody);
        const cacheKey = useCache ? generateCacheKey(urlEndPoint, type, requestBody) : null;
        
        if (useCache && cacheKey) {
            const cachedData = getFromCache(cacheKey);
            if (cachedData !== null) {
                return cachedData;
            }
        }

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
        
        // Almacenar en caché si es una solicitud de lectura exitosa
        if (useCache && cacheKey && response.ok) {
            setCache(cacheKey, responseData, urlEndPoint);
        }
        
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