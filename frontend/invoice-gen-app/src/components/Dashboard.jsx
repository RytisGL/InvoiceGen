import * as React from "react";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { Button, TextField, Collapse } from "@mui/material";
import InvoiceOutput from "./InvoiceOutput.jsx";
import InvoiceOutputHeader from "./InvoiceOutputHeader.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';

export default function Dashboard() {
    const [invoiceOutput, setInvoiceOutput] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: "",
        buyer: "",
        seller: "",
    });

    const [checkedInvoices, setCheckedInvoices] = useState([]);

    const handleCheckChange = (id, isChecked) => {
        setCheckedInvoices((prevState) => {
            if (isChecked) {
                return [...prevState, id];
            } else {
                return prevState.filter((invoiceId) => invoiceId !== id);
            }
        });
    };

    useEffect(() => {
        console.log("Updated checked invoices:", checkedInvoices);
    }, [checkedInvoices]);

    const fetchInvoiceData = async (pageNumber, filters) => {
        try {
            // Construct query parameters based on filters
            const { dateFrom, buyer, seller } = filters;
            const queryParams = new URLSearchParams({
                page: pageNumber,
                ...(dateFrom && { dateFrom }),
                ...(buyer && { buyer }),
                ...(seller && { seller }),
            });

            const response = await axios.get(
                `http://localhost:8080/api/v1/invoice/preview?${queryParams.toString()}`
            );

            console.log("Invoice data fetched successfully:", response.data);

            const invoices = response.data.content;
            const invoiceComponents = invoices.map((invoice) => (
                <InvoiceOutput key={invoice.id} onCheckChange={handleCheckChange} invoice={invoice} />
            ));

            setInvoiceOutput(invoiceComponents);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching invoice data:", error);
        }
    };

    useEffect(() => {
        // Fetch initial data without filters
        fetchInvoiceData(page, filters);
    }, [page]); // Fetch data whenever the page changes

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage((prevPage) => prevPage - 1);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleFilterButtonClick = () => {
        setFilterOpen(!filterOpen);
    };

    const applyFilters = () => {
        setPage(0); // Reset to the first page when applying new filters
        fetchInvoiceData(0, filters); // Fetch data with the current filters when the button is clicked
    };

    const clearFilters = () => {
        setFilters({
            dateFrom: "",
            buyer: "",
            seller: "",
        });
        setPage(0); // Reset to the first page when clearing filters
        fetchInvoiceData(0, { dateFrom: "", buyer: "", seller: "" }); // Fetch data with no filters
    };

    return (
        <div className="container">
            <div className="row">
                <div className="dashboard container col-sm-2">
                    <Button
                        component="label"
                        className="col-sm-10"
                        style={{
                            margin: "10px",
                            background: "#6482AD",
                            justifyContent: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "12px"
                        }}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<SearchIcon />}
                        type="button"
                        onClick={handleFilterButtonClick} // Toggle filter visibility
                    >
                        Filtrai
                    </Button>
                    <Collapse in={filterOpen}>
                        <div >
                            <TextField
                                label="Nuo datos"
                                name="dateFrom"
                                type="date"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                                fullWidth
                                margin="dense"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                label="Pardavėjas"
                                name="seller"
                                value={filters.seller}
                                onChange={handleFilterChange}
                                fullWidth
                                margin="dense"
                            />
                            <TextField
                                label="Pirkėjas"
                                name="buyer"
                                value={filters.buyer}
                                onChange={handleFilterChange}
                                fullWidth
                                margin="dense"
                            />
                            <Button
                                type="button"
                                color="success"
                                onClick={applyFilters} // Apply filters and rerender components
                                variant="contained"
                                startIcon={<DoneIcon />}
                                fullWidth
                            >
                                Filtruoti
                            </Button>
                            <Button
                                type="button"
                                color="secondary"
                                onClick={clearFilters} // Clear filters and rerender components
                                variant="contained"
                                fullWidth
                                startIcon={<ClearIcon/>}
                                style={{ marginTop: "10px" }}
                            >
                                Išvalyti
                            </Button>
                        </div>
                    </Collapse>
                    <Button
                        component="label"
                        className="col-sm-10"
                        style={{
                            margin: "10px",
                            background: "#6482AD",
                            justifyContent: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "12px"
                        }}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<DeleteForeverIcon />}
                        type="button"
                    >
                        IŠTRINTI
                    </Button>
                    <Button
                        component="label"
                        className="col-sm-10"
                        style={{
                            margin: "10px",
                            background: "#6482AD",
                            justifyContent: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "12px"
                        }}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<ThreeSixtyIcon />}
                        type="button"
                    >
                        GENERUOTI
                    </Button>
                    <Button
                        component="label"
                        className="col-sm-10"
                        style={{
                            margin: "10px",
                            background: "#6482AD",
                            justifyContent: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "12px"
                        }}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<AnalyticsIcon />}
                        type="button"
                    >
                        STATISTIKA
                    </Button>
                </div>
                <div className="dashboard field container col-sm-10" style={{ background: "white" }}>
                    <InvoiceOutputHeader />
                    {invoiceOutput}
                    <div className="row" style={{
                        position: "absolute",
                        bottom: 15,
                        left: 0,
                        right: 0,
                        justifyContent: "center",
                        display: "flex"
                    }}>
                        <Button startIcon={<KeyboardArrowLeftIcon />} variant="contained" style={{ background: "#6482AD" }}
                                onClick={handlePreviousPage} disabled={page === 0} />
                        {page + 1} iš {totalPages}
                        <Button startIcon={<KeyboardArrowRightIcon />} variant="contained"
                                style={{ background: "#6482AD" }} onClick={handleNextPage}
                                disabled={page === totalPages - 1} />
                    </div>
                </div>
            </div>
        </div>
    )
}
