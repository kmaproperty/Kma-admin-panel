import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const CustomDataGrid = ({
  rows = [],
  columns = [],
  className = "",
  page = 0,
  pageSize = 10,
  rowCount = 0,
  onPageChange,
  onPageSizeChange,
  loading = false,
  style,
}) => {
  const totalPages = Math.ceil(rowCount / pageSize);

  const getPageRange = () => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    if (page <= 1) {
      return [0, 1, 2, "..."];
    } 
    if (page >= totalPages - 2) {
      return ["...", totalPages - 3, totalPages - 2, totalPages - 1];
    }
    return ["...", page, page + 1, "..."];
  };

  return (
    <div
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        width: "100%", 
        height: "500px", 
        fontFamily: "Figtree", 
        ...style 
      }}
      className={`rounded-xl border border-[#e2e8f0] overflow-hidden bg-white ${className}`}
    >
      <div style={{ flexGrow: 1, width: "100%", overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          rowHeight={60}
          columnHeaderHeight={50}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          hideFooter
          sx={{
            border: "none",
            fontFamily: "Figtree",
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f8fafc",
              color: "#5d7186",
              fontSize: "14px",
              fontWeight: "600 !important",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "500 !important",
            },
            "& .MuiDataGrid-cell": {
              color: "#5d7186",
              fontSize: "14px",
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            "& .MuiDataGrid-row:hover": { backgroundColor: "#f1f5f9 !important" },
          }}
        />
      </div>

      {/* CUSTOM PAGINATION FOOTER */}
      <div className="flex justify-end items-center p-4 bg-white border-t border-[#e2e8f0]">
        <div className="flex items-center border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
          <button
            disabled={page === 0}
            onClick={() => onPageChange?.(page - 1)}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-[#5d7186] hover:bg-gray-50 disabled:opacity-40 border-r border-[#e2e8f0]"
          >
            Previous
          </button>

          {getPageRange().map((item, index) => (
            <button
              key={index}
              disabled={item === "..."}
              onClick={() => item !== "..." && onPageChange?.(item)}
              className={`px-4 py-2 cursor-pointer text-sm font-medium border-r border-[#e2e8f0] last:border-r-0 transition-colors ${
                item === "..." 
                  ? "bg-white text-[#94a3b8] cursor-default" 
                  : page === item
                    ? "bg-blue-950 text-white" 
                    : "bg-white text-[#5d7186] hover:bg-gray-50"
              }`}
              style={{ minWidth: "44px" }} // Ensures dots and numbers have same width
            >
              {item === "..." ? "..." : item + 1}
            </button>
          ))}

          <button
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange?.(page + 1)}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-[#5d7186] hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDataGrid;