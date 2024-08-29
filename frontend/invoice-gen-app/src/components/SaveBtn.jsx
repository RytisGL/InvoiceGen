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
                taxCode: titleInputs.sellerTaxCode,
            },
            buyer: {
                name: titleInputs.buyerName,
                address: titleInputs.buyerAddress,
                companyCode: titleInputs.buyerCmpnyCode,
                taxCode: titleInputs.buyerTaxCode,
            },
            productList: data.map((item) => ({
                productName: item.field1,
                quantity: item.field2,
                price: item.field3,
                description: item.field4,
                totalPrice: item.field5,
            })),
        };

        try {
            const response = await axios.post("localhost:8080/invoice", invoiceRequest);
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