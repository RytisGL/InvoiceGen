import { Button } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import React from "react";
import {saveInvoice} from "../../utils/Utils.js";

export default function SaveBtn({ fieldInputs }) {
    return (
        <Button
            component="label"
            style={{ margin: '10px', background: "#6482AD" }}
            variant="contained"
            tabIndex={-1}
            onClick={() => saveInvoice(fieldInputs)}
            startIcon={<CreateIcon />}
            type="button"
        >
            Išsaugoti
        </Button>
    );
}
