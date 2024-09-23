import React from "react";
import {Button} from "@mui/material";
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
        <>
            <InvoiceOutputHeader
                onSortChange={handleSortChange}
                currentSort={orderBy}
                currentDirection={direction}
            />
            {invoiceOutput}
            <div className="row" style={{
                position: "relative",
                bottom: 0,
                left: 0,
                right: 0,
                justifyContent: "center",
                display: "flex"
            }}>
                <Button
                    startIcon={<KeyboardArrowLeftIcon/>}
                    variant="contained"
                    style={{background: "#6482AD", marginRight: "10px"}}
                    onClick={handlePreviousPage}
                    disabled={page === 0}
                />
                {page + 1} iš {totalPages}
                <Button
                    endIcon={<KeyboardArrowRightIcon/>}
                    variant="contained"
                    style={{background: "#6482AD", marginLeft: "10px"}}
                    onClick={handleNextPage}
                    disabled={page === totalPages - 1}
                />
            </div>
        </>
    );
};

export default InvoiceData;
