import ImageUpload from "./ImageUpload.jsx";
import GenData from "./GenData.jsx"
import {useEffect, useState} from "react";
import {jsPDF} from "jspdf";
import InfoInputs from "./InfoInputs.jsx";
import {Button} from "@mui/material";
import GenerateBtn from "./GenerateBtn.jsx";
import SaveBtn from "./SaveBtn.jsx";

export default function Generator() {
    const [components, setComponents] = useState([<GenData index={0} key={0} sendDataToParent={handleProductInputs}/>]);
    const [data, setData] = useState([{
        key: "0",
        field1: "", field2: "", field3: "", field4: "", field5: ""
    }]);
    const [logo, setLogo] = useState();
    const [titleInputs, setTitleInputs] = useState({
        serial: "",
        date: "",
        sellerName: "",
        sellerAddress: "",
        sellerCmpnyCode: "",
        sellerTaxCode: "",
        buyerName: "",
        buyerAddress: "",
        buyerCmpnyCode: "",
        buyerTaxCode: "",
        issuedBy: "",
        contactInfo: ""
    });

    useEffect(() => {
        console.log("Updated Data:", data);
    }, [data]);

    function handleProductInputs(inputID, value, index) {
        setData(prevData => {
            const updatedData = [...prevData];
            updatedData[index] = {...updatedData[index], [inputID]: value};
            return updatedData;
        });
    }

    const addComponent = () => {
        if (components.length < 15) {
            setComponents(prevComponents => {
                const newComponentIndex = prevComponents.length;

                const newComponent = (
                    <GenData
                        key={newComponentIndex}
                        index={newComponentIndex}
                        sendDataToParent={handleProductInputs}
                    />
                );

                return [...prevComponents, newComponent];
            });

            setData(prevData => {
                return [
                    ...prevData,
                    {
                        key: prevData.length,
                        field1: "", field2: "", field3: "", field4: "", field5: ""
                    }
                ];
            });
        }
    }

    function removeComponent() {
        if (components.length > 1) {
            setComponents(prevComp => {
                const newComp = [...prevComp];
                newComp.pop();
                return newComp;
            });
        }

        if (data.length > 1) {
            setData(prevData => {
                const newData = [...prevData];
                newData.pop();
                return newData;
            });
        }
    }

    function handleLogo(logo) {
        setLogo(logo);
    }

    function handleTitleInputs(newId, newValue) {
        setTitleInputs((prevTitleInputs) => ({
            ...prevTitleInputs,
            [newId]: newValue,
        }));
    }

    function generate() {
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
        const title = 'PVM sąskaita faktūra';
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, centerX - titleWidth / 2, 19);

        // Set serial and date centered below the title
        doc.setFontSize(8);

        const serialText = 'Serija: ' + titleInputs.serial;
        const dateText = 'Data: ' + titleInputs.date;
        const serialTextWidth = doc.getTextWidth(serialText);
        const dateTextWidth = doc.getTextWidth(dateText);

        doc.text(serialText, centerX - serialTextWidth / 2, 25);
        doc.text(dateText, centerX - dateTextWidth / 2, 30);

        doc.setFontSize(9);

        // Seller Information
        doc.text('Pardavėjas:', 20, 45);
        doc.text(titleInputs.sellerName, 20, 50);
        doc.text(titleInputs.sellerAddress, 20, 55);
        doc.text(titleInputs.sellerCmpnyCode, 20, 60);
        doc.text(titleInputs.sellerTaxCode, 20, 65);

        // Buyer Information
        doc.text('Pirkėjas:', 120, 45);
        doc.text(titleInputs.buyerName, 120, 50);
        doc.text(titleInputs.buyerAddress, 120, 55);
        doc.text(titleInputs.buyerCmpnyCode, 120, 60);
        doc.text(titleInputs.buyerTaxCode, 120, 65);

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
            kaina: 'Kaina',
            suma: 'Suma',
            pvmTarifas: 'PVM%',
            pvmSuma: 'PVM',
            total: 'Total'
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

        data.forEach((row, index) => {
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
                const textWidth = doc.getTextWidth(text);
                doc.text(text, colX[key] + colWidths[key] / 2 - textWidth / 2, yOffset + rowHeight - padding);
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
        const sumaText = 'Suma: ' + totalSum.toFixed(2).toString();
        const sumaTextWidth = doc.getTextWidth(sumaText);
        doc.text(sumaText, pageWidth - sumaTextWidth - 10, yOffset + 15);

        // Convert total sum to Lithuanian words
        const sumaWordsText = 'Suma žodžiais: ' + numberToWordsInLithuanian(totalSum);
        doc.text(sumaWordsText, 10, yOffset + 15);

        // Add "Sąskaitą išrašė:" 10 points above the "Kontaktinė informacija:" on the left side
        const issuedByText = 'Sąskaitą išrašė: ' + titleInputs.issuedBy;
        doc.text(issuedByText, 10, pageHeight - 25);

        // Add "Kontaktinė informacija:" centered at the bottom, 10 points lower
        const contactInfoText = 'Kontaktinė informacija: ' + titleInputs.contactInfo;
        const contactInfoTextWidth = doc.getTextWidth(contactInfoText);
        doc.text(contactInfoText, centerX - contactInfoTextWidth / 2, pageHeight - 10);

        // Save the PDF
        doc.save('invoice.pdf');
    }

    function numberToWordsInLithuanian(number) {
        const units = ['nulis', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni'];
        const teens = ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika'];
        const tens = ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt'];
        const hundreds = ['', 'šimtas', 'du šimtai', 'trys šimtai', 'keturi šimtai', 'penki šimtai', 'šeši šimtai', 'septyni šimtai', 'aštuoni šimtai', 'devyni šimtai'];
        const thousands = ['tūkstantis', 'tūkstančiai', 'tūkstančių'];

        // Split the number into integer and fractional parts
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

        // Handle Euro endings based on the last character of the integerWords
        if (integerWords.endsWith('s') && integerWords.charAt(integerWords.length - 3) !== 't') {
            result += ' euras';
        } else if (integerWords.endsWith('i') || integerWords.endsWith('u')) {
            result += ' eurai';
        } else {
            result += ' eurų';
        }

        // Handle Cent endings based on the last character of the fractionalWords
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

    return (
        <div className="container main">
            <div className="form container col-sm-10">
                <ImageUpload sendDataToParent={handleLogo}/>
                <div className="second-row container">
                    <div className="row">
                        <div className="col-sm-4">
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"serial"}
                                        placeHldr={"Serija XXX Nr. 01"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"date"} placeHldr={"Data"}/>
                        </div>
                    </div>
                    <div className="flex row">
                        <div className="col-sm-6">
                            <h3>Pardavėjas:</h3>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"sellerName"}
                                        placeHldr={"Įmonės pavadinimas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"sellerAddress"}
                                        placeHldr={"Adresas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"sellerCmpnyCode"}
                                        placeHldr={"Įmonės kodas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"sellerTaxCode"}
                                        placeHldr={"PVM mokėtojo kodas"}/>
                        </div>
                        <div className="col-sm-6">
                            <h3>Pardavėjas:</h3>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerName"}
                                        placeHldr={"Įmonės pavadinimas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerAddress"}
                                        placeHldr={"Adresas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerCmpnyCode"}
                                        placeHldr={"Įmonės kodas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerTaxCode"}
                                        placeHldr={"PVM mokėtojo kodas"}/>
                        </div>
                    </div>
                </div>
                <div className="forth-row container">
                    <div className="row">
                        <div className="col-sm-4">
                            <p>Pavadinimas</p>
                        </div>
                        <div className="col-sm-2">
                            <p>Mat. vnt.</p>
                        </div>
                        <div className="col-sm-2">
                            <p>Kiekis</p>
                        </div>
                        <div className="col-sm-2">
                            <p>Kaina</p>
                        </div>
                        <div className="col-sm-2">
                            <p>PVM tarifas</p>
                        </div>
                    </div>
                </div>
                <div className="data-row container">
                    {components}
                </div>
                <Button type="button" variant="contained" color="success" style={{marginLeft: "15px"}}
                        onClick={addComponent}>
                    +
                </Button>
                <Button variant="contained" color="error" onClick={removeComponent}>
                    -
                </Button>
                <div className="name-container container">
                    <div className="name row col-sm-4">
                        <div>
                            <p>Sąskaitą išrašė:</p>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"issuedBy"}
                                        placeHldr={"Vardas Vardaitis"}/>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row" style={{justifyContent: "center"}}>
                        <div className="col-sm-4">
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"contactInfo"}
                                        placeHldr={"Kontaktinė informacija (Nebūtina)"}/>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row" style={{justifyContent: "center", marginBottom : "10px"}}>
                        <GenerateBtn sendToParentData={generate}/>
                        <SaveBtn/>
                    </div>
                </div>
            </div>
        </div>
    )
}


