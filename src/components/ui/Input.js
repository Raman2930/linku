
import React from 'react';

const Input = ({ type = 'text', className, ...props }) => (
    <input
        type={type}
        className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
    />
);

export default Input;

