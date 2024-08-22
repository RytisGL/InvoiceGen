import ImageUpload from "./ImageUpload.jsx";
import GenData from "./GenData.jsx"
import {useEffect, useState} from "react";
import {jsPDF} from "jspdf";
import InfoInputs from "./InfoInputs.jsx";
import {Button} from "@mui/material";


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
        buyerTaxCode: ""
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
        if (components.length < 5) {
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

        // Set a font that supports UTF-8 (including Lithuanian letters)
        doc.setFont("helvetica", "normal");

        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        if (logo !== undefined) {
            doc.addImage(logo, 'PNG', 15, 10, 30, 20);
        }

        // Set the title
        doc.setFontSize(22);
        const title = 'PVM sąskaita faktūra';
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, centerX - titleWidth / 2, 30);

        // Set serial and date centered below the title
        doc.setFontSize(12);

        const serialText = 'Serija: ' + titleInputs.serial;
        const dateText = 'Data: ' + titleInputs.date;
        const serialTextWidth = doc.getTextWidth(serialText);
        const dateTextWidth = doc.getTextWidth(dateText);

        doc.text(serialText, centerX - serialTextWidth / 2, 40);
        doc.text(dateText, centerX - dateTextWidth / 2, 50);

        // Seller Information
        doc.text('Pardavėjas:', 20, 70);
        doc.text(titleInputs.sellerName, 20, 80);
        doc.text(titleInputs.sellerAddress, 20, 90);
        doc.text(titleInputs.sellerCmpnyCode, 20, 100);
        doc.text(titleInputs.sellerTaxCode, 20, 110);

        // Buyer Information
        doc.text('Pirkėjas:', 120, 70);
        doc.text(titleInputs.buyerName, 120, 80);
        doc.text(titleInputs.buyerAddress, 120, 90);
        doc.text(titleInputs.buyerCmpnyCode, 120, 100);
        doc.text(titleInputs.buyerTaxCode, 120, 110);

        // Table Setup
        const startY = 130; // Starting Y position for table
        const rowHeight = 10; // Height of each table row
        const padding = 2; // Padding to move content away from dividing lines

        const totalWidth = pageWidth - 20; // Full table width
        const colWidths = {
            nr: 10,
            pavadinimas: totalWidth * 0.2,
            matVnt: totalWidth * 0.1,
            kiekis: totalWidth * 0.07,
            kaina: totalWidth * 0.07,
            suma: totalWidth * 0.12,
            pvmTarifas: totalWidth * 0.12 * 1.2,
            pvmSuma: totalWidth * 0.07,
            total: totalWidth * 0.15
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
        Object.keys(colX).forEach(key => {
            const text = key === 'pvmSuma' ? 'PVM' : key.charAt(0).toUpperCase() + key.slice(1);
            const textWidth = doc.getTextWidth(text);
            doc.text(text, colX[key] + colWidths[key] / 2 - textWidth / 2, startY + 7);
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
                row.field5 + '%', pvmSum.toFixed(2), total.toFixed(2)
            ];

            Object.keys(colX).forEach((key, i) => {
                const text = rowValues[i];
                const textWidth = doc.getTextWidth(text);
                doc.text(text, colX[key] + colWidths[key] / 2 - textWidth / 2, yOffset + 7 - padding);
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
                result += thousandsPart === 1 ? thousands[0] : thousands[1] + ' ';
            }

            if (remainderPart > 0) {
                result += convertThreeDigitNumber(remainderPart);
            }

            return result.trim();
        }

        const integerWords = convertToWords(integerPart);
        const fractionalWords = fractionalPart > 0 ? convertToWords(fractionalPart) : '';

        let result = integerWords;
        if (fractionalWords) {
            result += ` ir ${fractionalWords} centai`;
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
                        <div className="col-sm-4">
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
                        <div className="col-sm-4">
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
                        <div style={{marginLeft: "20px"}}>
                            <p>Sąskaitą išrašė:</p>
                            <div className="form-group">
                                <input type="text" className="form-control form-control-sm"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row" style={{justifyContent: "center"}}>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <input type="text" className="form-control form-control-sm"
                                       placeholder="Kontaktinė informacija (Nebūtina)"/>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={generate}>Generuoti</button>
            </div>
        </div>
    )
}


