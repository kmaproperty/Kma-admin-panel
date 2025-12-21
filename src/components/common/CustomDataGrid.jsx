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
    style
}) => {
    return (
        <div style={{ width: "100%", fontFamily: 'Figtree', ...style }} className={`rounded-xl ${className}`}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                paginationMode="server"
                rowCount={rowCount}
                pageSizeOptions={[10, 25, 50]}
                rowHeight={70}
                disableRowSelectionOnClick
                paginationModel={{
                    page,
                    pageSize,
                }}

                onPaginationModelChange={(model) => {
                    if (model.page !== page) {
                        onPageChange?.(model.page);
                    }
                    if (model.pageSize !== pageSize) {
                        onPageSizeChange?.(model.pageSize);
                    }
                }}

                disableSelectionOnClick
            />

        </div>
    );
};

export default CustomDataGrid;
