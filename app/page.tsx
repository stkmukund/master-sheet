import dynamic from "next/dynamic";
// import ReportChart from "./components/ReportChart";
// import LineChart from "./components/LineChart";
const LineChart = dynamic(() => import('./components/LineChart'), { ssr: true });
const ReportChart = dynamic(() => import('./components/ReportChart'), { ssr: true });

export default function Home() {
  // Data from your table
  const dates = [
    "11/12/24 - 12/11/24",
    "11/19/24 - 12/18/24",
    "11/26/24 - 12/25/24",
    "12/03/24 - 01/01/25",
    "12/10/24 - 01/08/25",
    "12/17/24 - 01/15/25",
    "12/24/24 - 01/22/25",
    "12/31/24 - 01/30/25",
    "01/07/25 - 02/05/25",
  ];

  const revenues = [
    1197845.65,
    1245946.27,
    1218337.29,
    1231161.75,
    1292956.07,
    1321178.51,
    1322414.48,
    1275118.66,
    1313241.45,
  ];

  const rebillCounts = [36537, 37994, 37161, 37478, 39341, 40213, 40248, 38975, 39892];

  return (
    <>
      {/* <NavBar /> */}
      <div style={{ width: "600px", margin: "50px auto" }}>
        <h1>Line Chart Example</h1>
        <LineChart />
      </div>
      <div className="container mx-auto">
        <h1>Report Chart</h1>
        <ReportChart dates={dates} revenues={revenues} rebillCounts={rebillCounts} />
      </div>
    </>
  );
}
