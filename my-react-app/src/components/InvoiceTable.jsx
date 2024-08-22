import React, { useState } from 'react';
import InvoiceRow from './InvoiceRow';

const InvoiceTable = () => {
    const [rows, setRows] = useState([{ id: Date.now(), description: '', quantity: 0, price: 0, total: 0 }]);

    const handleRowChange = (index, row) => {
        const updatedRows = [...rows];
        updatedRows[index] = row;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { id: Date.now(), description: '', quantity: 0, price: 0, total: 0 }]);
    };

    const deleteRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    };

    const calculateTotal = () => {
        return rows.reduce((acc, row) => acc + row.total, 0);
    };

    return (
        <div>
            <table border="1">
                <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, index) => (
                    <InvoiceRow
                        key={row.id}
                        index={index}
                        row={row}
                        onRowChange={handleRowChange}
                        onDeleteRow={deleteRow}
                    />
                ))}
                </tbody>
            </table>
            <button onClick={addRow}>Add Row</button>
            <h3>Total: ${calculateTotal()}</h3>
        </div>
    );
};

export default InvoiceTable;
