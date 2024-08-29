import {Button} from "@mui/material";
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import React from "react";

export default function GenerateBtn({sendToParentData}) {
    return (
        <Button component="label"
                variant="contained"
                style={{margin:'10px', background : "#6482AD"}}
                tabIndex={-1}
                startIcon={<ThreeSixtyIcon style={{color:'lime'}}/>}
                type="button"
                onClick={sendToParentData}>Generuoti</Button>
    )
}