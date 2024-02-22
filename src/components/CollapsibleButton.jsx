import React, { useState } from 'react';
import '/src/styles/collapsibleButton.css';

const CollapsibleButton = ({ buttonText, content, nestedButton }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleCollapsible = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={toggleCollapsible} >
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
