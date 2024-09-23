import React from "react";
import { Button } from "@mui/material";
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import { generateAll } from '../../utils/Utils.js';

export default function GenerateBtn({ fieldInputsArray, logo, style, className, size }) {
    return (
        <Button
            size={size}
            className={className}
            component="label"
            variant="contained"
            style={style}
            tabIndex={-1}
            startIcon={<ThreeSixtyIcon />}
            type="button"
            onClick={() => generateAll(fieldInputsArray, logo)}
        >
            Generuoti
        </Button>
    );
}