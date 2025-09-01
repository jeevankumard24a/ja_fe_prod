import { create } from "zustand";

// Define a type for the store
type SearchStore = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

// Create the store with the defined type
const useSearchStore = create<SearchStore>((set) => ({
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
}));

export default useSearchStore;
