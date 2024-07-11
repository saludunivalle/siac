import React, { useState, useEffect } from 'react';
import Header from './Header';
import CollapsibleButton from './CollapsibleButton';
import { Filtro14 } from '../service/data'; 

const DocenciaServicio = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await Filtro14();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <Header />
            <div className="content">
                <h1>Escenarios de Practica</h1>
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <CollapsibleButton
                            key={index}
                            buttonText={item.nombre}
                            content={<p>Escenario de práctica.</p>}
                            defaultClosed={true}
                        />
                    ))
                ) : (
                    <p>Cargando datos...</p>
                )}
            </div>
        </>
    );
};

export default DocenciaServicio;
