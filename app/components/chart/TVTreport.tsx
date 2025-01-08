import SheetDataPage from "@/lib/googleSheet";
import ReportChart from "../ReportChart";

export default async function TVTreport() {
    const projectedBilling: [string[]] = await SheetDataPage('NYMBUS', 'projectedRebillRevenue');
    // Extracting the necessary fields
    const dates: string[] = projectedBilling.map(item => item[0]); // Extract date range
    const revenues = projectedBilling.map(item => parseFloat(item[1].replace(/[^0-9.-]+/g, '')));
    const rebillCounts = projectedBilling.map(item => parseInt(item[3].replace(',', ''), 10)); // Parse rebill count as integer
    return (
        <>
            {
                revenues.length > 0 && (
                    <div className="container mx-auto">
                        <h1 className="font-bold underline">Total VIP Tracking</h1>
                        <ReportChart dates={dates} revenues={revenues} rebillCounts={rebillCounts} />
                    </div>
                )
            }
        </>
    )
}
