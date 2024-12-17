'use client'
import BeanEater from "@/app/components/BeanEater";
import Button from "@/app/components/Button";
import Table from "@/app/components/Table";
import TableWithLoading from "@/app/components/TableWithLoading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MasterSheet() {
    const params: { reportName: string[] } = useParams();
    const sheetName = params.reportName[1] as keyof tableHeading;;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tableData, setTableData] = useState({});
    const [loading, setLoading] = useState(false);
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
                numericValue.slice(4, 6);
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
                const response = await fetch(`/api/master-sheet/projected-rebill-revenue/?startDate=${startDate}&endDate=${endDate}`).then(result => result.json());
                if (response.result === 'ERROR') {
                    setError(response.message);
                    setLoading(false);
                }
                if (response.result === 'SUCCESS') {
                    setTableData(response.message);
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }

    };

    const handleTotalVipTracking = async () => {
        const vipTableData: vipTableData = {
            dataPulled: endDate,
        }
        const campaignIds = tableHead[sheetName].campaignIds;

        for (const [key, ids] of Object.entries(campaignIds!)) {
            const stringOfIds = ids?.join(",");
            try {
                const response = await fetch(
                    `/api/master-sheet/total-vip-tracking/?startDate=${startDate}&endDate=${endDate}&campaignId=${stringOfIds}`
                ).then(result => result.json());

                if (response.result === 'ERROR') {
                    setError(response.message);
                    setLoading(false);
                    return; // Exit the function if an error occurs
                }

                if (response.result === 'SUCCESS') {
                    vipTableData[key as keyof vipTableData] = response.message.totalResults;
                    setTableData(vipTableData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
                return;
            }
        }
        await calculateTotalVips(vipTableData);
        await calculateTotalVipRecycle(vipTableData);
        setLoading(false);
    };

    const calculateTotalVips = async (data: vipTableData) => {
        const totalVips = Object.values(data);
        console.log("totalVips", totalVips)
        let sum = 0;
        for (let index = 1; index < totalVips.length; index++) {
            const element = +totalVips[index]!;
            sum += element;
        };
        data.totalVips = sum;
        setTableData(data);
    }

    const calculateTotalVipRecycle = async (data: vipTableData) => {
        const campaignIds = tableHead[sheetName].campaignIds;

        let totalRecycle = 0;
        for (const [key, ids] of Object.entries(campaignIds!)) {
            const stringOfIds = ids?.join(",");
            try {
                const response = await fetch(
                    `/api/master-sheet/total-vip-tracking/?startDate=${startDate}&endDate=${endDate}&campaignId=${stringOfIds}&status=RECYCLE_BILLING`
                ).then(result => result.json());

                if (response.result === 'ERROR') {
                    setError(response.message);
                    setLoading(false);
                    return; // Exit the function if an error occurs
                }

                if (response.result === 'SUCCESS') {
                    totalRecycle += response.message.totalResults;
                }
            } catch (error) {
                console.error(key, "Error fetching data:", error);
                setLoading(false);
                return;
            }
        }
        data.totalRecycle = totalRecycle;
        setTableData(data);
        return totalRecycle;
    }

    // UpsellTakeRateReport Start
    const handleUpsellTakeRateReport = async () => {
        const upsellTakeData: upsellTakeData = {};
        const upsellProductIds: upsellProductIdsInterface = tableHead.upsellTakeRateReport.productIds!;
        for (const [key, ids] of Object.entries(upsellProductIds)) {
            try {
                const response = await fetch(
                    `/api/master-sheet/upsell-take-rate-report/?startDate=${startDate}&endDate=${endDate}&campaignProductId=${ids}`
                ).then(result => result.json());

                if (response.result === 'ERROR') {
                    setError(response.message);
                    setLoading(false);
                    return; // Exit the function if an error occurs
                }

                if (response.result === 'SUCCESS') {
                    upsellTakeData[key as keyof upsellTakeData] = response.message
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
                return;
            }
        }
        const totalSales = totalSalesCount(upsellTakeData);
        // Generate the report
        const upsellReport = generateUpsellReport(upsellTakeData, startDate, endDate, totalSales);
        console.log("upsellReport", JSON.stringify(upsellReport, null, 2));
    }

    const totalSalesCount = (data: upsellTakeData) => {
        let total = 0;
        Object.values(data).map((product) => {
            total += product.salesCount;
        })
        return total;
    }
    const percentageData = (amount: number, total: number) => {
        return ((amount / total) * 100).toFixed(2);
    }
    const earningsData = (amount: number, total: number) => {
        return (((amount / total) * 100) / 100).toFixed(2);
    }
    // Generate the report
    const generateUpsellReport = (
        upsellTakeData: Record<string, { salesRev: number }>,
        startDate: string,
        endDate: string,
        total: number
    ): UpsellReport => {
        const percentage: Record<string, number | string> = { dateRange: `${startDate}-${endDate}` };
        const earnings: Record<string, number | string> = { dateRange: `${startDate}-${endDate}` };

        let earningsTotal = 0;

        for (const key in upsellTakeData) {
            const salesRev = upsellTakeData[key].salesRev;

            // Calculate percentage and earnings
            percentage[key] = percentageData(salesRev, total);
            const earning = earningsData(salesRev, total);
            earnings[key] = earning;

            // Add to earningsTotal
            earningsTotal += parseFloat(earning);
        }

        // Add totals to both objects
        percentage.total = total;
        earnings.total = earningsTotal;

        return {
            percentageData: percentage,
            earningsData: earnings
        };
    };
    // UpsellTakeRateReport End

    return (
        <div className="max-w-screen-lg mx-auto">
            <section id="form">
                <form onSubmit={handleSubmit} className="flex items-center gap-4 text-black">
                    <input type="text" id="startDate" value={startDate} onInput={handleInputChange} onKeyDown={handleKeyDown} className="rounded-md w-fit h-[40px] p-2.5" placeholder="Start Date: MMDDYY" required />
                    <input type="text" id="endDate" value={endDate} onInput={handleInputChange} onKeyDown={handleKeyDown} className="rounded-md w-fit h-[40px] p-2.5" placeholder="End Date: MMDDYY" required />
                    {!loading && <Button name="Calculate" type="submit" disabled={loading} />}
                    {loading && <BeanEater width={60} height={60} />}
                </form>
                {error && (<div className="mt-1 text-red-600 font-semibold text-sm">{error}</div>)}
            </section>
            <section id="table" className="mt-2">
                {Object.keys(tableData).length > 0 ? <Table tableHead={tableHead[sheetName].tableHeading} tableBody={tableData} /> : <TableWithLoading tableHead={tableHead[sheetName].tableHeading} />}
            </section>
        </div>
    )
}

const tableHead: tableHeading = {
    projectedRebillRevenue: {
        tableHeading: ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"]
    },
    totalVipTracking: {
        tableHeading: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Invisilift", "Indestructible Tights", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"],
        campaignIds: {
            lashCosmetics: [61, 47, 1, 68, 9, 6, 67, 69, 70],
            browCharm: [88, 48, 24, 8, 20, 10, 28, 34, 35, 45, 83, 82],
            floralSecrets: [38, 46, 85, 12, 71, 55, 21, 15],
            invisilift: [16, 53, 31, 19],
            indestructibleTights: [56, 58, 59],
            fitcharm: [76, 81, 79],
            browPro: [97, 101, 99]
        }
    },
    upsellTakeRateReport: {
        tableHeading: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
        productIds: {
            offer1_upProdId: '1047,103,542,174,698,362,986,919,802,1179,8,51,791,249,220,452,1200,1100',
            offer1_downProductId: '699,221,496,9,1201,543,52,250,920,363,987,1101,104,1048,175,308,1251,803,453,406',
            offer2_upProdId: '498,316,1258,399,656,408',
            offer2_downProductId: '499,1259,657,409',
            offer3_upProdId: '317,1240,294,398,488,662',
            offer3_downProductId: '318,394,1229,146,110'
        }
    }
};

// Types
type tableHeading = {
    projectedRebillRevenue: tableSheet;
    totalVipTracking: tableSheet;
    upsellTakeRateReport: tableSheet;
}

type tableSheet = {
    tableHeading: string[];
    campaignIds?: {
        lashCosmetics: number[];
        browCharm: number[];
        floralSecrets: number[];
        invisilift: number[];
        indestructibleTights: number[];
        fitcharm: number[];
        browPro: number[];
    };
    productIds?: upsellProductIdsInterface
}

type upsellProductIdsInterface = {
    offer1_upProdId: string;
    offer1_downProductId: string;
    offer2_upProdId: string;
    offer2_downProductId: string;
    offer3_upProdId: string;
    offer3_downProductId: string;
}

type vipTableData = {
    dataPulled?: string;
    lashCosmetics?: number;
    browCharm?: number;
    floralSecrets?: number;
    invisilift?: number;
    indestructibleTights?: number;
    fitcharm?: number;
    browPro?: number;
    totalVips?: number;
    totalRecycle?: number;
    [key: string]: string | number | undefined; // Index signature
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
        dateRange: string;
        [key: string]: number | string;
    };
    earningsData: {
        dateRange: string;
        [key: string]: number | string;
    };
};