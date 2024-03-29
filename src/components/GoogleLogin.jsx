import React from 'react';
import { decodeToken } from "react-jwt";
import Cookies from 'js-cookie';
import { fetchPostGeneral } from '../service/fetch';
const hojaPermisos = 'Permisos';


function _0x2970($,x){let t=_0x1451();return(_0x2970=function($,x){return t[$-=109]})($,x)}function _0x1451(){let $=["26095vXJWoj","3252-6v6gdu6vi874","361624dtJsAd","8992395fkjVwJ","600103mfGAFX","8RboMUz","sard1ki1837qualr0h86","rcontent.com","485856KKAnPr","1065939xUTAcG",".apps.googleuse","478116TAyAxN","268VZUERL"];return(_0x1451=function(){return $})()}const _0x1390df=_0x2970;!function($,x){let t=_0x2970,_=$();for(;;)try{let n=-parseInt(t(120))/1+-parseInt(t(116))/2+-parseInt(t(114))/3+parseInt(t(117))/4*(parseInt(t(118))/5)+-parseInt(t(113))/6+parseInt(t(109))/7*(-parseInt(t(110))/8)+parseInt(t(121))/9;if(226128===n)break;_.push(_.shift())}catch(f){_.push(_.shift())}}(_0x1451,226128);const panQueso=["23476027",_0x1390df(119),_0x1390df(111),_0x1390df(115),_0x1390df(112)];

const _get_auth = async (setData, setInfo) => {
    
        try {
            // console.log('google', google);
            google.accounts.id.initialize({
            client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
            callback: (response) => handleCredentialResponse(response, setData, setInfo),
            })

            google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "large" , text: "login with google"}  
            );

            google.accounts.id.prompt();
            const _container_button = document.getElementById('root');
            //_container_button.classList.remove('_display_none');
        } catch (error) {
            console.log('error' , error);
        }

}

const have_permision = ({
    data,
    dataToken
}) => {

    const result = (data)?.filter( (item) => {
        console.log(item['user'] === dataToken['email'] , dataToken['email'] , 'data');
        return item['user'] === dataToken['email']
    })

    return {
        "result": result.length > 0 ? true : false,
        "data": result 
    }

}

const handleCredentialResponse = async (response, setIsLogin, setData) => {

    const data_decode = decodeToken(response.credential);

    try {
        const response_ = await fetchPostGeneral({
            dataSend: {},
            sheetName: hojaPermisos,
            urlEndPoint: 'https://siac-server.vercel.app/'
    });
    console.log('response',response_);
    if (response_){
        const result = have_permision({
            data: response_.data,
            dataToken: data_decode
        });

        if(!result.result) {
            alert('No tienes permiso para acceder');
            setIsLogin(false);
            return;
        }
        setIsLogin(true);
        const expiracion = new Date();
        expiracion.setDate(expiracion.getDate() + 5);
        Cookies.set('token', JSON.stringify(data_decode), { expires: expiracion });
        sessionStorage.setItem('logged', JSON.stringify(result.data))
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error; 
    }

    
    
    console.log(data_decode , 'data');
    setIsLogin(true);
}

const GoogleLogin = ({
    isLogin,
    setIsLogin,
    setData
}) => {
    const _root = document.getElementById('root');
    const script_id = document.getElementById('google-login');

    if(script_id) {
        _root.removeChild(script_id);
    }

    //crea un script js y lo inserta en el body
    //insertar este script en body
    const _script = document.createElement('script');
    _script.src = 'https://accounts.google.com/gsi/client';
    _script.async = true;
    _script.id = 'google-login';
    _script.defer = true;
    _root.appendChild(_script);

    //saber si el script se cargo
    _script.onload = () => {
        _get_auth(setIsLogin, setData);
    };


    React.useEffect(() => {
       
    }, []);
    
    return (
        <>
        </>
    )
}



export default GoogleLogin;