import React, {createContext, useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {blobToBase64} from "../utils/Utils.js";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [jwtToken, setJwtToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userLogo, setUserLogo] = useState(null);
    const [contextFieldInputs, setContextFieldInputs] = useState(null);
    const [companyDetailsSaved, setCompanyDetailsSaved] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const expiration = localStorage.getItem('jwtExpiration');

        if (token && new Date(expiration) > new Date()) {
            setJwtToken(token);
            setIsAuthenticated(true);
        } else if (token && new Date(expiration) <= new Date()) {
            refreshJwtToken();
        } else {
            // No token, clean up
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('jwtExpiration');
            setIsAuthenticated(false);
        }
        if (isAuthenticated) {
            if (!contextFieldInputs) {
                // Fetch user details if not already loaded
                fetchUserDetails(true);
            }

            if (!userLogo) {
                const storedLogo = localStorage.getItem('userLogo');
                if (storedLogo) {
                    setUserLogo(storedLogo); // Use stored logo if available
                } else {
                    fetchUserLogo(); // Otherwise fetch it
                }
            }
        }
    }, [isAuthenticated]);


    const checkJwtExpiration = async () => {
        const expiration = localStorage.getItem('jwtExpiration');
        if (expiration && new Date(expiration) <= new Date()) {
            await refreshJwtToken();
        }
    };

    const fetchUserLogo = async () => {
        await checkJwtExpiration();

        try {
            const response = await axios.get('http://localhost:8080/api/v1/user/logo', {
                headers: { Authorization: `Bearer ${jwtToken}` },
                responseType: 'blob',
            });
            const imageUrl = await blobToBase64(response.data);
            if (response.data.size > 0) {
                localStorage.setItem('userLogo', imageUrl); // Store the image URL in localStorage
                setUserLogo(imageUrl);
            }
        } catch (error) {
            console.error('Error fetching user image', error);
        }
    };

    const fetchNextSerial = async (fieldInputs) => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/invoice/serial/next', {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
            });
            fieldInputs.infoInputsObj.serial = response.data.serial;
        } catch (error) {
            console.error("Error fetching serial", error);
        }
    };

    const fetchUserDetails = async (updateDetails) => {
        const newDate = new Date();
        const offset = newDate.getTimezoneOffset() * 60000; // Get the offset in milliseconds
        const newDateString = new Date(newDate.getTime() - offset).toISOString().split('T')[0];
        await checkJwtExpiration();

        const fieldInputs = {
            infoInputsObj: {
                serial: "",
                issueDate: newDateString,
                issuedBy: "",
                contactInfo: "",
                sellerName: "",
                sellerAddress: "",
                sellerCmpnyCode: "",
                sellerTaxCode: "",
                buyerName: "",
                buyerAddress: "",
                buyerCmpnyCode: "",
                buyerTaxCode: "",
            },
            productDataObj: [
                { field1: "", field2: "", field3: "", field4: "", field5: "" },
            ],
        };

        if (updateDetails) {
            await fetchUserCompany(fieldInputs);
            await fetchNextSerial(fieldInputs);
            await fetchUserInfo(fieldInputs);
            setContextFieldInputs(fieldInputs);
            if (fieldInputs.infoInputsObj.sellerName !== '') {
                setCompanyDetailsSaved(true);
            }
            if (fieldInputs.infoInputsObj.contactInfo !== '') {
                localStorage.setItem('userInfo', fieldInputs.infoInputsObj.contactInfo);
            }
        } else {
            await fetchNextSerial(fieldInputs);
            fieldInputs.infoInputsObj.sellerName = contextFieldInputs.infoInputsObj.sellerName;
            fieldInputs.infoInputsObj.sellerAddress = contextFieldInputs.infoInputsObj.sellerAddress;
            fieldInputs.infoInputsObj.sellerTaxCode = contextFieldInputs.infoInputsObj.sellerTaxCode;
            fieldInputs.infoInputsObj.sellerCmpnyCode = contextFieldInputs.infoInputsObj.sellerCmpnyCode;
            fieldInputs.infoInputsObj.contactInfo = contextFieldInputs.infoInputsObj.contactInfo;
            fieldInputs.infoInputsObj.issuedBy = contextFieldInputs.infoInputsObj.issuedBy;
            setContextFieldInputs(fieldInputs);
        }
    };

    const fetchUserCompany = async (fieldInputs) => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/user/company', {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
            });

            if (response.data) {
                const { name, address, companyCode, companyVATCode } = response.data;
                fieldInputs.infoInputsObj.sellerName = name;
                fieldInputs.infoInputsObj.sellerAddress = address;
                fieldInputs.infoInputsObj.sellerTaxCode = companyVATCode;
                fieldInputs.infoInputsObj.sellerCmpnyCode = companyCode;
                localStorage.setItem('companyName', name);
            }
        } catch (error) {
            console.error("Error fetching company details", error);
        }
    };

    const fetchUserInfo = async (fieldInputs) => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/user/info', {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
            });
            fieldInputs.infoInputsObj.contactInfo = response.data.info;
        } catch (error) {
            console.error("Error fetching user info", error);
        }
    };

    const refreshJwtToken = async () => {
        try {
            const response = await axios.post('http://localhost:8081/api/v1/user/token/refresh', {}, { withCredentials: true });
            const { jwtToken, expiresIn } = response.data;
            const expirationTime = new Date(Date.now() + expiresIn);
            saveTokenData(jwtToken, expirationTime);
        } catch (error) {
            console.error('Failed to refresh token', error);
            logout();
        }
    };

    const login = (jwtToken, expirationDateTime) => {
        saveTokenData(jwtToken, expirationDateTime);
    };

    const saveTokenData = (jwtToken, expirationDateTime) => {
        setJwtToken(jwtToken);
        setIsAuthenticated(true);
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('jwtExpiration', expirationDateTime);
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:8081/api/v1/user/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Error logging out', error);
        }
        clearAuthData();
        navigate('/');
    };

    const clearAuthData = () => {
        setJwtToken(null);
        setUserLogo(null);
        setCompanyDetailsSaved(false);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtExpiration');
        localStorage.removeItem('userLogo');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('companyName');
        setIsAuthenticated(false);
    };

    // Memoized context value
    const contextValue = useMemo(() => ({
        isAuthenticated, jwtToken, userLogo, contextFieldInputs, companyDetailsSaved,
        fetchNextSerial, fetchUserDetails, login, logout, refreshJwtToken, checkJwtExpiration, fetchUserLogo
    }), [isAuthenticated, jwtToken, userLogo, contextFieldInputs, companyDetailsSaved]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};