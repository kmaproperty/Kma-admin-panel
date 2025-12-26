import React from "react";
import {
  Dialog,
  DialogTitle,
  IconButton
} from "@mui/material";
import { X } from "lucide-react";

const CustomDialog = ({
  open,
  handleClose,
  children,
  heading,
  className = "",
  size,
  actions = [],
  showCloseButton = true,
}) => {
  const hasActions = actions && actions.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={className}
      maxWidth={size || "sm"}
      fullWidth
    >
      <div className="p-4">
        {/* Header */}
        <DialogTitle
          sx={{
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{heading}</span>

          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={handleClose}
              size="small"
            >
              <X width={4} height={4} />
            </IconButton>
          )}
        </DialogTitle>

        {/* Body */}
        <div className="py-3">{children}</div>

        {/* Footer */}
        {hasActions && (
          <div className="flex gap-2 pt-2 mt-2 border-t border-gray-200 justify-end">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 text-white rounded-md cursor-pointer ${
                  action.variant === "danger"
                    ? "bg-red-500"
                    : action.variant === "primary"
                    ? "bg-blue-800"
                    : "bg-gray-700"
                }`}
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
