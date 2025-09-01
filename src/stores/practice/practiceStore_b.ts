/* ------------------------------------------------------------------ */
/*  practiceStore — Zustand                                           */
/* ------------------------------------------------------------------ */

import { create } from 'zustand';

/* one frozen Set so selectors never allocate a fresh object */
export const EMPTY_SET: ReadonlySet<string> = new Set();

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface PracticeStore {
    /* state */
    current: number;                         // question in focus
    visited: Set<number>;                    // yellow / teal / orange
    attempted: Set<number>;                  // teal
    marked: Set<number>;                     // orange
    answers: Record<number, Set<string>>;    // qid → chosen option_ids

    /* actions */
    setCurrent:   (qid: number) => void;
    markVisited:  (qid: number) => void;
    toggleMarked: (qid: number) => void;
    markAnswer:   (qid: number, optId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers – return **new** Set to keep reactivity                    */
/* ------------------------------------------------------------------ */
const addNumber = (set: Set<number>, n: number) => {
    const next = new Set(set);
    next.add(n);
    return next;
};
const addString = (set: Set<string>, s: string) => {
    const next = new Set(set);
    next.add(s);
    return next;
};

/* ------------------------------------------------------------------ */
/*  Store definition                                                   */
/* ------------------------------------------------------------------ */
export const usePracticeStore = create<PracticeStore>()((set) => ({
    current: 1,
    visited: new Set(),
    attempted: new Set(),
    marked: new Set(),
    answers: {},

    /* focus a question + mark visited */
    setCurrent: (qid) =>
        set((state) => ({
            current: qid,
            visited: addNumber(state.visited, qid),
        })),

    /* explicit visit (yellow) */
    markVisited: (qid) =>
        set((state) => ({
            visited: addNumber(state.visited, qid),
        })),

    /* orange “marked for review” toggle */
    toggleMarked: (qid) =>
        set((state) => {
            const nextMarked = new Set(state.marked);
            nextMarked.has(qid) ? nextMarked.delete(qid) : nextMarked.add(qid);
            return {
                marked: nextMarked,
                visited: addNumber(state.visited, qid),
            };
        }),

    /* save an answer, flag attempted + visited */
    markAnswer: (qid, optId) =>
        set((state) => ({
            answers: {
                ...state.answers,
                [qid]: addString(state.answers[qid] ?? new Set(), optId),
            },
            attempted: addNumber(state.attempted, qid),
            visited: addNumber(state.visited, qid),
        })),
}));
