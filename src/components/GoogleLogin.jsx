/* global google */
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';
import { fetchPostGeneral } from '../service/fetch';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const hojaPermisos = 'Permisos';
const hojaProgramas = 'Programas';

const GoogleLogin = ({ setIsLogin }) => {
    const navigate = useNavigate();
    const [showLoginButton, setShowLoginButton] = useState(true);

    const handleCredentialResponse = useCallback(async (response) => {
        const data_decode = decodeToken(response.credential);
        try {
            // Verify permission in the "Permisos" sheet
            const permisosResponse = await fetchPostGeneral({
                dataSend: {},
                sheetName: hojaPermisos,
                urlEndPoint: 'https://siac-server.vercel.app/'
            });

            if (permisosResponse) {
                // Inline have_permision to avoid extra dependencies
                const resultPermisos = (() => {
                    const result = permisosResponse.data?.filter(item => item['user'] === data_decode.email);
                    return {
                        result: result.length > 0,
                        data: result
                    };
                })();

                if (resultPermisos.result) {
                    setIsLogin(true);
                    const expiracion = new Date();
                    expiracion.setDate(expiracion.getDate() + 5);
                    Cookies.set('token', JSON.stringify(data_decode), { expires: expiracion });
                    sessionStorage.setItem('logged', JSON.stringify(resultPermisos.data));
                    setShowLoginButton(false);
                    return;
                }
            }

            // Verify permission in the "Programas" sheet
            const programasResponse = await fetchPostGeneral({
                dataSend: {},
                sheetName: hojaProgramas,
                urlEndPoint: 'https://siac-server.vercel.app/'
            });
            if (programasResponse) {
                const programasData = programasResponse.data;
                const programaPermitido = programasData.find(item => {
                    const accesosArray = item['accesos'].split(',').map(email => email.trim());
                    return accesosArray.includes(data_decode.email);
                });
                if (programaPermitido) {
                    // Passing email in navigation state if needed
                    navigate('/program_details', { state: { ...programaPermitido, userEmail: data_decode.email } });
                    setIsLogin(true);
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
    }, [setIsLogin, navigate]);

    const _get_auth = useCallback(async () => {
        try {
            google.accounts.id.initialize({
                client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
                callback: handleCredentialResponse,
            });
            google.accounts.id.renderButton(
                document.getElementById("buttonDiv"),
                { theme: "outline", size: "large", text: "signin_with" }
            );
            google.accounts.id.prompt();
        } catch (error) {
            console.log('error', error);
        }
    }, [handleCredentialResponse]);

    const handleLogout = async () => {
        try {
            await axios.post('https://siac-server.vercel.app/auth/logout', {}, { withCredentials: true });
            sessionStorage.removeItem('logged'); // Limpiar sessionStorage
            setIsLogin(false);
            setShowLoginButton(true);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };
    

    useEffect(() => {
        let script;
        const loadGoogleAuth = () => {
            if (window.google?.accounts) {
                _get_auth();
            }
        };

        if (!document.getElementById('google-login-script')) {
            script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.id = 'google-login-script';
            script.onload = loadGoogleAuth;
            document.body.appendChild(script);
        }

        return () => {
            if (script) document.body.removeChild(script);
            if (window.google?.accounts) {
                google.accounts.id.cancel();
            }
        };
    }, [_get_auth]);

    return (
        <>
            {showLoginButton && <div id="buttonDiv"></div>}
        </>
    );
};

GoogleLogin.propTypes = {
    setIsLogin: PropTypes.func.isRequired,
};

export default GoogleLogin;