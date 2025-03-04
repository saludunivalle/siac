/* global google */
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';
import { fetchPostGeneral } from '../service/fetch';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleLogin = ({ setIsLogin }) => {
    const navigate = useNavigate();
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [showLoginButton, setShowLoginButton] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);

    const handleCredentialResponse = useCallback(async (response) => {
        if (!response.credential) return;

        const data_decode = decodeToken(response.credential);
        try {
            const permisosResponse = await fetchPostGeneral({
                dataSend: {},
                sheetName: 'Permisos',
                urlEndPoint: 'https://siac-server.vercel.app/'
            });

            if (permisosResponse && permisosResponse.data) {
                const resultPermisos = permisosResponse.data.filter(item => item['user'] === data_decode.email);
                if (resultPermisos.length > 0) {
                    setIsLogin(true);
                    localStorage.setItem('logged', JSON.stringify(resultPermisos));
                    Cookies.set('token', JSON.stringify(data_decode), { expires: 5 });
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
    }, [setIsLogin]);

    const initializeGoogleAuth = useCallback(() => {
        if (!window.google?.accounts) return;

        google.accounts.id.initialize({
            client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
            callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
            document.getElementById('buttonDiv'),
            { theme: 'outline', size: 'large', text: 'signin_with' }
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
            navigate('/login');
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
                initializeGoogleAuth();
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
    }, [initializeGoogleAuth]);

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
