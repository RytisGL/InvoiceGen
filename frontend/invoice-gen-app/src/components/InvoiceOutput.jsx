import {Button} from "@mui/material";
import * as React from "react";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export default function InvoiceOutput({invoice, onCheckChange}) {
    const {serial, sellerName, issueDate, sum, id} = invoice;

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
        const jwtToken = localStorage.getItem('jwtToken');

        if (!isExpanded) {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/invoice/${id}`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`
                    }
                });
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
                style={{background: "white", color: "black", textTransform: "none"}}
                variant="outlined"
                tabIndex={-1}
                type="button"
                onClick={handleExpandToggle}
            >
                <div className="d-flex w-100">
                    {isChecked ? (
                        <CheckBoxIcon className="col-1" onClick={handleCheckToggle} style={{marginRight: "10px"}}/>
                    ) : (
                        <CheckBoxOutlineBlankIcon className="col-1" onClick={handleCheckToggle}
                                                  style={{marginRight: "10px"}}/>
                    )}
                    <div className="col-2" style={{textAlign: "left"}}>{serial}</div>
                    <div className="col-4" style={{textAlign: "left"}}>{sellerName}</div>
                    <div className="col-3" style={{textAlign: "left"}}>{issueDate}</div>
                    <div className="col-2" style={{textAlign: "left"}}>{sum}€</div>
                </div>
            </Button>
            {isExpanded && invoiceDetails && (
                <div style={{marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}>
                    <h4>Saskaitos detalės</h4>
                    <p>
                        <strong>Pardavėjas:</strong> {invoiceDetails.seller.name}, {invoiceDetails.seller.address},
                        Įm. kodas: {invoiceDetails.seller.companyCode}, PVM mokėtojo
                        kodas: {invoiceDetails.seller.companyVATCode}
                    </p>
                    <p>
                        <strong>Pirkėjas:</strong> {invoiceDetails.buyer.name}, {invoiceDetails.buyer.address},
                        Įm. kodas: {invoiceDetails.buyer.companyCode}, PVM mokėtojo
                        kodas: {invoiceDetails.buyer.companyVATCode}
                    </p>
                    <p><strong>Išrašė:</strong> {invoiceDetails.issuedBy}</p>

                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                        <thead>
                        <tr>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Pavadinimas</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Mat. vnt</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Kiekis</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Kaina (€)</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>PVM (%)</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>PVM suma (€)</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Suma (€)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoiceDetails.products.map((product, index) => {
                            const totalSum = product.quantity * product.unitPrice + product.vatAmount;
                            return (
                                <tr key={index}>
                                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{product.name}</td>
                                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{product.unitOfMeasure}</td>
                                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{product.quantity}</td>
                                    <td style={{
                                        border: '1px solid #ddd',
                                        padding: '8px'
                                    }}>{product.unitPrice.toFixed(2)}</td>
                                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{product.vatPercent}</td>
                                    <td style={{
                                        border: '1px solid #ddd',
                                        padding: '8px'
                                    }}>{product.vatAmount.toFixed(2)}</td>
                                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{totalSum.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    <p>
                        <strong>Totali
                            suma:</strong> {invoiceDetails.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice + product.quantity * product.unitPrice * (product.vatPercent / 100)), 0).toFixed(2)}€
                    </p>
                </div>
            )}
        </div>
    );
}
