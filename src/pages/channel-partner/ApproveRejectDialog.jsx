import * as React from "react";
import { Dialog, DialogContent, InputBase } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function ApproveRejectDialog({ open, title, type, loading, onClose, onSubmit }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");

  const isReject = type === "reject";
  const buttonLabel = isReject ? "Reject" : "Approve";
  const buttonColor = isReject ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700";

  React.useEffect(() => {
    if (open) {
      setComment("");
      setError("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError("Comment/reason is required");
      return;
    }
    setError("");
    onSubmit(comment);
  };

  const handleClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: { borderRadius: fullScreen ? "" : "1rem" },
        },
      }}
    >
      <DialogContent>
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold text-gray-800">{title}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none">&times;</button>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-[400px]">
            <label className="text-sm font-medium text-gray-600">
              {isReject ? "Reason for rejection *" : "Comment *"}
            </label>
            <InputBase
              placeholder={isReject ? "Enter reason for rejection..." : "Enter your comment..."}
              multiline
              fullWidth
              minRows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError("");
              }}
              className="box-border text-sm rounded-xl border border-gray-300 focus-within:border-indigo-500"
              sx={{
                "& .MuiInputBase-input": { padding: "1rem" },
              }}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="pt-3 flex gap-3">
              <button
                disabled={loading}
                onClick={handleSubmit}
                className={`flex-1 py-2.5 text-white text-sm font-medium rounded-lg cursor-pointer ${buttonColor} disabled:opacity-50`}
              >
                {loading ? "Processing..." : buttonLabel}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
