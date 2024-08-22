import React from 'react';
import InvoiceInput from './InvoiceInput';

const InvoiceRow = ({ index, row, onRowChange, onDeleteRow }) => {
    const handleChange = (field, value) => {
        const updatedRow = { ...row, [field]: value };
        updatedRow.total = updatedRow.quantity * updatedRow.price;
        onRowChange(index, updatedRow);
    };

    return (
        <tr>
            <td>
                <InvoiceInput
                    type="text"
                    value={row.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </td>
            <td>
                <InvoiceInput
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
                />
            </td>
            <td>
                <InvoiceInput
                    type="number"
                    value={row.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                />
            </td>
            <td>
                ${row.total.toFixed(2)}
            </td>
            <td>
                <button onClick={() => onDeleteRow(index)}>Delete</button>
            </td>
        </tr>
    );
};

export default InvoiceRow;