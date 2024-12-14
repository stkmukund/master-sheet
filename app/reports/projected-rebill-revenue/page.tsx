'use client'
import MagnifierFlat from "@/app/components/icon/MagnifierFlat";
import Table from "@/app/components/Table";
import TableWithLoading from "@/app/components/TableWithLoading";
import { useState } from "react";

export default function ProjectedRebillRevenue() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tableData, setTableData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const date = e.target.value;
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

        if (e.target.id === "startDate") setStartDate(formattedValue);
        else if (e.target.id === "endDate") setEndDate(formattedValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent invalid key inputs
        if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        setLoading(true);
        const response = await fetch(`/master-sheet/projected-rebill-revenue/?startDate=${startDate}&endDate=${endDate}`).then(result => result.json());
        if (response.result === 'ERROR') {
            setError(response.message);
            setLoading(false);
        }
        if (response.result === 'SUCCESS') {
            setTableData(response.message);
            setLoading(false);
        }
    }

    return (
        <div className="max-w-screen-lg mx-auto">
            <section id="form">
                <form onSubmit={handleSubmit} className="flex items-center gap-4 text-black">
                    <input type="text" id="startDate" value={startDate} onInput={handleInputChange} onKeyDown={handleKeyDown} className="rounded-md w-fit h-[40px] p-2.5" placeholder="Start Date: MMDDYY" required />
                    <input type="text" id="endDate" value={endDate} onInput={handleInputChange} onKeyDown={handleKeyDown} className="rounded-md w-fit h-[40px] p-2.5" placeholder="End Date: MMDDYY" required />
                    <button disabled={loading}>
                        <MagnifierFlat loading={loading} />
                    </button>
                </form>
                {error && (<div className="mt-1 text-red-600 font-semibold text-sm">{error}</div>)}
            </section>
            <section id="table" className="mt-2">
                {Object.keys(tableData).length > 0 ? <Table tableHead={tableHead} tableBody={tableData} /> : <TableWithLoading />}
            </section>
        </div>
    )
}

const tableHead = ["Date (Next 30)", "Total Revenue", "Report Date", "Projected Approved Rebill Count"];