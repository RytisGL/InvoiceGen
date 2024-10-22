import React from "react";
import { Button } from "@mui/material";
import InvoiceOutputHeader from "./InvoiceOutputHeader.jsx";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const InvoiceData = ({
                         invoiceOutput,
                         page,
                         totalPages,
                         orderBy,
                         direction,
                         handleSortChange,
                         handlePreviousPage,
                         handleNextPage
                     }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ flexGrow: 1 }}>
                <InvoiceOutputHeader
                    onSortChange={handleSortChange}
                    currentSort={orderBy}
                    currentDirection={direction}
                />
                {invoiceOutput}
            </div>
            {totalPages > 1 && (
                <div style={{
                    justifyContent: "center",
                    display: "flex",
                    flexShrink: 0
                }}>
                    <Button
                        startIcon={<KeyboardArrowLeftIcon />}
                        variant="contained"
                        style={{ background: "#6482AD", marginRight: "10px" }}
                        onClick={handlePreviousPage}
                        disabled={page === 0}
                    />
                    {page + 1} iš {totalPages}
                    <Button
                        endIcon={<KeyboardArrowRightIcon />}
                        variant="contained"
                        style={{ background: "#6482AD", marginLeft: "10px" }}
                        onClick={handleNextPage}
                        disabled={page === totalPages - 1}
                    />
                </div>
            )}
        </div>
    );
};

export default InvoiceData;
