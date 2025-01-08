'use client'
import useChartStore from "../stores/ChartStore";

export default function BrandSelector() {
    const chartStore = useChartStore();
    return (
        <div id="brandSelector" className="container mx-auto">
            <label htmlFor="brandSelect" className="font-bold">Brand :</label>
            <select onChange={(e) => chartStore.setBrandSelected(e.target.value)} value={chartStore.brandSelected} name="brandSelect" id="brandSelect" className="bg-transparent border-0 border-b-2 border-zinc-400 px-2 outline-none appearance-none cursor-pointer">
                <option value="" disabled>Choose Brand</option>
                <option value="NYMBUS">Nymbus</option>
                <option value="HELIKON">Helikon</option>
            </select>
        </div>
    )
}
