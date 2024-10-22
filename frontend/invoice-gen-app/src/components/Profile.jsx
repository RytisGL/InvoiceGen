import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { TextField, Button, Grid, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { loadImageFromLocalStorage } from "../utils/Utils.js";
import PlaceHolderImage from '../assets/PlaceHolder.png'; // Import the placeholder image

const Profile = () => {
    const {
        contextFieldInputs,
        fetchUserLogo,
        fetchUserDetails,
        logout,
        checkJwtExpiration
    } = useContext(AuthContext);

    const [fieldInputs, setFieldInputs] = useState(contextFieldInputs);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [logo, setLogo] = useState(null); // State to manage selected logo file
    const [displayedLogo, setDisplayedLogo] = useState(loadImageFromLocalStorage() || PlaceHolderImage); // State for displayed logo
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State to control confirmation dialog

    // Sync field inputs with context
    useEffect(() => {
        setFieldInputs(contextFieldInputs);
    }, [contextFieldInputs]);

    // When the `logo` state changes (user selects a file), update the displayed logo.
    useEffect(() => {
        if (logo) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setDisplayedLogo(e.target.result); // Display selected image immediately
            };
            reader.readAsDataURL(logo);
        }
    }, [logo]);

    const handleInfoChange = async () => {
        await checkJwtExpiration();
        try {
            await axios.put('http://localhost:8080/api/v1/user/info', {info : fieldInputs.infoInputsObj.contactInfo}, {
                headers: {Authorization: `Bearer ${localStorage.getItem('jwtToken')}`}
            });
            await fetchUserDetails(true);
            alert('Info updated successfully');
        } catch (error) {
            console.error('Error updating info', error);
        }
    };

    const handlePasswordChange = async () => {
        await checkJwtExpiration();
        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await axios.put('http://localhost:8081/api/v1/user/password/change', {
                oldPassword,
                newPassword
            }, {
                headers: {Authorization: `Bearer ${localStorage.getItem('jwtToken')}`}
            });
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            alert('Password changed successfully');
        } catch (error) {
            console.error('Error changing password', error);
        }
    };

    const handleCompanyDetailsChange = async () => {
        await checkJwtExpiration();
        try {
            await axios.put('http://localhost:8080/api/v1/user/company', {
                name: fieldInputs.infoInputsObj.sellerName,
                address: fieldInputs.infoInputsObj.sellerAddress,
                companyCode: fieldInputs.infoInputsObj.sellerCmpnyCode,
                companyVATCode: fieldInputs.infoInputsObj.sellerTaxCode
            }, {
                headers: {Authorization: `Bearer ${localStorage.getItem('jwtToken')}`}
            });
            await fetchUserDetails(true);
            alert('Company details updated successfully');
        } catch (error) {
            console.error('Error updating company details', error);
        }
    };

    const handleLogoUpload = async (e) => {
        e.preventDefault();
        await checkJwtExpiration();

        if (!logo) {
            alert('Please select a logo file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('logo', logo);

        try {
            const response = await axios.put('http://localhost:8080/api/v1/user/logo', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const uploadedLogoUrl = response.data.logoUrl;

            // Save the uploaded logo URL to localStorage for future sessions
            localStorage.setItem('userLogo', uploadedLogoUrl);

            await fetchUserLogo(localStorage.getItem('jwtToken'));
            alert('Logo uploaded successfully');
        } catch (error) {
            console.error('Error uploading logo', error);
        }
    };

    const handleLogoChange = (e) => {
        setLogo(e.target.files[0]); // Update logo state with selected file
    };

    const handleDeleteAccount = async () => {
        await checkJwtExpiration();
        try {
            await axios.delete('http://localhost:8080/api/v1/user', {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
            });
            alert('Account deleted successfully');
            setOpenConfirmDialog(false);
            logout();
        } catch (error) {
            console.error('Error deleting account', error);
            alert('Error deleting account');
        }
    };

    const handleOpenDialog = () => {
        setOpenConfirmDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenConfirmDialog(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Profile Settings</Typography>

            <Grid container spacing={2}>
                {/* User Info */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="User Info"
                        value={fieldInputs.infoInputsObj.contactInfo}
                        onChange={(e) =>
                            setFieldInputs({
                                ...fieldInputs,
                                infoInputsObj: {
                                    ...fieldInputs.infoInputsObj,
                                    contactInfo: e.target.value,
                                },
                            })}
                    />
                    <Button variant="contained" color="primary" onClick={handleInfoChange} sx={{mt: 2, background : "#6482AD"}}>
                        Update Info
                    </Button>
                </Grid>

                {/* Password Change */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Change Password</Typography>
                    <TextField
                        fullWidth
                        label="Old Password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{mt: 2}}
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        sx={{mt: 2}}
                    />
                    <Button variant="contained" color="primary" onClick={handlePasswordChange} sx={{mt: 2, background : "#6482AD"}}>
                        Change Password
                    </Button>
                </Grid>

                {/* Company Details */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Company Details</Typography>

                    <TextField
                        fullWidth
                        label="Company Name"
                        value={fieldInputs.infoInputsObj.sellerName}
                        onChange={(e) =>
                            setFieldInputs({
                                ...fieldInputs,
                                infoInputsObj: {
                                    ...fieldInputs.infoInputsObj,
                                    sellerName: e.target.value,
                                },
                            })
                        }
                        sx={{mt: 2}}
                    />

                    <TextField
                        fullWidth
                        label="Company Address"
                        value={fieldInputs.infoInputsObj.sellerAddress}
                        onChange={(e) =>
                            setFieldInputs({
                                ...fieldInputs,
                                infoInputsObj: {
                                    ...fieldInputs.infoInputsObj,
                                    sellerAddress: e.target.value,
                                },
                            })
                        }
                        sx={{mt: 2}}
                    />

                    <TextField
                        fullWidth
                        label="Company Code"
                        value={fieldInputs.infoInputsObj.sellerCmpnyCode}
                        onChange={(e) =>
                            setFieldInputs({
                                ...fieldInputs,
                                infoInputsObj: {
                                    ...fieldInputs.infoInputsObj,
                                    sellerCmpnyCode: e.target.value,
                                },
                            })
                        }
                        sx={{mt: 2}}
                    />

                    <TextField
                        fullWidth
                        label="Company VAT Code"
                        value={fieldInputs.infoInputsObj.sellerTaxCode}
                        onChange={(e) =>
                            setFieldInputs({
                                ...fieldInputs,
                                infoInputsObj: {
                                    ...fieldInputs.infoInputsObj,
                                    sellerTaxCode: e.target.value,
                                },
                            })
                        }
                        sx={{mt: 2}}
                    />
                    <Button variant="contained" color="primary" onClick={handleCompanyDetailsChange} sx={{mt: 2, background : "#6482AD"}}>
                        Update Company Details
                    </Button>
                </Grid>

                {/* Logo Upload */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Upload Company Logo</Typography>
                    <img
                        src={displayedLogo}
                        alt="Company Logo"
                        style={{ width: '150px', height: '150px', marginBottom: '10px' }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        style={{ display: 'block', marginTop: '10px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogoUpload}
                        sx={{ mt: 2, background : "#6482AD" }}
                    >
                        Upload Logo
                    </Button>
                </Grid>

                {/* Delete Account */}
                <Grid item xs={12}>
                    <Button variant="contained" color="error" onClick={handleOpenDialog} sx={{mt: 2}}>
                        Delete Account
                    </Button>

                    <Dialog
                        open={openConfirmDialog}
                        onClose={handleCloseDialog}
                    >
                        <DialogTitle>Confirm Account Deletion</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete your account? This action cannot be undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteAccount} color="secondary">
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
