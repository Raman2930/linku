// src/components/ui/CardContent.js
import React from 'react';

const CardContent = ({ children, className }) => {
    return (
        <div className="card-content">
            {children}
        </div>
    );
};

export default CardContent;
