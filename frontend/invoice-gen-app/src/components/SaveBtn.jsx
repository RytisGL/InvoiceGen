import {Button} from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import React from "react";
import axios from "axios";

export default function SaveBtn({ data, titleInputs }) {
    const handleSave = async () => {

        const invoiceRequest = {
            serial: titleInputs.serial,
            issueDate: titleInputs.date,
            issuedBy: titleInputs.issuedBy,
            contactInfo: titleInputs.contactInfo,
            seller: {
                name: titleInputs.sellerName,
                address: titleInputs.sellerAddress,
                companyCode: titleInputs.sellerCmpnyCode,
                companyVATCode: titleInputs.sellerTaxCode,
            },
            buyer: {
                name: titleInputs.buyerName,
                address: titleInputs.buyerAddress,
                companyCode: titleInputs.buyerCmpnyCode,
                companyVATCode: titleInputs.buyerTaxCode,
            },
            productList: data.map((item) => ({
                name: item.field1,
                unitOfMeasure: item.field2,
                quantity: item.field3,
                unitPrice: item.field4,
                vatPercent: item.field5,
            })),
        };

        try {
            const response = await axios.post("http://localhost:8080/api/v1/invoice", invoiceRequest);
            console.log("Invoice created successfully:", response.data);
            // Handle success (e.g., display a success message or redirect)
        } catch (error) {
            console.error("Error creating invoice:", error);
            // Handle error (e.g., display an error message)
        }
    };
    return (
        <Button component="label"
                style={{margin:'10px', background : "#6482AD"}}
                variant="contained"
                tabIndex={-1}
                onClick={handleSave}
                startIcon={<CreateIcon style={{color : 'lime'}}/>}
                type="button"
                >Išsaugoti</Button>
    )
}