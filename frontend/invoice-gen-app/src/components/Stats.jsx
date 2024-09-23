import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {Button} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done.js";
import ClearIcon from "@mui/icons-material/Clear.js";

// Registering the components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to prepare chart data
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
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const initialFetchDone = useRef(false);

    const fetchStats = async (startDate, endDate) => {
        const jwtToken = localStorage.getItem('jwtToken');

        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await axios.get('http://localhost:8080/api/v1/invoice/stats', { params, headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            });
            setStatsData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to fetch statistics.');
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        fetchStats(); // Fetch all data without filters
    };

    const handleFetch = () => {
        fetchStats(startDate, endDate);
    };

    // useEffect for initial data fetch
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchStats();
            initialFetchDone.current = true; // Mark the initial fetch as done
        }
    }, []);

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!statsData) {
        return <div>Kraunama...</div>;
    }

    const { vatAmountTotal, total, totalWithoutVAT, sellers, buyers, highestInvoiceSum, highestInvoiceBuyerName, highestInvoiceSellerName } = statsData;

    const sellersChartData = prepareChartData(sellers, 'Pardavėjai');
    const buyersChartData = prepareChartData(buyers, 'Pirkėjai');

    const customTooltipOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: €${value.toFixed(2)}`;
                    },
                },
            },
            legend: {
                display: false, // Hide the legend
            },
        },
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <h5>Totali suma pagal pardavėją:</h5>
                    <Pie data={sellersChartData} options={customTooltipOptions} />
                </div>
                <div className="col-md-6">
                    <h5>Totali suma pagal pirkėją:</h5>
                    <Pie data={buyersChartData} options={customTooltipOptions} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-6">
                    <table className="table table-bordered">
                        <tbody>
                        <tr>
                            <td><strong>Totali PVM suma:</strong></td>
                            <td>€{vatAmountTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Totali suma be PVM:</strong></td>
                            <td>€{totalWithoutVAT.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Totali suma:</strong></td>
                            <td>€{total.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Didžiausia sąskaitos suma:</strong></td>
                            <td>€{highestInvoiceSum.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Didžiausios sąskaitos pirkėjas:</strong></td>
                            <td>{highestInvoiceBuyerName}</td>
                        </tr>
                        <tr>
                            <td><strong>Didžiausios sąskaitos pardavėjas:</strong></td>
                            <td>{highestInvoiceSellerName}</td>
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
                            startIcon={<DoneIcon />}
                            style={{background:"green"}}
                            type="button"
                            onClick={handleFetch}/>
                    <Button className="btn mt-2"
                            variant="contained"
                            tabIndex={-1}
                            style={{background:"dimgrey"}}
                            endIcon={<ClearIcon/>}
                            type="button" onClick={handleReset}/>
                </div>
            </div>
        </div>
    );
}
