import React, { useState } from "react";
import "/src/styles/collapsibleButton.css";

const CollapsibleButton = ({
  buttonText,
  content,
  nestedButton,
  defaultClosed,
  buttonStyle,
  open,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(!defaultClosed);
  const isControlled = typeof open === "boolean";
  const visible = isControlled ? open : isOpen;

  const toggleCollapsible = () => {
    const nextValue = !visible;
    if (!isControlled) setIsOpen(nextValue);
    onToggle?.(nextValue);
  };

  return (
    <div
      style={{
        marginBottom: "12px",
        isolation: "isolate",
        position: "relative",
        backgroundColor: "white",
        zIndex: 1,
      }}
    >
      <button
        className="collapsible-button"
        onClick={toggleCollapsible}
        style={buttonStyle || {}}
      >
        {buttonText} {visible ? "▲" : "▼"}
      </button>
      {visible && (
        <div
          style={{
            width: "100%",
            background: "white",
            marginBottom: "10px",
            padding: "10px 0",
            position: "relative",
            zIndex: 2,
          }}
        >
          {content}
          {nestedButton}
        </div>
      )}
    </div>
  );
};

export default CollapsibleButton;
