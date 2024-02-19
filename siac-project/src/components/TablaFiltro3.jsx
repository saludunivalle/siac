import React, { useEffect, useState } from 'react';
import { Filtro4 } from '../service/data'; 
import '/src/styles/table.css';

const TablaFiltro3 = ({ searchTerm }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await Filtro4({ searchTerm });
        setData(result);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, [searchTerm]);

  return (
    <div className='table-container'>
    <table>
      <thead>
        <tr>
          <th>Programa Académico</th>
          <th>Sede</th>
          <th>Escuela</th>
          <th>Departamento</th>  
          <th>FechaExpedRRC</th>
          <th>DuracionRRC</th>
          <th>FechaVencRRC</th>
          <th>AC Vigente</th>
          <th>FechaExpedAC</th>
          <th>DuracionAC</th>
          <th>FechaVencAC</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item['programa académico']}</td> 
            <td>{item['sede']}</td> 
            <td>{item['escuela']}</td> 
            <td>{item['departamento']}</td> 
            <td>{item['fechaexpedrc']}</td> 
            <td>{item['duracionrc']}</td> 
            <td>{item['fechavencrc']}</td> 
            <td>{item['ac vigente']}</td> 
            <td>{item['fechaexpedac']}</td> 
            <td>{item['duracionac']}</td> 
            <td>{item['fechavencac']}</td> 
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default TablaFiltro3;
