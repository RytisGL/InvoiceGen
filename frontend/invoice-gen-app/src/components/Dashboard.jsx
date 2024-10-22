import React, {useEffect, useState, useContext} from "react";
import {AuthContext} from "../context/AuthContext"; // Adjust the import path based on your folder structure
import AnalyticsIcon from '@mui/icons-material/Analytics';
import {Button, Collapse, TextField} from "@mui/material";
import InvoiceOutput from "./InvoiceOutput.jsx";
import axios from "axios";
import SearchIcon from '@mui/icons-material/Search';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import GenerateBtn from "./buttons/GenerateBtn.jsx";
import InvoiceData from "./InvoiceData.jsx";
import CreateIcon from "@mui/icons-material/Create.js";
import DescriptionIcon from '@mui/icons-material/Description';
import Stats from "./Stats.jsx";
import QuickGenerate from "./QuickGenerate.jsx";
import Profile from "./Profile.jsx";
import AccountBoxIcon from '@mui/icons-material/AccountBox';

export default function Dashboard() {
    const {checkJwtExpiration} = useContext(AuthContext); // Use
    // AuthContext
    const [invoiceOutput, setInvoiceOutput] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: "",
        buyer: ""
    });
    const [checkedInvoices, setCheckedInvoices] = useState([]);
    const [orderBy, setOrderBy] = useState("id");
    const [direction, setDirection] = useState("DESC");
    const [checkedInvoiceData, setCheckedInvoiceData] = useState([]);
    const [activeComponent, setActiveComponent] = useState("InvoiceData");
    const [areButtonsExpanded, setAreButtonsExpanded] = useState(true);

    const handleCheckChange = async (id, isChecked) => {
        setCheckedInvoices((prevState) => {
            const updatedInvoices = isChecked
                ? [...prevState, id]
                : prevState.filter((invoiceId) => invoiceId !== id);

            // Now update checkedInvoiceData based on the new checkedInvoices
            updateCheckedInvoiceData(updatedInvoices, isChecked, id);
            return updatedInvoices;
        });
    };

    const updateCheckedInvoiceData = async (updatedInvoices, isChecked, id) => {
        await checkJwtExpiration();

        if (isChecked) {
            try {
                const response = await axios.get(`http://localhost:8080/api/v1/invoice/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                const invoice = response.data;

                const products = invoice.products.map((product) => ({
                    key: product.id,
                    field1: product.name,
                    field2: product.unitOfMeasure,
                    field3: product.quantity,
                    field4: product.unitPrice,
                    field5: product.vatPercent,
                }));

                const result = {
                    id: invoice.id,
                    productDataObj: products,
                    infoInputsObj: {
                        serial: invoice.serial,
                        issueDate: invoice.issueDate,
                        sellerName: invoice.seller.name,
                        sellerAddress: invoice.seller.address,
                        sellerCmpnyCode: invoice.seller.companyCode,
                        sellerTaxCode: invoice.seller.companyVATCode,
                        buyerName: invoice.buyer.name,
                        buyerAddress: invoice.buyer.address,
                        buyerCmpnyCode: invoice.buyer.companyCode,
                        buyerTaxCode: invoice.buyer.companyVATCode,
                        issuedBy: invoice.issuedBy,
                    },
                };

                setCheckedInvoiceData((prevData) => [...prevData, result]);
            } catch (error) {
                console.error("Error fetching invoice data:", error);
            }
        } else {
            setCheckedInvoiceData((prevData) =>
                prevData.filter((data) => data.id !== id)
            );
        }
    };

    useEffect(() => {
    }, [checkedInvoices]);

    const fetchInvoiceData = async (pageNumber, filters, orderBy, direction) => {
        await checkJwtExpiration();

        try {
            const {dateFrom, buyer, seller} = filters;
            const queryParams = new URLSearchParams({
                page: pageNumber,
                orderBy,
                direction,
                ...(dateFrom && {dateFrom}),
                ...(buyer && {buyer}),
                ...(seller && {seller}),
            });

            const response = await axios.get(
                `http://localhost:8080/api/v1/invoice/preview?${queryParams.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                }
            );

            console.log("Invoice data fetched successfully:", response.data);

            const invoices = response.data.content;
            const invoiceComponents = invoices.map((invoice) => (
                <InvoiceOutput key={invoice.id} onCheckChange={handleCheckChange} invoice={invoice}/>
            ));

            setInvoiceOutput(invoiceComponents);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching invoice data:", error);
        }
    };

    useEffect(() => {
        setCheckedInvoices([]);
        setCheckedInvoiceData([]);
    }, [activeComponent]);

    useEffect(() => {
        if (activeComponent === 'InvoiceData') {
            fetchInvoiceData(page, filters, orderBy, direction);
        }
    }, [page, orderBy, direction, activeComponent]);

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
        setFilters({...filters, [e.target.name]: e.target.value});
    };

    const handleFilterButtonClick = () => {
        setFilterOpen(!filterOpen);
    };

    const applyFilters = () => {
        setPage(0);
        fetchInvoiceData(0, filters, orderBy, direction);
    };

    const clearFilters = () => {
        setFilters({
            dateFrom: "",
            buyer: ""
        });
        setPage(0);
        fetchInvoiceData(0, {dateFrom: "", buyer: "", seller: ""}, orderBy, direction);
    };

    const handleSortChange = (newOrderBy) => {
        if (newOrderBy === orderBy) {
            setDirection((prevDirection) => (prevDirection === "ASC" ? "DESC" : "ASC"));
        } else {
            setOrderBy(newOrderBy);
            setDirection("DESC");
        }
        setPage(0);
    };

    const handleDeleteInvoices = async () => {
        if (checkedInvoices.length === 0) {
            return;
        }

        await checkJwtExpiration();

        const ids = checkedInvoices.join(",");

        try {
            await axios.delete(`http://localhost:8080/api/v1/invoice`, {
                params: {ids},
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            setCheckedInvoices([]);
            fetchInvoiceData(page, filters, orderBy, direction);
        } catch (error) {
            console.error("Error deleting invoices:", error);
        }
    };

    // Function to determine which component to render
    const renderActiveComponent = () => {
        switch (activeComponent) {
            case "Stats":
                return <Stats/>;
            case "QuickGenerate":
                return <QuickGenerate/>;
            case "Profile":
                return <Profile/>;
            case "InvoiceData":
            default:
                return (
                    <InvoiceData
                        invoiceOutput={invoiceOutput}
                        page={page}
                        totalPages={totalPages}
                        orderBy={orderBy}
                        direction={direction}
                        handleSortChange={handleSortChange}
                        handlePreviousPage={handlePreviousPage}
                        handleNextPage={handleNextPage}
                    />
                );
        }
    };

    // Toggle buttons collapse/expand
    const handleComponentChange = (component) => {
        setActiveComponent(component);
        setAreButtonsExpanded(component === "InvoiceData"); // Collapse buttons unless it's the "InvoiceData" component
    };

    // Dynamic button style
    const getButtonStyle = (component) => {
        return {
            marginTop: "10px",
            background: activeComponent === component ? "#005f99" : "#6482AD",
            justifyContent: "flex-start",
            display: "flex",
            alignItems: "center",
            paddingLeft: "12px"
        };
    };

    return (
        <div className="container">
            <div className="row">
                <div className="dashboard container col-sm-2">
                    <Button
                        component="label"
                        className="col-sm-11"
                        style={getButtonStyle("InvoiceData")}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<DescriptionIcon/>}
                        type="button"
                        onClick={() => handleComponentChange("InvoiceData")}
                    >
                        Sąskaitos
                    </Button>
                    <Collapse in={areButtonsExpanded}>
                        <Button
                            size="small"
                            component="label"
                            className="col-sm-10"
                            style={getButtonStyle("Filters")}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<SearchIcon/>}
                            type="button"
                            onClick={handleFilterButtonClick}
                        >
                            Filtrai
                        </Button>
                        <Collapse in={filterOpen}>
                            <div>
                                <TextField
                                    size="small"
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
                                    size="small"
                                    label="Pirkėjas"
                                    name="buyer"
                                    value={filters.buyer}
                                    onChange={handleFilterChange}
                                    fullWidth
                                    margin="dense"
                                />
                                <Button
                                    className="col-sm-9"
                                    size="small"
                                    style={{
                                        marginTop: "10px",
                                        background: "green",
                                        justifyContent: "flex-start",
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: "12px"
                                    }}
                                    onClick={applyFilters}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<DoneIcon/>}
                                    type="button"
                                >
                                    Taikyti
                                </Button>
                                <Button
                                    className="col-sm-9"
                                    size="small"
                                    style={{
                                        marginTop: "10px",
                                        background: "dimgrey",
                                        justifyContent: "flex-start",
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: "12px"
                                    }}
                                    onClick={clearFilters}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<ClearIcon/>}
                                    type="button"
                                >
                                    Valyti
                                </Button>
                            </div>
                        </Collapse>
                        <Button
                            size="small"
                            className="col-sm-10"
                            style={getButtonStyle("Delete")}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<DeleteForeverIcon/>}
                            type="button"
                            onClick={handleDeleteInvoices}
                        >
                            Ištrinti
                        </Button>
                        <GenerateBtn
                            size="small"
                            className={"col-sm-10"}
                            component="label"
                            fieldInputsArray={checkedInvoiceData}
                            logo={localStorage.getItem('userLogo')}
                            style={{
                                marginTop: "10px",
                                background: "#6482AD",
                                justifyContent: "flex-start",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "12px"
                            }}
                            type="button"
                        />
                    </Collapse>
                    <Button
                        component="label"
                        className="col-sm-11"
                        style={getButtonStyle("Stats")}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<AnalyticsIcon/>}
                        type="button"
                        onClick={() => handleComponentChange("Stats")}
                    >
                        Statistika
                    </Button>
                    <Button
                        component="label"
                        className="col-sm-11"
                        style={getButtonStyle("QuickGenerate")}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CreateIcon/>}
                        type="button"
                        onClick={() => handleComponentChange("QuickGenerate")}
                    >
                        Nauja 🗏
                    </Button>
                    <Button
                        component="label"
                        className="col-sm-11"
                        style={getButtonStyle("Profile")}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<AccountBoxIcon/>}
                        type="button"
                        onClick={() => handleComponentChange("Profile")} // Switches to the Profile component
                    >
                        Profilis
                    </Button>
                </div>
                <div className="dashboard field container col-sm-10" style={{background: "white"}}>
                    {renderActiveComponent()}
                </div>
            </div>
        </div>
    );
}
