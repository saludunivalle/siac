import React from 'react';
import CollapsibleButton from './CollapsibleButton';
import TablaFiltro3 from './TablaFiltro3'; 

const Escuelas = () => {
  const labContent = <TablaFiltro3 searchTerm="Bacteriología y Lab. Clínico" />;
  const cienciasContent = <TablaFiltro3 searchTerm="Ciencias Básicas" />
  const enfermeriaContent = <TablaFiltro3 searchTerm="Enfermería" />
  const medicinaContent =<TablaFiltro3 searchTerm="Medicina" />
  const odontContent = <TablaFiltro3 searchTerm="Odontología" />
  const rhContent = <TablaFiltro3 searchTerm="Rehabilitación Humana" />
  const saludContent = <TablaFiltro3 searchTerm="Salud Pública" />

  return (
    <>
      <div>
        <CollapsibleButton buttonText="Bacteriología y Lab. Clínico" content={labContent} />
        <CollapsibleButton buttonText="Ciencias Básicas" content={cienciasContent} />
        <CollapsibleButton buttonText="Enfermería" content={enfermeriaContent} />
        <CollapsibleButton buttonText="Medicina" content={medicinaContent} />
        <CollapsibleButton buttonText="Odontología" content={odontContent} />
        <CollapsibleButton buttonText="Rehabilitación Humana" content={rhContent} />
        <CollapsibleButton buttonText="Salud Pública" content={saludContent} />
      </div>
    </>
  );
}

export default Escuelas;
