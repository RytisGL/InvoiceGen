import { Button } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import React, { useContext } from "react";
import { saveInvoice } from "../../utils/Utils.js";
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

export default function SaveBtn({ fieldInputs, companyDetailsSaved, setIsUpdated }) {
    const { fetchUserDetails, checkJwtExpiration } = useContext(AuthContext);

    const handleSave = async () => {
        await checkJwtExpiration();
        await saveInvoice(fieldInputs);
        await fetchUserDetails(false);

        setIsUpdated(true);
    };

    return (
        <Button
            component="label"
            style={{ margin: '10px', background: "#6482AD" }}
            variant="contained"
            tabIndex={-1}
            onClick={handleSave}
            startIcon={<CreateIcon />}
            type="button"
            disabled={!companyDetailsSaved} // Disable based on companyDetailsSaved
        >
            Išsaugoti
        </Button>
    );
}
