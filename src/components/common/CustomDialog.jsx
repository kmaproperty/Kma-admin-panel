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
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
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
          <span className="text-base font-semibold text-gray-800">{heading}</span>

          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={handleClose}
              size="small"
            >
              <X width={20} height={20} />
            </IconButton>
          )}
        </DialogTitle>

        {/* Body */}
        <div className="py-3">
          <div className="max-h-[70vh] overflow-auto pr-1">{children}</div>
        </div>

        {/* Footer */}
        {hasActions && (
          <div className="flex gap-2 pt-3 mt-2 border-t border-gray-200 justify-end bg-white sticky bottom-0">
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
