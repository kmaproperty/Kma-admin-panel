import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';

const CustomDialog = ({
    open,
    handleClose,
    children,
    heading,
    className = '',
    size, // sm, lg, xl
    actions = [],
    showCloseButton = true,
}) => {
    // Determine if the footer should be rendered
    const hasActions = actions && actions.length > 0;

    return (
        <Dialog  
        onClose={handleClose} 
        open={open}
            className={`${className}`} 
            size={size}
        >
            <div className='p-4'>

                <DialogTitle closeButton={showCloseButton} style={{padding: 0}}>
                    {heading}
                </DialogTitle>

                <div className='py-3'>
                    {children}
                </div>
                
                {hasActions && (
                    <div className='flex gap-2 pt-2 mt-2 border-t border-gray-200 justify-end'>
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                variant={action.variant || 'secondary'}
                                onClick={action.onClick}
                                className={`px-4 py-2 text-white cursor-pointer rounded-md ${action.variant === "danger" ? "bg-red-500" : "bg-gray-700"}`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default CustomDialog;