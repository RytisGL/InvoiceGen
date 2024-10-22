import React, {useContext, useEffect, useRef, useState} from "react";
import {Box, Button, Grid, List, ListItem, ListItemText, Paper, TextField, Typography} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import GenerateBtn from "./buttons/GenerateBtn.jsx";
import SaveBtn from "./buttons/SaveBtn.jsx";
import axios from 'axios';
import {generateAll, saveInvoice} from '../utils/Utils.js';
import {AuthContext} from '../context/AuthContext';

export default function QuickGenerate() {
    const {
        contextFieldInputs,
        companyDetailsSaved,
        checkJwtExpiration,
        fetchUserDetails,
        userLogo
    } = useContext(AuthContext);
    const [fieldInputs, setFieldInputs] = useState(contextFieldInputs);
    const [isUpdated, setIsUpdated] = useState(false);
    const [companySuggestions, setCompanySuggestions] = useState([]); // Store company suggestions
    const [productSuggestions, setProductSuggestions] = useState([]); // Store product suggestions
    const companyDropdownRef = useRef(null); // Add ref to company suggestions dropdown
    const productDropdownRef = useRef(null); // Add ref to product suggestions dropdown
    // Function to adjust dropdown position dynamically
    const [dropdownPosition, setDropdownPosition] = useState({top: 0});

    const handleDropdownPosition = (e) => {
        const rect = e.target.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        setDropdownPosition({
            top: rect.top + scrollTop + rect.height,
        });
    };

    // Handle input change
    const handleInputChange = (e, fieldGroup, fieldName, index = 0) => {
        const newInputs = {...fieldInputs};
        if (fieldGroup === "productDataObj") {
            newInputs[fieldGroup][index][fieldName] = e.target.value;
        } else {
            newInputs[fieldGroup][fieldName] = e.target.value;
        }
        setFieldInputs(newInputs);
    };

    // Fetch company suggestions based on input value
    const fetchCompanySuggestions = async (inputValue) => {
        await checkJwtExpiration();

        try {
            const response = await axios.get(`http://localhost:8080/api/v1/invoice/company?name=${inputValue}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem('jwtToken')}`},
            });
            setCompanySuggestions(response.data.slice(0, 10)); // Cap suggestions to 10
        } catch (error) {
            console.error("Error fetching company suggestions", error);
        }
    };

    // Fetch product suggestions based on input value
    const fetchProductSuggestions = async (inputValue) => {
        await checkJwtExpiration();
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/invoice/product?name=${inputValue}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem('jwtToken')}`},
            });
            setProductSuggestions(response.data.slice(0, 10)); // Cap suggestions to 10
        } catch (error) {
            console.error("Error fetching product suggestions", error);
        }
    };

    // Handle selection of a company suggestion
    const handleCompanySelection = (selectedCompany) => {
        const newInputs = {...fieldInputs};
        newInputs.infoInputsObj.buyerName = selectedCompany.name;
        newInputs.infoInputsObj.buyerAddress = selectedCompany.address;
        newInputs.infoInputsObj.buyerCmpnyCode = selectedCompany.companyCode;
        newInputs.infoInputsObj.buyerTaxCode = selectedCompany.companyVATCode;
        setFieldInputs(newInputs);
        setCompanySuggestions([]); // Clear suggestions after selection
    };

    // Handle selection of a product suggestion
    const handleProductSelection = (selectedProduct, index) => {
        const newInputs = {...fieldInputs};
        newInputs.productDataObj[index].field1 = selectedProduct.name;
        newInputs.productDataObj[index].field2 = selectedProduct.unitOfMeasure;
        newInputs.productDataObj[index].field3 = selectedProduct.quantity;
        newInputs.productDataObj[index].field4 = selectedProduct.unitPrice;
        newInputs.productDataObj[index].field5 = selectedProduct.vatPercent;
        setFieldInputs(newInputs);
        setProductSuggestions([]); // Clear suggestions after selection
    };

    // Handle adding a new product
    const handleAddProduct = () => {
        if (fieldInputs.productDataObj.length < 15) {
            setFieldInputs({
                ...fieldInputs,
                productDataObj: [...fieldInputs.productDataObj, {
                    field1: "",
                    field2: "",
                    field3: "",
                    field4: "",
                    field5: ""
                }],
            });
        }
    };

    // Handle removing a product
    const handleRemoveProduct = () => {
        if (fieldInputs.productDataObj.length > 1) {
            const updatedProducts = fieldInputs.productDataObj.slice(0, -1);
            setFieldInputs({...fieldInputs, productDataObj: updatedProducts});
        }
    };

    // Handle manually setting the number of products
    const handleSetProductLength = (newLength) => {
        if (newLength >= 1 && newLength <= 15) {
        setFieldInputs((prevInputs) => ({
            ...prevInputs,
            productDataObj: Array(newLength).fill().map((_, idx) => (
                prevInputs.productDataObj[idx] || {
                    field1: "",
                    field2: "",
                    field3: "",
                    field4: "",
                    field5: ""
                }
            ))
        }));
        }
    };

    // Handle clearing suggestions
    const handleClearCompanySuggestions = (e) => {
        if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target)) {
            setCompanySuggestions([]);
        }
        if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
            setProductSuggestions([]);
        }
    };

    // Handle saving and generating an invoice
    const handleSaveAndGenerate = async () => {
        await checkJwtExpiration();
        await saveInvoice([fieldInputs]);
        await fetchUserDetails(false);
        generateAll([fieldInputs], userLogo);
        setIsUpdated(true);
    };

    // Update fieldInputs when contextFieldInputs changes
    useEffect(() => {
        if (isUpdated) {
            setFieldInputs(contextFieldInputs);
            setIsUpdated(false);
        }
    }, [isUpdated, contextFieldInputs]);

    // Add event listener to detect clicks outside the dropdowns
    useEffect(() => {
        document.addEventListener("mousedown", handleClearCompanySuggestions);

        return () => {
            document.removeEventListener("mousedown", handleClearCompanySuggestions);
        };
    }, []);

    return (
        <Box sx={{p: 2}}>
            <Grid container spacing={2}>
                {/* Serial and Issue Date Fields */}
                <Grid item xs={6}>
                    <TextField
                        label="Serija"
                        value={fieldInputs.infoInputsObj.serial}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "serial")}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Išdavimo Data"
                        value={fieldInputs.infoInputsObj.issueDate}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "issueDate")}
                        fullWidth
                    />
                </Grid>

                {/* Buyer Name Input Field */}
                <Grid item xs={6}>
                    <TextField
                        label="Pirkėjo Pavadinimas"
                        value={fieldInputs.infoInputsObj.buyerName}
                        onChange={(e) => {
                            handleInputChange(e, "infoInputsObj", "buyerName");
                            fetchCompanySuggestions(e.target.value);
                        }}
                        onClick={(e) => {
                            fetchCompanySuggestions(e.target.value);
                        }}
                        fullWidth
                    />
                    {/* Display company suggestions in a dropdown */}
                    {companySuggestions.length > 0 && (
                        <Paper ref={companyDropdownRef} sx={{
                            position: 'absolute',
                            zIndex: 2,
                            opacity: 1,
                            width: '46%',
                            backgroundColor: "#7FA1C3"
                        }}>
                            <List>
                                {companySuggestions.map((company, index) => (
                                    <ListItem
                                        key={index}
                                        onClick={() => handleCompanySelection(company)}
                                        sx={{
                                            cursor: 'pointer', "&:hover": {backgroundColor: "#6482AD"},
                                            width: '97%',
                                            marginLeft: "5px",
                                            marginBottom: "5px",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <ListItemText primary={company.name}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Pirkėjo Adresas"
                        value={fieldInputs.infoInputsObj.buyerAddress}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "buyerAddress")}
                        fullWidth
                    />
                </Grid>

                {/* Buyer Company Code and VAT Code */}
                <Grid item xs={6}>
                    <TextField
                        label="Pirkėjo Įmonės Kodas"
                        value={fieldInputs.infoInputsObj.buyerCmpnyCode}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "buyerCmpnyCode")}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Pirkėjo PVM Kodas"
                        value={fieldInputs.infoInputsObj.buyerTaxCode}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "buyerTaxCode")}
                        fullWidth
                    />
                </Grid>

                {/* Add and Remove Product Buttons */}
                <div className="container" style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                    <Button onClick={handleAddProduct} variant="contained" color="success" startIcon={<AddIcon/>}
                            style={{marginRight: "10px"}}/>
                    <input
                        value={fieldInputs.productDataObj.length}
                        onChange={(e) => {
                            const newLength = Math.max(1, parseInt(e.target.value, 10) || 1); // Ensure minimum length of 1
                            handleSetProductLength(newLength); // Update length using the new function
                        }}
                        style={{
                            width: '50px',
                            textAlign: 'center',
                            marginRight: '10px',
                            marginLeft: '10px',
                        }}
                        min={1}
                    />
                    <Button onClick={handleRemoveProduct} variant="contained" color="error"
                            startIcon={<RemoveIcon/>}
                            disabled={fieldInputs.productDataObj.length <= 1}
                    />
                </div>

                {/* Product Input Fields */}
                {fieldInputs.productDataObj.map((product, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={4}>
                            <TextField
                                label="Prekės Pavadinimas"
                                value={product.field1}
                                onChange={(e) => {
                                    handleInputChange(e, "productDataObj", "field1", index);
                                    fetchProductSuggestions(e.target.value);
                                }}
                                onClick={(e) => {
                                    fetchProductSuggestions(e.target.value);
                                    handleDropdownPosition(e); // Adjust dropdown position on click
                                }}
                                fullWidth
                            />
                            {/* Display product suggestions in a dropdown */}
                            {productSuggestions.length > 0 && (
                                <Paper
                                    ref={productDropdownRef}
                                    sx={{
                                        position: "absolute",
                                        zIndex: 2,
                                        opacity: 1,
                                        width: "30%",
                                        marginTop: "-95px",
                                        backgroundColor: "#7FA1C3",
                                        top: dropdownPosition.top, // Use calculated position
                                    }}
                                >
                                    <List>
                                        {productSuggestions.map((product, prodIndex) => (
                                            <ListItem
                                                key={prodIndex}
                                                onClick={() => handleProductSelection(product, index)}
                                                sx={{
                                                    cursor: "pointer",
                                                    "&:hover": {backgroundColor: "#6482AD"},
                                                    width: "97%",
                                                    marginLeft: "5px",
                                                    marginBottom: "5px",
                                                    backgroundColor: "white",
                                                }}
                                            >
                                                <ListItemText primary={product.name}/>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                label="Matavimo Vnt."
                                value={product.field2}
                                onChange={(e) => handleInputChange(e, "productDataObj", "field2", index)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                label="Kiekis"
                                value={product.field3}
                                onChange={(e) => handleInputChange(e, "productDataObj", "field3", index)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                label="Kaina €"
                                value={product.field4}
                                onChange={(e) => handleInputChange(e, "productDataObj", "field4", index)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                label="PVM %"
                                value={product.field5}
                                onChange={(e) => handleInputChange(e, "productDataObj", "field5", index)}
                                fullWidth
                            />
                        </Grid>
                    </React.Fragment>
                ))}

                {/* Issued By Field */}
                <Grid item xs={12}>
                    <TextField
                        label="Išdavė"
                        value={fieldInputs.infoInputsObj.issuedBy}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "issuedBy")}
                        fullWidth
                    />
                </Grid>

                {/* Show message if company details are not saved */}
                {!companyDetailsSaved && (
                    <Grid item xs={12}>
                        <Typography color="error" variant="body1" align="center">
                            Save company details to enable saving the invoice.
                        </Typography>
                    </Grid>
                )}

                {/* Action Buttons */}
                <div className="container" style={{display: 'flex', justifyContent: 'center'}}>
                    <GenerateBtn fieldInputsArray={[fieldInputs]} style={{margin: "10px", background: "#6482AD"}}
                                 disabled={!companyDetailsSaved}/>
                    <SaveBtn
                        fieldInputs={[fieldInputs]}
                        companyDetailsSaved={companyDetailsSaved}
                        setIsUpdated={setIsUpdated}
                    />
                    <Button
                        onClick={handleSaveAndGenerate}
                        variant="contained"
                        color="primary"
                        startIcon={<CreateIcon/>}
                        style={{margin: "10px", background: "#6482AD"}}
                        disabled={!companyDetailsSaved}
                    >
                        Save & Generate
                    </Button>
                </div>
            </Grid>
        </Box>
    );
}
