// src/stores/create_course/cat_store.ts
import { create } from "zustand";

interface QData {
  item_id: string;
  item_desc: string;
}

interface CatStore {
  selectedCatId: string | null;
  selectedTagIds: string[];
  selectedQuestions: QData[];
  setSelectedCatId: (id: string) => void;
  setSelectedTagIds: (tagIds: string[]) => void;
  addQuestion: (q: QData) => void;
  removeQuestion: (item_id: string) => void;
}

export const useCatStore = create<CatStore>((set) => ({
  selectedCatId: null,
  selectedTagIds: [],
  selectedQuestions: [],
  setSelectedCatId: (id) => set({ selectedCatId: id }),
  setSelectedTagIds: (tagIds) => set({ selectedTagIds: tagIds }),
  addQuestion: (q) =>
    set((state) => ({
      selectedQuestions: [...state.selectedQuestions, q],
    })),
  removeQuestion: (item_id) =>
    set((state) => ({
      selectedQuestions: state.selectedQuestions.filter(
        (q) => q.item_id !== item_id,
      ),
    })),
}));
