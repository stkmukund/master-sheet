'use client'
import BeanEater from "@/app/components/BeanEater";
import Button from "@/app/components/Button";
import Table from "@/app/components/Table";
import TableWithLoading from "@/app/components/TableWithLoading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MasterSheet() {
    const params: { reportName: string[] } = useParams();
    const sheetName = params.reportName[1] as keyof tableHeading;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tableData, setTableData] = useState<tableData>({ NYMBUS: {}, HELIKON: {} });
    const [loading, setLoading] = useState(false);
    const [brandName, setBrandName] = useState<string>("NYMBUS");
    const [error, setError] = useState("");

    useEffect(() => {
        // For VIP
        if (sheetName === "totalVipTracking") setStartDate("01/01/2010");
        // VIP End
    }, [sheetName])

    const handleInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const date = target.value;
        // Remove non-numeric characters
        const numericValue = date.replace(/\D/g, "");

        // Format as MM/DD/YY
        let formattedValue = numericValue;

        if (numericValue.length > 2 && numericValue.length <= 4) {
            formattedValue = numericValue.slice(0, 2) + "/" + numericValue.slice(2);
        } else if (numericValue.length > 4) {
            formattedValue =
                numericValue.slice(0, 2) +
                "/" +
                numericValue.slice(2, 4) +
                "/" +
                numericValue.slice(4, 8);
        }

        if (target.id === "startDate") setStartDate(formattedValue);
        else if (target.id === "endDate") setEndDate(formattedValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent invalid key inputs
        if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (sheetName === "totalVipTracking") await handleTotalVipTracking();
        else if (sheetName === "upsellTakeRateReport") await handleUpsellTakeRateReport();
        else {
            try {
                const response = await fetch(`/api/master-sheet/projected-rebill-revenue/?brandName=${brandName}&startDate=${startDate}&endDate=${endDate}`).then(result => result.json());
                if (response.result === 'ERROR') {
                    setError(response.message);
                    setLoading(false);
                }
                if (response.result === 'SUCCESS') {
                    setTableData((prev) => ({ ...prev, [brandName]: response.message.values }));
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }

    };

    const handleTotalVipTracking = async () => {
        const response = await fetch(
            `/api/master-sheet/total-vip-tracking/?brandName=${brandName}&startDate=${startDate}&endDate=${endDate}`
        ).then(result => result.json());

        if (response.result === 'ERROR') {
            setError(response.message);
            setLoading(false);
            return; // Exit the function if an error occurs
        }

        if (response.result === 'SUCCESS') {
            setTableData((prev) => ({ ...prev, [brandName]: response.message.values }));
        }
        setLoading(false);
    };

    // UpsellTakeRateReport Start
    const handleUpsellTakeRateReport = async () => {
        const upsellTakeData: upsellTakeData = {};
        try {
            const response = await fetch(
                `/api/master-sheet/upsell-take-rate-report/?brandName=${brandName}&startDate=${startDate}&endDate=${endDate}`
            ).then(result => result.json());

            if (response.result === 'ERROR') {
                setError(response.message);
                setLoading(false);
                return; // Exit the function if an error occurs
            }

            if (response.result === 'SUCCESS') {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
            return;
        }
        const totalResponse = await fetch(
            `/api/master-sheet/upsell-take-rate-report/?brandName=${brandName}&startDate=${startDate}&endDate=${endDate}&campaignId=${campaignids}&total=1`
        ).then(result => result.json());
        const totalSales = totalSalesCount(totalResponse);
        console.log('totalSalesout',totalSales)
        // Generate the report
        const upsellReport = generateUpsellReport(upsellTakeData, startDate, endDate, totalSales);
        const convertedArray = Object.entries(upsellReport).map(([key, value]) => {
            return { category: key, data: value };
          });
          console.log('dataArray',convertedArray);

          const percentageArray = Object.values(convertedArray[0].data);
          percentageArray.splice(1, 0, '% of people taking the upsell');
          const earningArray = Object.values(convertedArray[1].data);
          earningArray.splice(1, 0, 'Upsell earnings per customer');

        setTableData((prev) => ({ ...prev, [brandName]:[percentageArray,earningArray] }));

        console.log("upsellReport", JSON.stringify(upsellReport, null, 2));
    }

    const totalSalesCount = (data: any) => {
        let total = 0;
        total = data.message.salesCount;
        return total;
    }
    const percentageData = (amount: number, total: number) => {
        return `${((amount / total) * 100).toFixed(2)}%`;
    }
    const earningsData = (amount: number, total: number) => {
        return (((amount / total) * 100) / 100).toFixed(2);
    }
    // Generate the report
    const generateUpsellReport = (
        upsellTakeData: Record<string, { salesRev: number, salesCount:number }>,
        startDate: string,
        endDate: string,
        total: number
    ): UpsellReport => {
        const percentage: Record<string, number | string> = { dateRange: `${startDate}-${endDate}` };
        const earnings: Record<string, number | string> = { dateRange: `${startDate}-${endDate}` };
        let earningsTotal = 0;
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
        earnings.total = `$${(earningsTotal).toFixed(2)}`;

        return {
            percentageData: percentage,
            earningsData: earnings
        };
    };
    // UpsellTakeRateReport End

    return (
        <div className="max-w-screen-lg mx-auto">
            <section id="form">
                <form onSubmit={handleSubmit} className="flex items-center gap-4 text-black h-16">
                    <select onChange={(e) => setBrandName(e.target.value)} value={brandName} className="cursor-pointer h-[40px] rounded-md" name="brandList" id="brand-list">
                        <option disabled>Select Brand</option>
                        <option className="text-center" value="NYMBUS">Nymbus</option>
                        <option className="text-center" value="CREATUNITY">Creatunity</option>
                        <option className="text-center" value="HELIKON">Helikon</option>
                    </select>
                    <input type="text" id="startDate" value={startDate} onInput={handleInputChange} onKeyDown={handleKeyDown} className="rounded-md w-fit h-[40px] p-2.5" placeholder="Start Date: MMDDYY" required />
                    <input type="text" id="endDate" value={endDate} onInput={handleInputChange} onKeyDown={handleKeyDown} className="rounded-md w-fit h-[40px] p-2.5" placeholder="End Date: MMDDYY" required />
                    {!loading && <Button name="Calculate" type="submit" disabled={loading} />}
                    {loading && <BeanEater width={60} height={60} />}
                </form>
                {error && (<div className="mt-1 text-red-600 font-semibold text-sm">{error}</div>)}
            </section>
            <section id="table" className="mt-2">
                {Object.keys(tableData[brandName]!).length > 0 ? <Table tableHead={tableHead[sheetName].tableHeading[brandName]} tableBody={tableData[brandName]!} /> : <TableWithLoading tableHead={tableHead[sheetName].tableHeading[brandName]} />}
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

type upsellTakeData = {
    offer1_upProdId?: upsellTakeProduct;
    offer1_downProductId?: upsellTakeProduct;
    offer2_upProdId?: upsellTakeProduct;
    offer2_downProductId?: upsellTakeProduct;
    offer3_upProdId?: upsellTakeProduct;
    offer3_downProductId?: upsellTakeProduct;
}

type upsellTakeProduct = {
    salesCount: number;
    salesRev: number;
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