import React, { useState } from "react";
import { TextField, Button, Grid, Box } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import GenerateBtn from "./buttons/GenerateBtn.jsx";
import SaveBtn from "./buttons/SaveBtn.jsx";
import {generateAll, saveInvoice} from '../utils/Utils.js';

export default function QuickGenerate() {
    const [fieldInputs, setFieldInputs] = useState({
        infoInputsObj: {
            serial: "",
            issueDate: "",
            issuedBy: "",
            contactInfo: "",
            sellerName: "",
            sellerAddress: "",
            sellerCmpnyCode: "",
            sellerTaxCode: "",
            buyerName: "",
            buyerAddress: "",
            buyerCmpnyCode: "",
            buyerTaxCode: "",
        },
        productDataObj: [
            { field1: "", field2: "", field3: "", field4: "", field5: "" },
        ],
    });

    const handleInputChange = (e, fieldGroup, fieldName, index = 0) => {
        const newInputs = { ...fieldInputs };
        if (fieldGroup === "productDataObj") {
            newInputs[fieldGroup][index][fieldName] = e.target.value;
        } else {
            newInputs[fieldGroup][fieldName] = e.target.value;
        }
        setFieldInputs(newInputs);
    };

    const handleAddProduct = () => {
        setFieldInputs({
            ...fieldInputs,
            productDataObj: [...fieldInputs.productDataObj, { field1: "", field2: "", field3: "", field4: "", field5: "" }],
        });
    };

    const handleRemoveProduct = () => {
        if (fieldInputs.productDataObj.length > 1) {
            const updatedProducts = fieldInputs.productDataObj.slice(0, -1);
            setFieldInputs({ ...fieldInputs, productDataObj: updatedProducts });
        }
    };

    const handleSaveAndGenerate = async () => {
        await saveInvoice([fieldInputs]);
        generateAll([fieldInputs]);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                {/* Serija and Išdavimo Data Fields side by side */}
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

                {/* Seller and Buyer Fields side by side */}
                <Grid item xs={6}>
                    <TextField
                        label="Pardavėjo Pavadinimas"
                        value={fieldInputs.infoInputsObj.sellerName}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "sellerName")}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Pirkėjo Pavadinimas"
                        value={fieldInputs.infoInputsObj.buyerName}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "buyerName")}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        label="Pardavėjo Adresas"
                        value={fieldInputs.infoInputsObj.sellerAddress}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "sellerAddress")}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Pirkėjo Adresas"
                        value={fieldInputs.infoInputsObj.buyerAddress}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "buyerAddress")}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        label="Pardavėjo Įmonės Kodas"
                        value={fieldInputs.infoInputsObj.sellerCmpnyCode}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "sellerCmpnyCode")}
                        fullWidth
                    />
                </Grid>
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
                        label="Pardavėjo PVM Kodas"
                        value={fieldInputs.infoInputsObj.sellerTaxCode}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "sellerTaxCode")}
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
                <div className="container" style={{display: 'flex', justifyContent: 'center', marginTop:'10px'}}>
                    <Button onClick={handleAddProduct} variant="contained" color='success' startIcon={<AddIcon />}/>
                    <Button
                        onClick={handleRemoveProduct}
                        variant="contained"
                        color="error"
                        startIcon={<RemoveIcon />}
                        sx={{ marginLeft: 2 }}
                        disabled={fieldInputs.productDataObj.length <= 1}
                    />
                </div>

                {/* Product Data Fields */}
                {fieldInputs.productDataObj.map((product, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={4}>
                            <TextField
                                label="Pavadinimas"
                                value={product.field1}
                                onChange={(e) => handleInputChange(e, "productDataObj", "field1", index)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                label="Mat Vnt"
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
                <Grid item xs={12}>
                    <TextField
                        label="Išdavė"
                        value={fieldInputs.infoInputsObj.issuedBy}
                        onChange={(e) => handleInputChange(e, "infoInputsObj", "issuedBy")}
                        fullWidth
                    />
                </Grid>
                <div className="container" style={{display: 'flex', justifyContent: 'center'}}>
                    <GenerateBtn fieldInputsArray={[fieldInputs]} style={{ margin: "10px", background: "#6482AD" }} />
                    <SaveBtn fieldInputs={[fieldInputs]} />
                    <Button
                        onClick={handleSaveAndGenerate}
                        variant="contained"
                        color="primary"
                        startIcon={<CreateIcon />}
                        style={{ margin: "10px", background: "#6482AD" }}
                    >
                        Save & Generate
                    </Button>
                </div>
            </Grid>
        </Box>
    );
}
