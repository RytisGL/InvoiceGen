import * as React from "react";
import { Button } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function InvoiceOutputHeader({ onSortChange, currentSort, currentDirection }) {

    const handleSort = (sortBy) => {
        onSortChange(sortBy);
    };

    const getButtonStyle = (sortBy) => ({
        color: currentSort === sortBy ? "#E1D7B7" : "white",
        textTransform: "none",
        fontWeight: currentSort === sortBy ? "bold" : "normal",
        justifyContent: sortBy === "id" ? "center" : "left"
    });

    const getSortIndicator = (sortBy) => {
        if (currentSort === sortBy) {
            return currentDirection === "ASC" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
        }
        return null;
    };

    return (
        <div className="d-flex w-100" style={{ background: "#6482AD", color: "white" }}>
            <Button
                className="col-3"
                onClick={() => handleSort("id")}
                variant="text"
                style={getButtonStyle("id")}
            >
                <h4>Serija {getSortIndicator("id")}</h4>
            </Button>
            <Button
                className="col-4"
                onClick={() => handleSort("companyName")}
                variant="text"
                style={getButtonStyle("companyName")}
            >
                <h4>Pirkėjas {getSortIndicator("companyName")}</h4>
            </Button>
            <Button
                className="col-3"
                onClick={() => handleSort("issueDate")}
                variant="text"
                style={getButtonStyle("issueDate")}
            >
                <h4>Išdavimo data {getSortIndicator("issueDate")}</h4>
            </Button>
            <Button
                className="col-3"
                onClick={() => handleSort("sum")}
                variant="text"
                style={getButtonStyle("sum")}
            >
                <h4>Suma {getSortIndicator("sum")}</h4>
            </Button>
        </div>
    );
}
