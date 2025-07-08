import React, { useState } from 'react';
import '/src/styles/collapsibleButton.css';

const CollapsibleButton = ({ buttonText, content, nestedButton, defaultClosed, buttonStyle }) => {
  const [isOpen, setIsOpen] = useState(!defaultClosed);

  const toggleCollapsible = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div >
      <button 
        className='collapsible-button' 
        onClick={toggleCollapsible}
        style={buttonStyle || {}}
      >
        {buttonText} {isOpen ? '▲' : '▼'} 
      </button>
      {isOpen && (
        <div>
          {content}
          {nestedButton}
        </div>
      )}
    </div>
  );
};

export default CollapsibleButton;
