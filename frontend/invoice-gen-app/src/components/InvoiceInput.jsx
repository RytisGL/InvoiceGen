import React from 'react';

const InvoiceInput = ({ type, value, onChange }) => {
    return <input type={type} value={value} onChange={onChange} />;
};

export default InvoiceInput;