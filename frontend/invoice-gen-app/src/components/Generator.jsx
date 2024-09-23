import {Button} from "@mui/material";
import ImageUpload from "./buttons/ImageUpload.jsx";
import GenData from "./GenData.jsx";
import {useEffect, useState} from "react";
import InfoInputs from "./InfoInputs.jsx";
import GenerateBtn from "./buttons/GenerateBtn.jsx";
import SaveBtn from "./buttons/SaveBtn.jsx";

export default function Generator() {
    const [components, setComponents] = useState([<GenData index={0} key={0} sendDataToParent={handleProductInputs} />]);

    const [logo, setLogo] = useState();

    const [fieldInputs, setFieldInputs] = useState([
        {
            productDataObj: [
                { key: "0", field1: "", field2: "", field3: "", field4: "", field5: "" }
            ],
            infoInputsObj: {
                serial: "",
                issueDate: "",
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
            }
        }
    ]);

// Handle changes in product inputs for the first object in the array
    function handleProductInputs(inputID, value, index) {
        setFieldInputs(prevArray => {
            // Always update the first object (index 0)
            const updatedArray = [...prevArray];
            const updatedProductData = [...updatedArray[0].productDataObj];
            updatedProductData[index] = { ...updatedProductData[index], [inputID]: value };
            updatedArray[0] = { ...updatedArray[0], productDataObj: updatedProductData };
            return updatedArray;
        });
    }

// Handle changes in title inputs for the first object in the array
    const handleTitleInputs = (id, value) => {
        setFieldInputs(prevArray => {
            // Always update the first object (index 0)
            const updatedArray = [...prevArray];
            const updatedInfoInputsObj = {
                ...updatedArray[0].infoInputsObj,
                [id]: value
            };
            updatedArray[0] = {
                ...updatedArray[0],
                infoInputsObj: updatedInfoInputsObj
            };
            return updatedArray;
        });
    };

    // Handle logo input
    const handleLogo = (newLogo) => {
        setLogo(newLogo);
    };

    // Add a new product input component
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

            setFieldInputs(prevArray => {
                const updatedArray = [...prevArray];
                const updatedProductData = [
                    ...updatedArray[0].productDataObj,
                    {
                        key: updatedArray[0].productDataObj.length.toString(),
                        field1: "", field2: "", field3: "", field4: "", field5: ""
                    }
                ];
                updatedArray[0] = { ...updatedArray[0], productDataObj: updatedProductData };
                return updatedArray;
            });
        }
    };

// Remove the last product input component
    const removeComponent = () => {
        if (components.length > 1) {
            setComponents(prevComponents => prevComponents.slice(0, -1));

            setFieldInputs(prevArray => {
                const updatedArray = [...prevArray];
                const updatedProductData = updatedArray[0].productDataObj.slice(0, -1);
                updatedArray[0] = { ...updatedArray[0], productDataObj: updatedProductData };
                return updatedArray;
            });
        }
    };

    // Handle effects or debugging purposes if necessary
    useEffect(() => {
        console.log("Updated Product Data:", fieldInputs[0].productDataObj);
    }, [fieldInputs]);

    return (
        <div className="container main">
            <div className="form container col-sm-10">
                <ImageUpload sendDataToParent={handleLogo}/>

                <div className="second-row container">
                    <div className="row">
                        <div className="col-sm-4">
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"serial"}
                                        placeHldr={"Serija XXX Nr. 01"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"issueDate"} placeHldr={"MMMM-mm-dd"}/>
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
                            <h3>Pirkėjas:</h3>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerName"}
                                        placeHldr={"Įmonės pavadinimas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerAddress"} placeHldr={"Adresas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerCmpnyCode"}
                                        placeHldr={"Įmonės kodas"}/>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"buyerTaxCode"}
                                        placeHldr={"PVM mokėtojo kodas"}/>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="contained"
                    color="success"
                    style={{marginLeft: "15px", marginBottom: "10px"}}
                    onClick={addComponent}
                >
                    +
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    style={{marginBottom: "10px"}}
                    onClick={removeComponent}
                >
                    -
                </Button>

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

                <div className="name-container container">
                    <div className="name row col-sm-4">
                        <div>
                            <p>Sąskaitą išrašė:</p>
                            <InfoInputs sendDataToParent={handleTitleInputs} id={"issuedBy"}
                                        placeHldr={"Vardas Pavardė"}/>
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
                    <div className="row" style={{justifyContent: "center", marginBottom: "10px"}}>
                        <GenerateBtn style={{margin: '10px', background: "#6482AD"}}
                                     fieldInputsArray={fieldInputs} logo={logo} />
                    </div>
                </div>
            </div>
        </div>
    );
}
