import {Button} from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import React from "react";

export default function SaveBtn() {
    return (
        <Button component="label"
                style={{margin:'10px', background : "#6482AD"}}
                variant="contained"
                tabIndex={-1}
                startIcon={<CreateIcon style={{color : 'lime'}}/>}
                type="button"
                >Išsaugoti</Button>
    )
}