import React, { useState } from "react";
import { Tooltip, Switch } from "@mui/material";
import { Check, X, Wallet } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";

const dummyData = [
  {
    id: 1,
    referrerName: "Amit",
    clientName: "Rahul Sharma",
    status: "Pending",
    coinsCredited: 0,
    isPaid: false,
    createdAt: "2026-04-01T10:15:30Z",
  },
  {
    id: 2,
    referrerName: "Neha",
    clientName: "Priya Mehta",
    status: "Deal Closed",
    coinsCredited: 500,
    isPaid: false,
    createdAt: "2026-04-02T11:20:10Z",
  },
];

export default function CoinsPayoutPage() {
  const [rows, setRows] = useState(dummyData);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPage: dummyData.length,
  });

  const onPageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const onPageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      limit: newSize,
      page: 1,
    }));
  };

  const handleStatusChange = (id, currentStatus) => {
    const updated = rows.map((row) => {
      if (row.id === id) {
        const newStatus =
          currentStatus === "Deal Closed"
            ? "Pending"
            : "Deal Closed";

        return {
          ...row,
          status: newStatus,
          coinsCredited:
            newStatus === "Deal Closed" ? 500 : 0,
        };
      }
      return row;
    });

    setRows(updated);
  };

  const handleManualCoins = (id) => {
    const value = prompt("Enter coins:");
    if (!value) return;

    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, coinsCredited: Number(value) }
          : row
      )
    );
  };

  const handleMarkPaid = (id) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, isPaid: !row.isPaid }
          : row
      )
    );
  };

  const columns = [
    {
      field: "referrerName",
      headerName: "Referrer",
      flex: 1,
    },
    {
      field: "clientName",
      headerName: "Client",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const color =
          params.value === "Deal Closed"
            ? "text-green-700 bg-green-50"
            : "text-gray-700 bg-gray-100";

        return (
          <span className={`px-2 py-1 rounded text-xs ${color}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "coinsCredited",
      headerName: "Coins",
      flex: 0.7,
    },
    {
      field: "isPaid",
      headerName: "Paid",
      flex: 0.6,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleMarkPaid(params.row.id)}
          size="small"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      renderCell: (params) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      renderCell: (params) => (
        <div className="flex gap-2">

          {/* Toggle Deal Closed */}
          <Tooltip title="Toggle Deal Closed">
            <button
              className="p-2 bg-blue-50 rounded"
              onClick={() =>
                handleStatusChange(
                  params.row.id,
                  params.row.status
                )
              }
            >
              <Check className="w-4 h-4 text-blue-700" />
            </button>
          </Tooltip>

          {/* Manual Override */}
          <Tooltip title="Manual Coins">
            <button
              className="p-2 bg-yellow-50 rounded"
              onClick={() =>
                handleManualCoins(params.row.id)
              }
            >
              <Wallet className="w-4 h-4 text-yellow-700" />
            </button>
          </Tooltip>

          {/* Mark Paid */}
          <Tooltip title="Mark as Paid">
            <button
              className={`p-2 rounded ${
                params.row.isPaid
                  ? "bg-red-50"
                  : "bg-green-50"
              }`}
              onClick={() =>
                handleMarkPaid(params.row.id)
              }
            >
              {params.row.isPaid ? (
                <X className="w-4 h-4 text-red-700" />
              ) : (
                <Check className="w-4 h-4 text-green-700" />
              )}
            </button>
          </Tooltip>

        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Coins Credit / Payout
      </h2>

      <CustomDataGrid
        columns={columns}
        rows={rows}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={pagination.totalPage}
        style={{ height: "calc(100vh - 140px)" }}
      />
    </div>
  );
}