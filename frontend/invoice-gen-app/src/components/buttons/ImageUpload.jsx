import React, {useState, useRef} from 'react';
import Placeholder from '../../assets/PlaceHolder.png';
import {Button, styled} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function ImageUpload({sendDataToParent}) {
    const [avatarURL, setAvatarURL] = useState(Placeholder);
    const fileUploadRef = useRef();

    const handleImageUpload = (event) => {
        event.preventDefault();
        fileUploadRef.current.click();
    };

    const uploadImageDisplay = () => {
        const uploadedFile = fileUploadRef.current.files[0];
        if (uploadedFile) {
            const newAvatarURL = URL.createObjectURL(uploadedFile);
            setAvatarURL(newAvatarURL);
            sendDataToParent(newAvatarURL);
        }
    };

    return (
        <div className="relative h-96 w-96 m-8">
            <img src={avatarURL} alt="Avatar" className="h-20 w-20 rounded-full" style={{marginTop : "15px"}}/>
            <form id="form" encType="multipart/form-data">
                <Button
                    component="label"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon/>}
                    type="button"
                    onClick={handleImageUpload}
                    style={{marginLeft : "25px", marginTop : "5px", background : "#6482AD"}}
                >
                    LOGO
                    <VisuallyHiddenInput type="file"/>
                </Button>
                <input
                    type="file"
                    id="file"
                    ref={fileUploadRef}
                    onChange={uploadImageDisplay}
                    hidden
                />
            </form>
        </div>
    );
}

export default ImageUpload;
