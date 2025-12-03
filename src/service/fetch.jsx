const 
methodPut = 'PUT',
methodPost = 'POST',
methodGet = 'GET';

// ============================================
// SISTEMA DE CACHÉ MEJORADO
// ============================================

// Sistema de caché para reducir solicitudes a la API
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos para datos normales
const CACHE_DURATION_LONG = 30 * 60 * 1000; // 30 minutos para datos que cambian menos frecuentemente

// Sistema de deduplicación - evita solicitudes duplicadas simultáneas
const pendingRequests = new Map();

// Rate limiting - controla solicitudes por minuto
const requestQueue = [];
const MAX_REQUESTS_PER_MINUTE = 50; // Dejar margen del límite de 60
const REQUEST_INTERVAL = 1200; // 1.2 segundos entre solicitudes (50 por minuto)
let lastRequestTime = 0;
let isProcessingQueue = false;

// Estado de carga global
let loadingCount = 0;
const loadingListeners = new Set();

// Endpoints que deben usar caché de larga duración
const LONG_CACHE_ENDPOINTS = [
    'https://siac-server.vercel.app/',
    'https://siac-server.vercel.app/seguimiento',
    'https://siac-server.vercel.app/docServ'
];

// Endpoints que NO deben usar caché (escritura de datos)
const NO_CACHE_ENDPOINTS = [
    'https://siac-server.vercel.app/sendData',
    'https://siac-server.vercel.app/updateData',
    'https://siac-server.vercel.app/sendSeguimiento',
    'https://siac-server.vercel.app/updateSeguimiento',
    'https://siac-server.vercel.app/sendDocServ',
    'https://siac-server.vercel.app/sendReport',
    'https://siac-server.vercel.app/clearSheet',
    'https://siac-server.vercel.app/upload'
];

// ============================================
// FUNCIONES DE ESTADO DE CARGA GLOBAL
// ============================================

/**
 * Notifica a los listeners del cambio de estado de carga
 */
const notifyLoadingChange = () => {
    const isLoading = loadingCount > 0;
    loadingListeners.forEach(listener => listener(isLoading, loadingCount));
};

/**
 * Suscribirse a cambios de estado de carga
 * @param {Function} callback - función que recibe (isLoading, count)
 * @returns {Function} función para desuscribirse
 */
export const subscribeToLoading = (callback) => {
    loadingListeners.add(callback);
    // Notificar estado actual inmediatamente
    callback(loadingCount > 0, loadingCount);
    return () => loadingListeners.delete(callback);
};

/**
 * Obtiene el estado actual de carga
 */
export const getLoadingState = () => ({
    isLoading: loadingCount > 0,
    count: loadingCount
});

// ============================================
// FUNCIONES DE CACHÉ
// ============================================

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
        const hasWriteOperation = requestBody && (
            requestBody.insertData !== undefined || 
            requestBody.updateData !== undefined
        );
        
        if (hasWriteOperation || NO_CACHE_ENDPOINTS.some(endpoint => urlEndPoint.includes(endpoint))) {
            return false;
        }
    }
    
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
    
    console.log(`📦 Caché HIT: ${cacheKey.substring(0, 50)}...`);
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
    
    console.log(`💾 Caché SET: ${cacheKey.substring(0, 50)}... (expira en ${duration/60000} min)`);
    
    // Limpiar entradas expiradas periódicamente
    if (cache.size > 50) {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now > value.expiresAt) {
                cache.delete(key);
            }
        }
    }
};

/**
 * Limpia el caché
 */
export const clearCache = (pattern = null) => {
    if (pattern) {
        let count = 0;
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
                count++;
            }
        }
        console.log(`🧹 Caché limpiado: ${count} entradas para patrón "${pattern}"`);
    } else {
        const size = cache.size;
        cache.clear();
        console.log(`🧹 Caché completamente limpiado: ${size} entradas`);
    }
};

/**
 * Obtiene estadísticas del caché
 */
export const getCacheStats = () => {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    for (const [, value] of cache.entries()) {
        if (now > value.expiresAt) {
            expired++;
        } else {
            active++;
        }
    }
    
    return {
        total: cache.size,
        active,
        expired,
        pendingRequests: pendingRequests.size
    };
};

// ============================================
// RATE LIMITING Y COLA DE SOLICITUDES
// ============================================

/**
 * Espera el tiempo necesario para respetar el rate limit
 */
const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_INTERVAL) {
        const waitTime = REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`⏳ Rate limit: esperando ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
};

// ============================================
// FUNCIONES DE FETCH
// ============================================

/**
 * General Structure HTTP REQUEST POST
 */
export const fetchPostGeneral = ({
    dataSend,
    sheetName,
    urlEndPoint
}) => {
    const requestData = {
        ...dataSend,
        sheetName: sheetName
    };

    return fetchGeneral({
        dataSend: requestData,
        urlEndPoint: urlEndPoint,
        type: methodPost     
    });
};

/**
 * General Structure HTTP REQUEST PUT
 */
export const fetchPutGeneral = ({
    dataSend,
    urlEndPoint
}) => {
    return fetchGeneral({
        dataSend: dataSend,
        urlEndPoint: urlEndPoint,
        type: methodPut    
    });
};

/**
 * General Structure HTTP REQUEST GET
 */
export const fetchGetGeneral = ({
    dataSend,
    urlEndPoint
}) => {
    return fetchGeneral({
        dataSend: dataSend,
        urlEndPoint: urlEndPoint,
        type: methodGet  
    });
};

/**
 * General Structure HTTP REQUEST con caché, rate limiting y deduplicación
 */
const fetchGeneral = async ({
    dataSend,
    urlEndPoint,
    type
}) => {
    const { sheetName, ...requestData } = dataSend;
    const requestBody = sheetName ? { ...requestData, sheetName } : requestData;

    // Verificar caché antes de hacer la solicitud
    const useCache = shouldUseCache(urlEndPoint, type, requestBody);
    const cacheKey = useCache ? generateCacheKey(urlEndPoint, type, requestBody) : null;
    
    // 1. Verificar caché
    if (useCache && cacheKey) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData !== null) {
            return cachedData;
        }
    }

    // 2. Verificar si ya hay una solicitud pendiente para esta misma clave
    if (useCache && cacheKey && pendingRequests.has(cacheKey)) {
        console.log(`🔄 Esperando solicitud pendiente: ${sheetName || urlEndPoint}`);
        return pendingRequests.get(cacheKey);
    }

    // 3. Crear la promesa de la solicitud
    const requestPromise = executeRequest(urlEndPoint, type, requestBody, cacheKey, useCache, sheetName);
    
    // 4. Registrar la solicitud pendiente
    if (useCache && cacheKey) {
        pendingRequests.set(cacheKey, requestPromise);
        
        // Limpiar la solicitud pendiente cuando termine
        requestPromise.finally(() => {
            pendingRequests.delete(cacheKey);
        });
    }

    return requestPromise;
};

/**
 * Ejecuta la solicitud HTTP real con rate limiting
 */
const executeRequest = async (urlEndPoint, type, requestBody, cacheKey, useCache, sheetName) => {
    try {
        // Incrementar contador de carga
        loadingCount++;
        notifyLoadingChange();

        // Aplicar rate limiting
        await waitForRateLimit();

        console.log(`🌐 Solicitud ${type}: ${sheetName || urlEndPoint}`);

        // Agregar timeout a la solicitud
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(urlEndPoint, {
            method: type,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error HTTP ${response.status}: ${sheetName || urlEndPoint}`);
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log(`✅ Respuesta OK: ${sheetName || urlEndPoint}`);
        
        // Almacenar en caché si es una solicitud de lectura exitosa
        if (useCache && cacheKey && response.ok) {
            setCache(cacheKey, responseData, urlEndPoint);
        }
        
        return responseData;
    } catch (error) {
        // Manejar diferentes tipos de errores
        if (error.name === 'AbortError') {
            console.error('⏱️ Timeout de la solicitud (30s)');
            throw new Error('Timeout de la solicitud - El servidor no respondió en 30 segundos');
        } else if (error.message.includes('Quota exceeded')) {
            console.error('🚫 Cuota de Google Sheets excedida');
            // Intentar retornar del caché aunque esté expirado
            if (cacheKey) {
                const cached = cache.get(cacheKey);
                if (cached) {
                    console.log('📦 Usando caché expirado debido a límite de cuota');
                    return cached.data;
                }
            }
            throw new Error('Límite de solicitudes excedido. Por favor espera un minuto.');
        }
        
        console.error(`❌ Error en solicitud: ${error.message}`);
        throw error;
    } finally {
        // Decrementar contador de carga
        loadingCount--;
        notifyLoadingChange();
    }
};

// ============================================
// PRE-CARGA DE DATOS CRÍTICOS
// ============================================

/**
 * Pre-carga datos comunes para evitar múltiples solicitudes
 * Llamar esto al inicio de la aplicación
 */
export const preloadCommonData = async () => {
    console.log('🚀 Iniciando pre-carga de datos...');
    
    const commonSheets = [
        'Programas',
        'Seguimientos',
        'Permisos',
        'Proc_Fases',
        'Proc_X_Prog'
    ];

    // Cargar secuencialmente para evitar límites de cuota
    for (const sheetName of commonSheets) {
        try {
            // Verificar si ya está en caché
            const cacheKey = generateCacheKey('https://siac-server.vercel.app/', methodPost, { sheetName });
            if (getFromCache(cacheKey)) {
                console.log(`📦 ${sheetName} ya en caché`);
                continue;
            }

            await fetchPostGeneral({
                dataSend: {},
                sheetName,
                urlEndPoint: 'https://siac-server.vercel.app/'
            });
            
            console.log(`✅ Pre-cargado: ${sheetName}`);
            
            // Pequeña pausa entre solicitudes
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Error pre-cargando ${sheetName}:`, error.message);
        }
    }
    
    console.log('🏁 Pre-carga completada');
};
