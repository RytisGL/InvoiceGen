import { jsPDF } from "jspdf";
import axios from "axios";

export function numberToWordsInLithuanian(number) {
    const units = ['nulis', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni'];
    const teens = ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika'];
    const tens = ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt'];
    const hundreds = ['', 'šimtas', 'du šimtai', 'trys šimtai', 'keturi šimtai', 'penki šimtai', 'šeši šimtai', 'septyni šimtai', 'aštuoni šimtai', 'devyni šimtai'];
    const thousands = ['tūkstantis', 'tūkstančiai', 'tūkstančių'];

    const [integerPart, fractionalPart] = number.toFixed(2).split('.').map(Number);

    function convertThreeDigitNumber(num) {
        const hundred = Math.floor(num / 100);
        const ten = Math.floor((num % 100) / 10);
        const unit = num % 10;

        let result = '';
        if (hundred > 0) {
            result += hundreds[hundred] + ' ';
        }
        if (ten === 1) {
            result += teens[unit];
        } else {
            if (ten > 0) {
                result += tens[ten] + ' ';
            }
            if (unit > 0) {
                result += units[unit];
            }
        }
        return result.trim();
    }

    function convertToWords(num) {
        if (num === 0) return units[0];

        let result = '';
        const thousandsPart = Math.floor(num / 1000);
        const remainderPart = num % 1000;

        if (thousandsPart > 0) {
            result += convertThreeDigitNumber(thousandsPart) + ' ';
            if (thousandsPart < 10 || thousandsPart > 20) {
                result += thousandsPart === 1 ? thousands[0] : thousands[1];
            } else {
                result += thousandsPart === 1 ? thousands[0] : thousands[2];
            }
            result += ' ';
        }

        if (remainderPart > 0) {
            result += convertThreeDigitNumber(remainderPart);
        }

        return result.trim();
    }

    const integerWords = convertToWords(integerPart);
    const fractionalWords = fractionalPart > 0 ? convertToWords(fractionalPart) : '';

    let result = integerWords;

    if (integerWords.endsWith('s') && integerWords.charAt(integerWords.length - 3) !== 't') {
        result += ' euras';
    } else if (integerWords.endsWith('i') || integerWords.endsWith('u')) {
        result += ' eurai';
    } else {
        result += ' eurų';
    }

    if (fractionalWords) {
        if (fractionalWords.endsWith('s')) {
            result += ` ir ${fractionalWords} centas`;
        } else if (fractionalWords.endsWith('i') || fractionalWords.endsWith('u')) {
            result += ` ir ${fractionalWords} centai`;
        } else {
            result += ` ir ${fractionalWords} centų`;
        }
    }

    return result;
}

// Generate single PDF
export function generateSingle(fieldInputs, logo) {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    if (logo !== undefined) {
        doc.addImage(logo, 'PNG', 15, 10, 30, 20);
    }

    // Set the title
    doc.setFontSize(22);
    doc.setFont("arialuni");
    const title = 'PVM Sąskaita-faktūra';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, centerX - titleWidth / 2, 19);

    // Set serial and date centered below the title
    doc.setFontSize(8);

    console.log(fieldInputs);

    const serialText = 'Serija: ' + fieldInputs.infoInputsObj.serial;
    const dateText = 'Data: ' + fieldInputs.infoInputsObj.issueDate;
    const serialTextWidth = doc.getTextWidth(serialText);
    const dateTextWidth = doc.getTextWidth(dateText);

    doc.text(serialText, centerX - serialTextWidth / 2, 25);
    doc.text(dateText, centerX - dateTextWidth / 2, 30);

    doc.setFontSize(9);

    // Seller Information
    doc.text('Pardavėjas:', 20, 45);
    doc.text(fieldInputs.infoInputsObj.sellerName, 20, 50);
    doc.text(fieldInputs.infoInputsObj.sellerAddress, 20, 55);
    doc.text(fieldInputs.infoInputsObj.sellerCmpnyCode, 20, 60);
    doc.text(fieldInputs.infoInputsObj.sellerTaxCode, 20, 65);

    // Buyer Information
    doc.text('Pirkėjas:', 120, 45);
    doc.text(fieldInputs.infoInputsObj.buyerName, 120, 50);
    doc.text(fieldInputs.infoInputsObj.buyerAddress, 120, 55);
    doc.text(fieldInputs.infoInputsObj.buyerCmpnyCode, 120, 60);
    doc.text(fieldInputs.infoInputsObj.buyerTaxCode, 120, 65);

    // Table Setup
    const startY = 80; // Starting Y position for table
    const rowHeight = 8; // Reduced height to fit text better
    const padding = 1.5; // Padding to adjust text within the row

    const totalWidth = pageWidth - 20; // Full table width
    const colWidths = {
        nr: 10,
        pavadinimas: totalWidth * 0.38,  // Increased width for Pavadinimas
        matVnt: totalWidth * 0.066, // Reduced width for Mat
        kiekis: totalWidth * 0.07,
        kaina: totalWidth * 0.07,
        suma: totalWidth * 0.12,
        pvmTarifas: totalWidth * 0.08, // Increased width for PVM%
        pvmSuma: totalWidth * 0.07,
        total: totalWidth * 0.108 // Reduced width for Total
    };

    const colX = {
        nr: 10,
        pavadinimas: 10 + colWidths.nr,
        matVnt: 10 + colWidths.nr + colWidths.pavadinimas,
        kiekis: 10 + colWidths.nr + colWidths.pavadinimas + colWidths.matVnt,
        kaina: 10 + colWidths.nr + colWidths.pavadinimas + colWidths.matVnt + colWidths.kiekis,
        suma: 10 + colWidths.nr + colWidths.pavadinimas + colWidths.matVnt + colWidths.kaina + colWidths.kiekis,
        pvmTarifas: 10 + colWidths.nr + colWidths.pavadinimas + colWidths.matVnt + colWidths.kiekis + colWidths.kaina + colWidths.suma,
        pvmSuma: 10 + colWidths.nr + colWidths.pavadinimas + colWidths.matVnt + colWidths.kiekis + colWidths.kaina + colWidths.suma + colWidths.pvmTarifas,
        total: 10 + colWidths.nr + colWidths.pavadinimas + colWidths.matVnt + colWidths.kiekis + colWidths.kaina + colWidths.suma + colWidths.pvmTarifas + colWidths.pvmSuma
    };

    // Highlight Table Headers
    doc.setFontSize(10);
    doc.setFillColor(200, 200, 200); // Light gray background for headers
    doc.rect(10, startY, pageWidth - 20, rowHeight, 'F');

    // Centered Table Headers
    const headers = {
        nr: 'Nr.',
        pavadinimas: 'Pavadinimas',
        matVnt: 'Mat',
        kiekis: 'Kiekis',
        kaina: 'Kaina €',
        suma: 'Suma €',
        pvmTarifas: 'PVM %',
        pvmSuma: 'PVM €',
        total: 'Suma €'
    };

    Object.keys(colX).forEach(key => {
        const text = headers[key];
        const textWidth = doc.getTextWidth(text);
        doc.text(text, colX[key] + colWidths[key] / 2 - textWidth / 2, startY + rowHeight - padding);
    });

    // Reset font style for table rows
    doc.setFontSize(9);

    // Table Rows
    let yOffset = startY + rowHeight;
    let totalSum = 0;

    // Use product data from fieldInputs
    fieldInputs.productDataObj.forEach((row, index) => {
        const quantity = parseFloat(row.field3); // Kiekis
        const price = parseFloat(row.field4); // Kaina
        const pvmRate = parseFloat(row.field5) / 100; // PVM tarifas as percentage

        // Calculate Suma, PVM suma, and Total
        const suma = quantity * price;
        const pvmSum = suma * pvmRate;
        const total = suma + pvmSum;

        totalSum += total;

        // Add table row, centering each field
        const rowValues = [
            (index + 1).toString(), row.field1, row.field2,
            row.field3, row.field4, suma.toFixed(2),
            row.field5, pvmSum.toFixed(2), total.toFixed(2)
        ];

        Object.keys(colX).forEach((key, i) => {
            const text = rowValues[i];
            console.log("key" + key);
            console.log("index" + i);
            console.log("here : " + text);
            const textWidth = doc.getTextWidth(text.toString());
            console.log("1----");
            doc.text(text.toString(), colX[key] + colWidths[key] / 2 - textWidth / 2, yOffset + rowHeight - padding);
            console.log("2----");
        });

        // Draw lines
        doc.line(10, yOffset, pageWidth - 10, yOffset); // Horizontal line
        yOffset += rowHeight;
    });

    // Draw the bottom border of the table
    doc.line(10, yOffset, pageWidth - 10, yOffset);

    // Vertical lines for the table (including top and right border)
    Object.values(colX).forEach(x => {
        doc.line(x, startY, x, yOffset); // Vertical lines
    });

    // Draw the rightmost vertical line (right border)
    doc.line(pageWidth - 10, startY, pageWidth - 10, yOffset);

    // Draw the top border of the table
    doc.line(10, startY, pageWidth - 10, startY);

    // Add "Suma:" and the calculated sum dynamically on the bottom right
    const sumaText = 'Suma: ' + totalSum.toFixed(2).toString() + ' €';
    const sumaTextWidth = doc.getTextWidth(sumaText);
    doc.text(sumaText, pageWidth - sumaTextWidth - 10, yOffset + 15);

    // Convert total sum to Lithuanian words
    const sumaWordsText = 'Suma žodžiais: ' + numberToWordsInLithuanian(totalSum);
    doc.text(sumaWordsText, 10, yOffset + 15);

    // Add "Sąskaitą išrašė:" 10 points above the "Kontaktinė informacija:" on the left side
    const issuedByText = 'Sąskaitą išrašė: ' + fieldInputs.infoInputsObj.issuedBy;
    doc.text(issuedByText, 10, pageHeight - 25);

    // Add "Kontaktinė informacija:" centered at the bottom, 10 points lower
    if (fieldInputs.infoInputsObj.contactInfo) {
        const contactText = 'Kontaktinė informacija: ' + fieldInputs.infoInputsObj.contactInfo;
        const contactTextWidth = doc.getTextWidth(contactText);
        doc.text(contactText, centerX - contactTextWidth / 2, pageHeight - 15);
    }

    // Save the document with a unique file name
    const fileName = `invoice_${fieldInputs.infoInputsObj.serial}_${fieldInputs.infoInputsObj.issueDate}.pdf`;
    doc.save(fileName);
}

// Generate PDFs for all objects in the array
export function generateAll(fieldInputsArray, logo) {
    fieldInputsArray.forEach(fieldInputs => generateSingle(fieldInputs, logo));
}

export async function saveInvoice(fieldInputs) {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        console.error("JWT Token not found");
        return;
    }

    const invoiceRequest = {
        serial: fieldInputs[0].infoInputsObj.serial,
        issueDate: fieldInputs[0].infoInputsObj.issueDate,
        issuedBy: fieldInputs[0].infoInputsObj.issuedBy,
        seller: {
            name: fieldInputs[0].infoInputsObj.sellerName,
            address: fieldInputs[0].infoInputsObj.sellerAddress,
            companyCode: fieldInputs[0].infoInputsObj.sellerCmpnyCode,
            companyVATCode: fieldInputs[0].infoInputsObj.sellerTaxCode,
        },
        buyer: {
            name: fieldInputs[0].infoInputsObj.buyerName,
            address: fieldInputs[0].infoInputsObj.buyerAddress,
            companyCode: fieldInputs[0].infoInputsObj.buyerCmpnyCode,
            companyVATCode: fieldInputs[0].infoInputsObj.buyerTaxCode,
        },
        productList: fieldInputs[0].productDataObj.map((item) => ({
            name: item.field1,
            unitOfMeasure: item.field2,
            quantity: item.field3,
            unitPrice: item.field4,
            vatPercent: item.field5,
        })),
    };

    try {
        const response = await axios.post("http://localhost:8080/api/v1/invoice", invoiceRequest, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        });
        console.log("Invoice created successfully:", response.data);
    } catch (error) {
        console.error("Error creating invoice:", error);
    }
}
