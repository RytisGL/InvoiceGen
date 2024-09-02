import { Button } from "@mui/material";
import * as React from "react";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export default function InvoiceOutput({ invoice, onCheckChange }) {
    const { serial, companyName, issueDate, sum, id } = invoice;

    const [isChecked, setIsChecked] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [invoiceDetails, setInvoiceDetails] = React.useState(null);

    const handleCheckToggle = (event) => {
        event.stopPropagation();  // Prevent event from propagating to the parent element
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        onCheckChange(id, newCheckedState);
    };

    const handleExpandToggle = async () => {
        if (!isExpanded) {
            // Fetch full invoice data when expanding
            try {
                const response = await fetch(`http://localhost:8080/api/v1/invoice/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setInvoiceDetails(data);
                } else {
                    console.error("Failed to fetch invoice details");
                }
            } catch (error) {
                console.error("Error fetching invoice details:", error);
            }
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <Button
                component="label"
                className="col-sm-12"
                style={{ background: "white", justifyContent: "flex-start", textAlign: "left", color: "black" }}
                variant="outlined"
                tabIndex={-1}
                type="button"
                onClick={handleExpandToggle}  // Click handler for expanding the details
            >
                <div className="d-flex w-100">
                    {isChecked ? (
                        <CheckBoxIcon onClick={handleCheckToggle} /> // Checkbox icon with click handler
                    ) : (
                        <CheckBoxOutlineBlankIcon onClick={handleCheckToggle} /> // Blank checkbox icon with click handler
                    )}
                    <div className="col-2">{serial}</div>
                    <div className="col-4">{companyName}</div>
                    <div className="col-3">{issueDate}</div>
                    <div className="col-2">{sum}€</div>
                </div>
            </Button>
            {isExpanded && invoiceDetails && (
                <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <h4>Invoice Details</h4>
                    {/* Display Seller Information */}
                    <p>
                        <strong>Seller:</strong> {invoiceDetails.seller.name}, {invoiceDetails.seller.address},
                        Company Code: {invoiceDetails.seller.companyCode}, VAT Code: {invoiceDetails.seller.companyVATCode}
                    </p>
                    {/* Display Buyer Information */}
                    <p>
                        <strong>Buyer:</strong> {invoiceDetails.buyer.name}, {invoiceDetails.buyer.address},
                        Company Code: {invoiceDetails.buyer.companyCode}, VAT Code: {invoiceDetails.buyer.companyVATCode}
                    </p>
                    <p><strong>Issued By:</strong> {invoiceDetails.issuedBy}</p>

                    <h5>Products</h5>
                    <ul>
                        {invoiceDetails.products.map((product, index) => {
                            const totalSum = product.quantity * product.unitPrice + product.quantity * product.unitPrice * (product.vatPercent / 100);
                            return (
                                <li key={index}>
                                    <strong>Name:</strong> {product.name}, <strong>Unit of Measure:</strong> {product.unitOfMeasure}, <strong>Quantity:</strong> {product.quantity},
                                    <strong> Unit Price:</strong> {product.unitPrice}€, <strong>VAT Percent:</strong> {product.vatPercent}%, <strong>Total Sum:</strong> {totalSum.toFixed(2)}€
                                </li>
                            );
                        })}
                    </ul>
                    <p>
                        <strong>Total Invoice Sum:</strong> {invoiceDetails.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice + product.quantity * product.unitPrice * (product.vatPercent / 100)), 0).toFixed(2)}€
                    </p>
                </div>
            )}
        </div>
    );
}
