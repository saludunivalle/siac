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
    const [showLoginButton, setShowLoginButton] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false); // Verifica si Google se ha cargado

    const handleCredentialResponse = useCallback(async (response) => {
        if (!response.credential) return;

        const data_decode = decodeToken(response.credential);
        try {
            const permisosResponse = await fetchPostGeneral({
                dataSend: {},
                sheetName: hojaPermisos,
                urlEndPoint: 'https://siac-server.vercel.app/'
            });

            if (permisosResponse) {
                const resultPermisos = (() => {
                    const result = permisosResponse.data?.filter(item => item['user'] === data_decode.email);
                    return {
                        result: result.length > 0,
                        data: result
                    };
                })();

                if (resultPermisos.result) {
                    setIsLogin(true);
                    localStorage.setItem('logged', JSON.stringify(resultPermisos.data));
                    Cookies.set('token', JSON.stringify(data_decode), { expires: 5 });
                    setShowLoginButton(false);
                    setIsSessionActive(true);
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
                    return accesosArray.includes(data_decode.email);
                });

                if (programaPermitido) {
                    navigate('/program_details', { state: { ...programaPermitido, userEmail: data_decode.email } });
                    setIsLogin(true);
                    localStorage.setItem('logged', JSON.stringify(data_decode));
                    setShowLoginButton(false);
                    setIsSessionActive(true);
                    return;
                }
            }

            alert('No tienes permiso para acceder');
            setIsLogin(false);
            setShowLoginButton(true);
            setIsSessionActive(false);
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }, [setIsLogin, navigate]);

    const _get_auth = useCallback(() => {
        if (!window.google?.accounts) return;

        google.accounts.id.initialize({
            client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
            callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "large", text: "signin_with" }
        );

        google.accounts.id.prompt();
    }, [handleCredentialResponse]);

    const handleLogout = async () => {
        try {
            await axios.post('https://siac-server.vercel.app/auth/logout', {}, { withCredentials: true });
            localStorage.removeItem('logged'); 
            Cookies.remove('token'); 
            setIsLogin(false);
            setShowLoginButton(true);
            setIsSessionActive(false);

            if (window.google?.accounts) {
                google.accounts.id.prompt();
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    useEffect(() => {
        const loadGoogleScript = () => {
            if (document.getElementById('google-login-script')) {
                setGoogleLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.id = 'google-login-script';
            script.onload = () => {
                setGoogleLoaded(true);
                _get_auth();
            };
            document.body.appendChild(script);
        };

        loadGoogleScript();

        const storedSession = localStorage.getItem('logged');
        const tokenExists = Cookies.get('token');

        if (storedSession && tokenExists) {
            setIsLogin(true);
            setShowLoginButton(false);
            setIsSessionActive(true);
        } else {
            setShowLoginButton(true);
            setIsSessionActive(false);
        }

        return () => {
            if (window.google?.accounts) {
                google.accounts.id.cancel();
            }
        };
    }, [_get_auth]);

    return (
        <>
            {showLoginButton && googleLoaded && <div id="buttonDiv"></div>}
            {isSessionActive && (
                <button onClick={handleLogout} style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px',
                    backgroundColor: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)'
                }}>
                    ❌
                </button>
            )}
        </>
    );
};

GoogleLogin.propTypes = {
    setIsLogin: PropTypes.func.isRequired,
};

export default GoogleLogin;
