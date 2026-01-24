import React from 'react';
import './FormContainer.css';

const FormContainer = ({ children }) => {
  return (
    <div className="form-container">
      {children}
    </div>
  );
};

export default FormContainer;
