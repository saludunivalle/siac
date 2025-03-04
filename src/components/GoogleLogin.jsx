/* global google */
import { useState, useCallback, useEffect } from 'react';
import { decodeToken } from "react-jwt";
import Cookies from 'js-cookie';
import { fetchPostGeneral } from '../service/fetch';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

const hojaPermisos = 'Permisos';
const hojaProgramas = 'Programas';

const GoogleLogin = ({
    setIsLogin,
    // Removed setData from props if not used
}) => {
    const navigate = useNavigate();
    const [showLoginButton, setShowLoginButton] = useState(true);
    // If you don't need userEmail elsewhere, you can remove this state,
    // otherwise keep it for future use.
    const [userEmail, setUserEmail] = useState(null); 

    const have_permision = ({ data, dataToken }) => {
        const result = data?.filter(item => item['user'] === dataToken['email']);
        return {
            result: result.length > 0,
            data: result 
        };
    };

    // Use useCallback so that it can be added safely in the useEffect dependency array.
    const handleCredentialResponse = useCallback(async (response) => {
        const data_decode = decodeToken(response.credential);

        try {
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
                    setUserEmail(data_decode.email);
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
    }, [setIsLogin, navigate]);

    useEffect(() => {
        const initializeGoogleButton = () => {
            try {
                google.accounts.id.initialize({
                    client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
                    callback: handleCredentialResponse,
                    hosted_domain: 'correounivalle.edu.co',
                    ux_mode: 'popup'
                });

                google.accounts.id.renderButton(
                    document.getElementById("googleButtonContainer"),
                    {
                        theme: "outline",
                        size: "large",
                        text: "signin_with",
                        type: "standard",
                        shape: "rectangular",
                        width: 300
                    }
                );
            } catch (error) {
                console.error('Error inicializando Google Auth:', error);
            }
        };

        const loadGoogleScript = () => {
            if (!document.getElementById('google-login-script')) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.id = 'google-login-script';
                script.onload = initializeGoogleButton;
                document.body.appendChild(script);
            }
        };

        loadGoogleScript();

        return () => {
            const buttonContainer = document.getElementById("googleButtonContainer");
            if (buttonContainer) buttonContainer.innerHTML = '';
        };
    // Now we can safely add handleCredentialResponse into dependencies.
    }, [handleCredentialResponse]);

    return (
        <div 
            id="googleButtonContainer"
            style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '20px 0',
                visibility: showLoginButton ? 'visible' : 'hidden'
            }}
        ></div>
    );
};

GoogleLogin.propTypes = {
    setIsLogin: PropTypes.func.isRequired,
    // Remove or add the following based on your future use:
    // setData: PropTypes.func,
};

export default GoogleLogin;