import React, { useState } from 'react';
import '/src/styles/collapsibleButton.css';

const CollapsibleButton = ({ buttonText, content, nestedButton, defaultClosed, buttonStyle }) => {
  const [isOpen, setIsOpen] = useState(defaultClosed);

  const toggleCollapsible = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{
      marginBottom: '12px',
      isolation: 'isolate',
      position: 'relative',
      backgroundColor: 'white',
      zIndex: 1
    }}>
      <button 
        className='collapsible-button' 
        onClick={toggleCollapsible}
        style={buttonStyle || {}}
      >
        {buttonText} {isOpen ? '▲' : '▼'} 
      </button>
      {isOpen && (
        <div style={{
          width: '100%',
          background: 'white',
          marginBottom: '10px',
          padding: '10px 0',
          position: 'relative',
          zIndex: 2
        }}>
          {content}
          {nestedButton}
        </div>
      )}
    </div>
  );
};

export default CollapsibleButton;
