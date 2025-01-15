'use client'
import BeanEater from "@/app/components/BeanEater";
import Button from "@/app/components/Button";
import Table from "@/app/components/Table";
import TableWithLoading from "@/app/components/TableWithLoading";
import { apiHandler } from "@/lib/apiHandler";
import { calculateDateRange, getupsellCampaignIds } from "@/lib/utils";
import { CalendarDateTime, getLocalTimeZone, today } from "@internationalized/date";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DateTimePicker from "../components/DateTimePicker";
import { reportDateRange } from "@/lib/campaign-details";
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
    const [openDropdown, setOpenDropdown] = useState(false)
    // dateRangePicker options
    const dateRangeOption = reportDateRange[sheetName]
    // Set Start and End of Day
    const [startOfDay, setStartOfDay] = useState<CalendarDateTime>(() => {
        const timeZone = getLocalTimeZone(); // Get the current local timezone
        // Get today's date in the local timezone
        const todayDate = today(timeZone);
        // Construct the start and end of day with the required times
        return new CalendarDateTime(timeZone, todayDate.year, todayDate.month, todayDate.day, 0, 0, 0);
    });
    const [endOfDay, setEndOfDay] = useState<CalendarDateTime>(() => {
        const timeZone = getLocalTimeZone(); // Get the current local timezone
        // Get today's date in the local timezone
        const todayDate = today(timeZone);
        // Construct the start and end of day with the required times
        return new CalendarDateTime(timeZone, todayDate.year, todayDate.month, todayDate.day, 23, 59, 59);
    });
    // add deffault value to start and end date
    useEffect(() => {
        handleDefaultDate(startOfDay, setStartDate, setStartTime);
        handleDefaultDate(endOfDay, setEndDate, setEndTime);
    }, [startOfDay, endOfDay])

    const campaignNames = getupsellCampaignIds(brandName);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (sheetName === "totalVipTracking") await handleTotalVipTracking();
        else if (sheetName === "upsellTakeRateReport") await handleUpsellTakeRateReport();
        else {
            try {
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

    // added default start and end date
    const handleDefaultDate = (date: CalendarDateTime, setDate: React.Dispatch<React.SetStateAction<string>>, setTime: React.Dispatch<React.SetStateAction<string>>) => {
        const formattedDate = `${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}/${date.year}`;
        const formattedTime = `${String(date.hour).padStart(2, "0")}:${String(date.minute).padStart(2, "0")}:${String(date.second).padStart(2, "0")}`;
        setDate(formattedDate);
        setTime(formattedTime);
    }

    // Calculate the date range
    const handleDateRange = (option: string) => {
        const { startDate, endDate } = calculateDateRange(option);
        setStartOfDay(startDate);
        setEndOfDay(endDate);
    }


    return (
        <div className="max-w-screen-lg mx-auto">
            <section id="form">
                <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 text-black sm:h-18">
                    <select onChange={handleChange} value={brandName} className="cursor-pointer h-[40px] rounded-md" name="brandList" id="brand-list">
                        <option disabled>Select Brand</option>
                        <option className="text-center" value="NYMBUS">Nymbus</option>
                        <option className="text-center" value="CREATUNITY" disabled>Creatunity</option>
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
                                <option key={key} value={key} id={value} disabled={['secretLane', 'scarlettEnvy', 'Mangolift', 'checkoutChamp', 'bankSites'].includes(key)}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    )}
                    {/* dateRangePicker */}
                    <section id="dateRangePicker" className="relative">
                        <div className="text-xs flex bg-[#2A4D69] text-[#F1F1F1] items-center rounded-sm mb-2 w-fit">
                            <button onClick={() => handleDateRange(dateRangeOption[0])} type="button" className="hover:bg-[#1E3651] p-1 cursor-pointer">{dateRangeOption[0]}</button>
                            <button onClick={() => handleDateRange(dateRangeOption[1])} type="button" className="hover:bg-[#1E3651] p-1 cursor-pointer">{dateRangeOption[1]}</button>
                            <button onClick={() => handleDateRange(dateRangeOption[2])} type="button" className="hover:bg-[#1E3651] p-1 cursor-pointer">{dateRangeOption[2]}</button>
                            {/* DropDown */}

                            <button id="dropdownDefaultButton" onClick={() => setOpenDropdown(!openDropdown)} data-dropdown-toggle="dropdownD" className="flex items-center hover:bg-[#1E3651] p-1" type="button">More<svg className="w-2.5 h-2.5 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                            </button>
                            {/* DropDown Menu */}
                            {openDropdown &&
                                (
                                    <div id="dropdownD" className="absolute z-10 top-7 -right-32 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                            {dateRangeOption.map((option, index) => {
                                                if (index > 2) return (
                                                    <li key={index} onClick={() => handleDateRange(option)}>
                                                        <p className="cursor-pointer block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{option}</p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <div className="py-2" onClick={() => setOpenDropdown(false)}>
                                            <p className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Close</p>
                                        </div>
                                    </div>
                                )}

                        </div>

                        <DateTimePicker dateValue={startOfDay!} dateString="Start Date" setDate={setStartDate} setTime={setStartTime} />
                    </section>
                    <DateTimePicker dateValue={endOfDay!} dateString="End Date" setDate={setEndDate} setTime={setEndTime} />
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