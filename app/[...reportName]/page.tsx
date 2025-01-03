'use client'
import BeanEater from "@/app/components/BeanEater";
import Button from "@/app/components/Button";
import Table from "@/app/components/Table";
import TableWithLoading from "@/app/components/TableWithLoading";
import { apiHandler } from "@/lib/apiHandler";
import { getupsellCampaignIds } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";
import DateTimePicker from "../components/DateTimePicker";
export default function MasterSheet() {
    const params: { reportName: string[] } = useParams();
    const sheetName = params.reportName[1] as keyof tableHeading;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [tableData, setTableData] = useState<tableData>({ NYMBUS: {}, HELIKON: {} });
    const [loading, setLoading] = useState(false);
    const [brandName, setBrandName] = useState<string>("NYMBUS");
    const [CampaignName, setBrandCampaignName] = useState<string>("");
    const [tableHeading, setTableHeading] = useState<string[]>([]);
    const [error, setError] = useState<ApiResponse["message"] | SalesMessage[]>("");

    const campaignNames = getupsellCampaignIds(brandName);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (sheetName === "totalVipTracking") await handleTotalVipTracking();
        else if (sheetName === "upsellTakeRateReport") await handleUpsellTakeRateReport();
        else {
            try {
                console.log("startDate", startDate)
                // const response = await fetch(`/api/master-sheet/projected-rebill-revenue/?brandName=${brandName}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`).then(result => result.json());
                const response: ApiResponse = await apiHandler({ endpoint: 'master-sheet/projected-rebill-revenue/', queryParams: { brandName, startDate, endDate, startTime, endTime } })
                if (response.result === 'ERROR') {
                    setError(response.message);
                    setLoading(false);
                }
                if (response.result === 'SUCCESS' && typeof response.message !== "string") {
                    const { heading, values } = response.message; // Narrow the type here
                    setTableHeading(heading);
                    setTableData((prev) => ({ ...prev, [brandName]: values }));
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }

    };

    const handleTotalVipTracking = async () => {
        const response: ApiResponse = await apiHandler({ endpoint: 'master-sheet/total-vip-tracking/', queryParams: { brandName, startDate, endDate, startTime, endTime } });

        if (response.result === 'ERROR') {
            setError(response.message);
            setLoading(false);
            return; // Exit the function if an error occurs
        }

        if (response.result === 'SUCCESS' && typeof response.message !== "string") {
            const { heading, values } = response.message; // Narrow the type here
            setTableHeading(heading);
            setTableData((prev) => ({ ...prev, [brandName]: values }));
        }
        setLoading(false);
    };

    // UpsellTakeRateReport Start
    const handleUpsellTakeRateReport = async () => {
        let respones;
        try {
            const response: SalesResponse = await apiHandler({ endpoint: 'master-sheet/upsell-take-rate-report/', queryParams: { brandName, startDate, endDate, startTime, endTime, CampaignName } })

            if (response.result === 'ERROR') {
                setError(response.message);
                setLoading(false);
                return; // Exit the function if an error occurs
            }

            if (response.result === 'SUCCESS') {
                setLoading(false);
            }
            respones = response
            setTableHeading(response.heading!);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
            return;
        }

        const totalResponse = await fetch(
            `/api/master-sheet/upsell-take-rate-report/?brandName=${brandName}&startDate=${startDate}&endDate=${endDate}&total=1&CampaignName=${CampaignName}`
        ).then(result => result.json());
        const totalSales = totalSalesCount(totalResponse);
        // Generate the report

        const upsellReport = generateUpsellReport(respones.message, startDate, endDate, totalSales);
        const convertedArray = Object.entries(upsellReport).map(([key, value]) => {
            return { category: key, data: value };
        });

        const percentageArray = Object.values(convertedArray[0].data);
        percentageArray.unshift(`${startDate}-${endDate}`, '% of people taking the upsell');
        const earningArray = Object.values(convertedArray[1].data);
        earningArray.unshift(" ", 'Upsell earnings per customer');

        //   earningArray.splice(1, 0, 'Upsell earnings per customer');

        setTableData((prev) => ({ ...prev, [brandName]: [percentageArray, earningArray] }));

        console.log("upsellReport", JSON.stringify(upsellReport, null, 2));
    }

    const totalSalesCount = (data: { message: { salesCount: number } }) => {
        let total = 0;
        total = data.message.salesCount;
        return total;
    }
    const percentageData = (amount: number, total: number) => {
        if (amount === 0) {
            return '0.00%';
        }
        return `${((amount / total) * 100).toFixed(2)}%`;
    }
    const earningsData = (amount: number, total: number) => {
        if (amount === 0) {
            return '0.00';
        }
        return (((amount / total) * 100) / 100).toFixed(2);
    }
    // Generate the report
    const generateUpsellReport = (
        upsellTakeData: SalesMessage[],
        startDate: string,
        endDate: string,
        total: number
    ): UpsellReport => {
        // Initialize the objects with dateRange at the first index
        const percentage: Record<string, number | string> = {};
        const earnings: Record<string, number | string> = {};

        // Add dateRange before the loop
        // percentage.dateRange = `${startDate}-${endDate}`;
        // earnings.dateRange = `${startDate}-${endDate}`;

        let earningsTotal = 0;

        // Iterate over upsellTakeData
        for (const key in upsellTakeData) {
            const salesRev = upsellTakeData[key].salesRev;
            const salesTotal = upsellTakeData[key].salesCount;

            // Calculate percentage and earnings
            percentage[key] = percentageData(salesTotal, total);
            const earning = earningsData(salesRev, total);
            earnings[key] = `$${earning}`;

            // Add to earningsTotal
            earningsTotal += parseFloat(earning);
        }

        // Add totals to both objects
        percentage.total = total;
        earnings.total = `$${earningsTotal.toFixed(2)}`;

        return {
            percentageData: percentage,
            earningsData: earnings,
        };
    };
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBrandName(e.target.value);
        setBrandCampaignName("");
    };

    // UpsellTakeRateReport End

    return (
        <div className="max-w-screen-lg mx-auto">
            <section id="form">
                <form onSubmit={handleSubmit} className="flex items-end gap-4 text-black h-16">
                    <select onChange={handleChange} value={brandName} className="cursor-pointer h-[40px] rounded-md" name="brandList" id="brand-list">
                        <option disabled>Select Brand</option>
                        <option className="text-center" value="NYMBUS">Nymbus</option>
                        <option className="text-center" value="CREATUNITY">Creatunity</option>
                        <option className="text-center" value="HELIKON">Helikon</option>
                    </select>
                    {sheetName === "upsellTakeRateReport" && (
                        <select required onChange={(e) => setBrandCampaignName(e.target.value)} value={CampaignName} className="cursor-pointer h-[40px] rounded-md">
                            {/* Default option */}
                            <option value="" disabled>
                                Select Campaign
                            </option>

                            {/* Map over the object entries to generate options */}
                            {Object.entries(campaignNames[0] || {}).map(([key, value]) => (
                                <option key={key} value={key} id={value}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    )}
                    <DateTimePicker dateString="Start Date" setDate={setStartDate} setTime={setStartTime} />
                    <DateTimePicker dateString="End Date" setDate={setEndDate} setTime={setEndTime} />
                    {!loading && <Button name="Calculate" type="submit" disabled={loading} />}
                    {loading && <BeanEater width={60} height={60} />}
                </form>
                {typeof error === "string" && (
                    <div className="mt-1 text-red-600 font-semibold text-sm">{error}</div>
                )}
            </section>
            <section id="table" className="mt-2">
                {Object.keys(tableData[brandName]!).length > 0 ? <Table tableHead={tableHeading} tableBody={tableData[brandName]!} /> : <TableWithLoading tableHead={tableHead[sheetName].tableHeading[brandName]} />}
            </section>
        </div>
    )
}

const tableHead: tableHeading = {
    projectedRebillRevenue: {
        tableHeading: {
            NYMBUS: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"],
            CREATUNITY: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"],
            HELIKON: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"]
        }
    },
    totalVipTracking: {
        tableHeading: {
            NYMBUS: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Secret Lane", "Invisilift", "Indestructible Tights", "Scarlett Envy", "Mangolift", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
            CREATUNITY: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Invisilift", "Indestructible Tights", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
            HELIKON: ["Date Pulled", "mLab™", "CheckoutChamp", "Flexi Health™", "Bank Sites", "Total Andor VIPs", "Total VIP Recycling", "Total Andor VIP's Paused Status"],
        }
    },
    upsellTakeRateReport: {
        tableHeading: {
            NYMBUS: ["Date", " ", "Lash Cosmetics Vibely Mascara Offered", "Lash Cosmetics Vibely Mascara - Discounted", "Lash Cosmetics Vibely EyeLiner Offered", "Lash Cosmetics Vibely EyeLiner Discounted", "Expedited Shipping", "Discounted Expedited Shipping", "Total"],
            CREATUNITY: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
            HELIKON: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
        }
    }
};

// Types
type tableData = {
    NYMBUS: {
        [key: string]: string[]
    };
    CREATUNITY?: {
        [key: string]: string[]
    };
    HELIKON: {
        [key: string]: string[]
    };
    [key: string]: object | undefined;
}

type tableHeading = {
    projectedRebillRevenue: tableSheet;
    totalVipTracking: tableSheet;
    upsellTakeRateReport: tableSheet;
}

type tableSheet = {
    tableHeading: {
        NYMBUS: string[];
        CREATUNITY: string[];
        HELIKON: string[];
        [key: string]: string[]; // Index signature
    };
}

// Building the upsell report dynamically
type UpsellReport = {
    percentageData: {
        dateRange?: string;
        [key: string]: number | string | undefined;
    };
    earningsData: {
        dateRange?: string;
        [key: string]: number | string | undefined;
    };
};

interface ApiResponse {
    result: "SUCCESS" | "ERROR"; // Enum-like type for result
    message: {
        heading: string[]; // Array of headings
        values: (string | number)[][]; // Array of rows, each row can contain strings or numbers
    } | string;
    heading?: string[];
}

interface SalesMessage {
    date: string; // Represents a date range
    salesCount: number; // Total sales count for this entry
    salesRev: number; // Total sales revenue for this entry
}

interface SalesResponse {
    result: string; // e.g., "SUCCESS" or other result strings
    message: SalesMessage[]; // Array of sales data
    heading: string[]; // Array of heading strings
}