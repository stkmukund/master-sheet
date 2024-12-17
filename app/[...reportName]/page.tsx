'use client'
import BeanEater from "@/app/components/BeanEater";
import Button from "@/app/components/Button";
import Table from "@/app/components/Table";
import TableWithLoading from "@/app/components/TableWithLoading";
import { useParams } from "next/navigation";
import { useState } from "react";

type tableHeading = {
    projectedRebillRevenue: tableSheet;
    totalVipTracking: tableSheet;
    upsellTakeRateReport: tableSheet;
}

type tableSheet = {
    tableHeading: string[];
}

export default function masterSheet() {
    const params: { reportName: string[] } = useParams();
    const sheetName = params.reportName[1] as keyof tableHeading;;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tableData, setTableData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        tableHeading: ["Date Pulled", "Lash Cosmetics", "Brow Charm", "Floral Secrets", "Secret Lane", "Invisilift", "Indestructible Tights", "Scarlett Envy", "Mangolift", "Fitcharm", "Brow Pro", "Total Nymbus VIPs", "Total VIP Recycling"]
    },
    upsellTakeRateReport: {
        tableHeading: ["Date", " ", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"]
    }
};