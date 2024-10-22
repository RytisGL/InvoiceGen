import React, {useEffect, useState, useRef, useContext} from 'react';
import axios from 'axios';
import {Bar, Pie} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend} from 'chart.js';
import {Button} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done.js";
import ClearIcon from "@mui/icons-material/Clear.js";
import {AuthContext} from "../context/AuthContext";
import {loadImageFromLocalStorage} from "../utils/Utils.js";
import PlaceHolderImage from '../assets/PlaceHolder.png'; // Import the placeholder image

// Registering the components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Utility function to convert month numbers to month names
const getMonthName = (monthNumber) => {
    const monthNames = ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'];
    return monthNames[monthNumber - 1];
};

// Utility function to prepare chart data for last three months (bar chart)
const prepareBarChartData = (data) => {
    // Sort the data by month number
    const sortedData = Object.keys(data)
        .sort((a, b) => a - b) // Sort the month numbers
        .reduce((acc, key) => {
            acc[getMonthName(key)] = data[key];
            return acc;
        }, {});

    const labels = Object.keys(sortedData);
    const values = Object.values(sortedData);

    return {
        labels,
        datasets: [
            {
                label: 'Last 3 Months Totals',
                data: values,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56'
                ],
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
            },
        ],
    };
};

// Helper function to prepare chart data for buyers (pie chart)
const prepareChartData = (data, title) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    return {
        labels,
        datasets: [
            {
                label: title,
                data: values,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                ],
            },
        ],
    };
};

export default function Stats() {
    const [statsData, setStatsData] = useState(null);
    const [lastThreeMonthsData, setLastThreeMonthsData] = useState({});
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const {checkJwtExpiration} = useContext(AuthContext);
    const initialFetchDone = useRef(false);

    const fetchStats = async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await axios.get('http://localhost:8080/api/v1/user/stats', {
                params, headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            setStatsData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to fetch statistics.');
        }
    };

    const fetchLastThreeMonths = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/user/stats/last', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            setLastThreeMonthsData(response.data.totalsEachMonth);
        } catch (error) {
            console.error('Error fetching last three months data:', error);
            setError('Failed to fetch last three months data.');
        }
    };

    const handleReset = async () => {
        setStartDate('');
        setEndDate('');
        await checkJwtExpiration();
        fetchStats(); // Fetch all data without filters
    };

    const handleFetch = async () => {
        await checkJwtExpiration();
        fetchStats(startDate, endDate);
    };

    const fetchInit = async () => {
        await checkJwtExpiration();
        fetchStats();
        fetchLastThreeMonths();
    }

    // useEffect for initial data fetch
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchInit();
            initialFetchDone.current = true; // Mark the initial fetch as done
        }
    }, []);

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!statsData) {
        return <div>Kraunama...</div>;
    }

    const {vatAmountTotal, total, totalWithoutVAT, buyers} = statsData;

    const buyersChartData = prepareChartData(buyers, 'Pirkėjai');
    const barChartData = prepareBarChartData(lastThreeMonthsData);

    // Disable interaction in the pie chart legend
    const pieChartOptions = {
        plugins: {
            legend: {
                display: true, // Show the legend
                onClick: null, // Disable toggle functionality
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: €${value.toFixed(2)}`;
                    },
                },
            },
        },
    };

    // Get company name from localStorage
    const companyName = localStorage.getItem('companyName') || '';

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Move the logo and the column chart to the left */}
                <div className="col-md-6 text-center">
                    {
                        <img
                            src={loadImageFromLocalStorage() || PlaceHolderImage}
                            alt="User Logo"
                            style={{
                                borderRadius: "50%",
                                width: "150px", // Adjust the size as needed
                                height: "150px", // Adjust the size as needed
                                border: "7px solid #6482AD"
                            }}
                        />
                    }
                    {/* Display company name next to the logo */}
                    {companyName && (
                        <div>
                            <strong>{companyName}</strong>
                        </div>
                    )}

                    {/* Column chart for the last 3 months */}
                    <div className="row mt-4">
                        <h5 className="text-center"><strong>Paskutinių 3 mėnesių suma:</strong></h5>
                        <Bar data={barChartData}/>
                    </div>
                </div>

                {/* Move the pie chart to the right */}
                <div className="col-md-6">
                    <h5 className="text-center"><strong>Totali suma pagal pirkėją:</strong></h5>
                    <Pie data={buyersChartData} options={pieChartOptions}/>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-6">
                    <table className="table table-bordered">
                        <tbody>
                        <tr>
                            <td><strong>PVM suma:</strong></td>
                            <td>€{vatAmountTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Suma be PVM:</strong></td>
                            <td>€{totalWithoutVAT.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Suma:</strong></td>
                            <td>€{total.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Date Filters */}
                <div className="col-md-6 text-center">
                    <div className="mb-2">
                        Nuo:
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-2">
                        Iki:
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <Button className="btn mt-2"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<DoneIcon/>}
                            style={{background: "green"}}
                            type="button"
                            onClick={handleFetch}/>
                    <Button className="btn mt-2"
                            variant="contained"
                            tabIndex={-1}
                            style={{background: "dimgrey"}}
                            endIcon={<ClearIcon/>}
                            type="button" onClick={handleReset}/>
                </div>
            </div>
        </div>
    );
}
