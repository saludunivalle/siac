import React, { useState } from 'react';
import { decodeToken } from "react-jwt";
import Cookies from 'js-cookie';
import { fetchPostGeneral } from '../service/fetch';
import { useNavigate } from 'react-router-dom';

const hojaPermisos = 'Permisos';
const hojaProgramas = 'Programas';

const GoogleLogin = ({
    setIsLogin,
    setData,
}) => {
    const navigate = useNavigate();
    const [showLoginButton, setShowLoginButton] = useState(true); // Estado para controlar la visibilidad del botón de inicio de sesión
    const [userEmail, setUserEmail] = useState(null); // Estado para almacenar el email del usuario

    const have_permision = ({ data, dataToken }) => {
        const result = data?.filter(item => item['user'] === dataToken['email']);
        return {
            "result": result.length > 0 ? true : false,
            "data": result 
        };
    };

    const handleCredentialResponse = async (response) => {
        const data_decode = decodeToken(response.credential);

        try {
            // Verificar si el usuario tiene permiso en la hoja de Permisos
            const permisosResponse = await fetchPostGeneral({
                dataSend: {},
                sheetName: hojaPermisos,
                urlEndPoint: 'https://siac-server.vercel.app/'
            });

            if (permisosResponse) {
                const resultPermisos = have_permision({
                    data: permisosResponse.data,
                    dataToken: data_decode
                });

                if (resultPermisos.result) {
                    setIsLogin(true);
                    setUserEmail(data_decode.email); // Almacenar el email del usuario
                    const expiracion = new Date();
                    expiracion.setDate(expiracion.getDate() + 5);
                    Cookies.set('token', JSON.stringify(data_decode), { expires: expiracion });
                    sessionStorage.setItem('logged', JSON.stringify(resultPermisos.data));
                    setShowLoginButton(false); 
                    return;
                }
            }

            const programasResponse = await fetchPostGeneral({
                dataSend: {},
                sheetName: hojaProgramas,
                urlEndPoint: 'https://siac-server.vercel.app/'
            });

            if (programasResponse) {
                const programasData = programasResponse.data;
                const programaPermitido = programasData.find(item => {
                    const accesosArray = item['accesos'].split(',').map(email => email.trim());
                    return accesosArray.includes(data_decode['email']);
                });
                if (programaPermitido) {
                    navigate('/program_details', { state: { ...programaPermitido, userEmail: data_decode.email } });
                    setIsLogin(true);
                    setUserEmail(data_decode.email); 
                    setShowLoginButton(false); 
                    return;
                }
            }

            alert('No tienes permiso para acceder');
            setIsLogin(false);
        } catch (error) {
            console.error('Error en la solicitud:', error);
            throw error; 
        }
    };

    const _get_auth = async () => {
        try {
            google.accounts.id.initialize({
                client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
                callback: (response) => handleCredentialResponse(response),
            });

            google.accounts.id.renderButton(
                document.getElementById("buttonDiv"),
                { theme: "outline", size: "large" , text: "login with google"}  
            );

            google.accounts.id.prompt();
        } catch (error) {
            console.log('error', error);
        }
    };

    React.useEffect(() => {
        const _root = document.getElementById('root');
        const script_id = document.getElementById('google-login');

        if (script_id) {
            _root.removeChild(script_id);
        }

        const _script = document.createElement('script');
        _script.src = 'https://accounts.google.com/gsi/client';
        _script.async = true;
        _script.id = 'google-login';
        _script.defer = true;
        _root.appendChild(_script);

        _script.onload = _get_auth;
    }, []);

    return (
        <>
            {showLoginButton && <div id="buttonDiv"></div>}
        </>
    )
};

export default GoogleLogin;
