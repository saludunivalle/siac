import React from 'react';
import CollapsibleButton from './CollapsibleButton';
import TablaFiltro1 from './TablaFiltro1'; 
import TablaFiltro2 from './TablaFiltro2'; 


const NivelEd = () => {
  const pregradoContent = <TablaFiltro1 searchTerm="Pregrado" />;
  const maestContent = <TablaFiltro2 searchTerm="Maestría" />
  const docContent = <TablaFiltro2 searchTerm="Doctorado" />
  const espContent =<TablaFiltro2 searchTerm="Especialización" />
  const espQContent = <TablaFiltro2 searchTerm="Especialización Médico Quirúrgica" />

  return (
    <>
      <div>
        <CollapsibleButton buttonText="Pregrado" content={pregradoContent} />
        <CollapsibleButton buttonText="Posgrado" content={<p>
            <CollapsibleButton buttonText="Maestría" content={maestContent}/>
            <CollapsibleButton buttonText="Doctorado" content={docContent}/>
            <CollapsibleButton buttonText="Especializaciones" content={espContent}/>
            <CollapsibleButton buttonText="Especializaciones Médico Quirúrgicas" content={espQContent}/>
            </p>} />
      </div>
    </>
  );
};

export default NivelEd;
