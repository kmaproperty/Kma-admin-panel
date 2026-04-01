import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { approveMediaApiHandler, rejectMediaApiHandler, bulkApproveMediaApiHandler } from "../../../services/postProperty";

const statusConfig = {
    approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
};

function MediaStatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}

export default function MediaApprovalSection({ propertyId, photos, videos, imageBaseUrl, onUpdate }) {
    const [rejectDialog, setRejectDialog] = useState({ open: false, fileKey: null });
    const [rejectReason, setRejectReason] = useState("");

    const { mutate: approveMedia, isPending: approving } = useMutation({
        mutationFn: approveMediaApiHandler,
        onSuccess: (res) => {
            toast.success(res.message || "Media approved");
            onUpdate?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to approve media");
        },
    });

    const { mutate: rejectMedia, isPending: rejecting } = useMutation({
        mutationFn: rejectMediaApiHandler,
        onSuccess: (res) => {
            toast.success(res.message || "Media rejected");
            setRejectDialog({ open: false, fileKey: null });
            setRejectReason("");
            onUpdate?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to reject media");
        },
    });

    const { mutate: bulkApprove, isPending: bulkApproving } = useMutation({
        mutationFn: bulkApproveMediaApiHandler,
        onSuccess: (res) => {
            toast.success(res.message || "All media approved");
            onUpdate?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to approve media");
        },
    });

    const allMedia = [
        ...(photos || []).map((item) => ({ ...item, mediaType: "image" })),
        ...(videos || []).map((item) => ({ ...item, mediaType: "video" })),
    ];

    const pendingKeys = allMedia.filter((m) => m.approvalStatus === "pending" || !m.approvalStatus).map((m) => m.fileKey);

    const handleApprove = (fileKey) => {
        approveMedia({ propertyId, fileKey });
    };

    const handleOpenReject = (fileKey) => {
        setRejectDialog({ open: true, fileKey });
        setRejectReason("");
    };

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            toast.error("Please enter a reason for rejection");
            return;
        }
        rejectMedia({
            propertyId,
            fileKey: rejectDialog.fileKey,
            reason: rejectReason.trim(),
        });
    };

    const handleBulkApprove = () => {
        if (pendingKeys.length === 0) {
            toast.info("No pending media to approve");
            return;
        }
        bulkApprove({ propertyId, fileKeys: pendingKeys });
    };

    if (allMedia.length === 0) return null;

    return (
        <div className="bg-white shadow-lg rounded-2xl p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Media Approval ({allMedia.length} items)
                </h3>
                {pendingKeys.length > 0 && (
                    <button
                        onClick={handleBulkApprove}
                        disabled={bulkApproving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        <CheckCircle size={14} />
                        Approve All Pending ({pendingKeys.length})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allMedia.map((item, index) => {
                    const status = item.approvalStatus || "pending";
                    return (
                        <div key={item.fileKey || index} className="border rounded-lg overflow-hidden bg-gray-50">
                            {/* Media preview */}
                            <div className="relative aspect-video bg-black">
                                {item.mediaType === "image" ? (
                                    <img
                                        src={imageBaseUrl + item.fileKey}
                                        alt={item.view || "property"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={imageBaseUrl + item.fileKey}
                                        className="w-full h-full object-cover"
                                        muted
                                    />
                                )}
                                {/* View/format label */}
                                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    {item.view || item.format || (item.mediaType === "video" ? "Video" : "Photo")}
                                </span>
                                {item.isCoverImage && (
                                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        Cover
                                    </span>
                                )}
                            </div>

                            {/* Status and actions */}
                            <div className="p-2">
                                <div className="flex justify-between items-center mb-2">
                                    <MediaStatusBadge status={status} />
                                    <span className="text-[10px] text-gray-400 uppercase">
                                        {item.mediaType}
                                    </span>
                                </div>

                                {/* Rejection reason */}
                                {status === "rejected" && item.rejectionReason && (
                                    <div className="flex items-start gap-1 mb-2 p-1.5 bg-red-50 rounded text-xs text-red-600">
                                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                        <span>{item.rejectionReason}</span>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-1.5">
                                    {status !== "approved" && (
                                        <button
                                            onClick={() => handleApprove(item.fileKey)}
                                            disabled={approving}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200 hover:bg-green-100 disabled:opacity-50 transition-colors"
                                        >
                                            <CheckCircle size={12} />
                                            Approve
                                        </button>
                                    )}
                                    {status !== "rejected" && (
                                        <button
                                            onClick={() => handleOpenReject(item.fileKey)}
                                            disabled={rejecting}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                        >
                                            <XCircle size={12} />
                                            Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialog.open}
                onClose={() => setRejectDialog({ open: false, fileKey: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Reject Media</DialogTitle>
                <DialogContent>
                    <p className="text-sm text-gray-500 mb-3">
                        Please provide a reason for rejecting this media. This will be visible to the property owner.
                    </p>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        placeholder="e.g., Image is blurry, not a real property photo, inappropriate content..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        inputProps={{ maxLength: 500 }}
                        helperText={`${rejectReason.length}/500`}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setRejectDialog({ open: false, fileKey: null })}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmReject}
                        variant="contained"
                        color="error"
                        disabled={rejecting || !rejectReason.trim()}
                    >
                        {rejecting ? "Rejecting..." : "Reject"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
