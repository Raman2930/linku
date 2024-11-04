import React from 'react';

// Define the Textarea component
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={`border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            {...props}
        />
    );
});

// Set display name for debugging
Textarea.displayName = 'Textarea';

export default Textarea;
