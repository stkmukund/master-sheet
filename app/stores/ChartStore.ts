import { create } from "zustand";
// Define the store's state type
interface ChartStoreState {
    brandSelected: string;
    setBrandSelected: (brand: string) => void;
}

// Create the Zustand store with the state type
const useChartStore = create<ChartStoreState>((set) => ({
    brandSelected: '',
    setBrandSelected: (brand: string) => set({ brandSelected: brand }),
}));

export default useChartStore;
