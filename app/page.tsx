import SheetDataPage from "@/lib/googleSheet";
import dynamic from "next/dynamic";
// import ReportChart from "./components/ReportChart";
// import LineChart from "./components/LineChart";
const LineChart = dynamic(() => import('./components/LineChart'), { ssr: true });
const ReportChart = dynamic(() => import('./components/ReportChart'), { ssr: true });

export default async function Home() {
  const projectedBilling: [string[]] = await SheetDataPage('NYMBUS', 'projectedRebillRevenue');
  // Extracting the necessary fields
  const dates: string[] = projectedBilling.map(item => item[0]); // Extract date range
  const revenues = projectedBilling.map(item => parseFloat(item[1].replace(/[^0-9.-]+/g, '')));
  const rebillCounts = projectedBilling.map(item => parseInt(item[3].replace(',', ''), 10)); // Parse rebill count as integer
  return (
    <>
      {revenues.length > 0 && (
        <div className="container mx-auto">
          <h1>Projected Rebill Revenue</h1>
          <ReportChart dates={dates} revenues={revenues} rebillCounts={rebillCounts} />
        </div>
      )}

    </>
  );
}
