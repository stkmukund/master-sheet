'use client'
import {
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ReportChart: React.FC<{ dates: string[]; revenues: number[]; rebillCounts: number[] }> = ({
    dates,
    revenues,
    rebillCounts,
}) => {
    const data = {
        labels: dates,
        datasets: [
            {
                label: "Total Revenue ($)",
                data: revenues,
                borderColor: "#005f6b", // Deep Teal for the line
                backgroundColor: "rgba(0, 95, 107, 0.2)", // Soft Deep Teal for the fill
                yAxisID: "y-revenue",
            },
            {
                label: "Projected Approved Rebill Count",
                data: rebillCounts,
                borderColor: "#ff6f61", // Soft Coral for the line
                backgroundColor: "rgba(255, 111, 97, 0.2)", // Soft Coral for the fill
                yAxisID: "y-rebill",
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: "#2c3e50", // Dark Navy Blue for legend text
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.raw as number;
                        if (context.dataset.label === "Total Revenue ($)") {
                            return `$${value.toLocaleString()}`;
                        }
                        return value.toLocaleString();
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date Range",
                    color: "#2c3e50", // Dark Navy Blue for axis title
                },
                ticks: {
                    color: "#4a4a4a", // Charcoal Gray for axis ticks
                },
            },
            "y-revenue": {
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Total Revenue ($)",
                    color: "#2c3e50", // Dark Navy Blue for axis title
                },
                ticks: {
                    color: "#4a4a4a", // Charcoal Gray for axis ticks
                    callback: (value) => `$${(value as number).toLocaleString()}`,
                },
            },
            "y-rebill": {
                type: "linear",
                position: "right",
                title: {
                    display: true,
                    text: "Rebill Count",
                    color: "#2c3e50", // Dark Navy Blue for axis title
                },
                ticks: {
                    color: "#4a4a4a", // Charcoal Gray for axis ticks
                    callback: (value) => (value as number).toLocaleString(),
                },
                grid: {
                    drawOnChartArea: false, // Avoid grid overlap
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default ReportChart;
