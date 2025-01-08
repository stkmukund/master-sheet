import { PRRreport } from "./components/chart";

export default function Home() {

  return (
    <>
      <main className="px-5">
        {/* <BrandSelector /> */}
        <div className="mb-16"></div>
        <PRRreport brandName="NYMBUS" />
        <div className="pb-24"></div>
        <PRRreport brandName="HELIKON" />
        <div className="pb-24"></div>
      </main>
    </>
  );
}
