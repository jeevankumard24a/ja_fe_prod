// stores/usePracticeStore.ts
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export const EMPTY_SET: ReadonlySet<string> = new Set();

export interface QuestionPayload {
  questionId: number;
  visited: boolean;
  attempted: boolean;
  marked: boolean;
  answers: string[];
}

export interface PracticeStore {
  current: number;
  visited: Set<number>;
  attempted: Set<number>;
  marked: Set<number>;
  answers: Record<number, Set<string>>;
  correctAnswers: Record<number, Set<string>>;
  attemptedCorrect: Set<number>;
  attemptedWrong: Set<number>;
  runStatuses: Record<number, "Success" | "Fail">;

  setCurrent: (qid: number) => void;
  markVisited: (qid: number) => void;
  toggleMarked: (qid: number) => void;
  markAnswer: (qid: number, optId: string) => void;
  setCorrectAnswers: (qid: number, opts: string[]) => void;
  resetQuestion: (qid: number) => void;
  restoreQuestion: (raw: QuestionPayload) => void;

  getIsCorrect: (qid: number) => boolean;
  setRunStatus: (qid: number, status: "Success" | "Fail") => void;
}

const addNumber = (s: Set<number>, n: number) => {
  const ns = new Set(s);
  ns.add(n);
  return ns;
};
const addString = (s: Set<string>, v: string) => {
  const ns = new Set(s);
  ns.add(v);
  return ns;
};

export const usePracticeStore = create<PracticeStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ─── STATE ─────────────────────────────────────
        current: 1,
        visited: new Set(),
        attempted: new Set(),
        marked: new Set(),
        answers: {},
        correctAnswers: {},
        attemptedCorrect: new Set(),
        attemptedWrong: new Set(),
        runStatuses: {},

        // ─── ACTIONS ────────────────────────────────────
        setRunStatus: (qid, status) =>
          set((st) => ({
            runStatuses: { ...st.runStatuses, [qid]: status },
          })),

        setCurrent: (qid) =>
          set((st) => ({
            current: qid,
            visited: addNumber(st.visited, qid),
          })),

        markVisited: (qid) =>
          set((st) => ({
            visited: addNumber(st.visited, qid),
          })),

        toggleMarked: (qid) =>
          set((st) => {
            const m = new Set(st.marked);
            m.has(qid) ? m.delete(qid) : m.add(qid);
            return {
              marked: m,
              visited: addNumber(st.visited, qid),
            };
          }),

        setCorrectAnswers: (qid, opts) =>
          set((st) => ({
            correctAnswers: {
              ...st.correctAnswers,
              [qid]: new Set(opts),
            },
          })),

        markAnswer: (qid, optId) =>
          set((st) => {
            const newAns = addString(st.answers[qid] ?? new Set(), optId);
            const newVisited = addNumber(st.visited, qid);
            const newAtt = addNumber(st.attempted, qid);

            const correctSet = st.correctAnswers[qid] ?? new Set<string>();
            const hasWrong = [...newAns].some((a) => !correctSet.has(a));
            const allCorrect =
              correctSet.size > 0 &&
              newAns.size === correctSet.size &&
              [...correctSet].every((a) => newAns.has(a));

            return {
              answers: {
                ...st.answers,
                [qid]: newAns,
              },
              visited: newVisited,
              attempted: newAtt,
              attemptedWrong: hasWrong
                ? addNumber(st.attemptedWrong, qid)
                : st.attemptedWrong,
              attemptedCorrect: allCorrect
                ? addNumber(st.attemptedCorrect, qid)
                : st.attemptedCorrect,
            };
          }),

        resetQuestion: (qid) =>
          set((st) => {
            const newAnswers = { ...st.answers };
            delete newAnswers[qid];
            const newAtt = new Set(st.attempted);
            newAtt.delete(qid);
            const newAttCorrect = new Set(st.attemptedCorrect);
            newAttCorrect.delete(qid);
            const newAttWrong = new Set(st.attemptedWrong);
            newAttWrong.delete(qid);
            return {
              answers: newAnswers,
              attempted: newAtt,
              attemptedCorrect: newAttCorrect,
              attemptedWrong: newAttWrong,
            };
          }),

        restoreQuestion: (raw) =>
          set((st) => ({
            visited: raw.visited
              ? addNumber(st.visited, raw.questionId)
              : st.visited,
            attempted: raw.attempted
              ? addNumber(st.attempted, raw.questionId)
              : st.attempted,
            marked: raw.marked
              ? addNumber(st.marked, raw.questionId)
              : st.marked,
            answers: {
              ...st.answers,
              [raw.questionId]: new Set(raw.answers),
            },
          })),

        getIsCorrect: (qid) => {
          const userAns = get().answers[qid] ?? new Set<string>();
          const correct = get().correctAnswers[qid] ?? new Set<string>();
          return (
            correct.size > 0 &&
            userAns.size === correct.size &&
            [...correct].every((opt) => userAns.has(opt))
          );
        },
      }),
      {
        name: "practice-store",
        partialize: (st) => ({
          runStatuses: st.runStatuses,
          current: st.current,
          visited: Array.from(st.visited),
          attempted: Array.from(st.attempted),
          marked: Array.from(st.marked),
          answers: Object.fromEntries(
            Object.entries(st.answers).map(([qid, s]) => [qid, Array.from(s)]),
          ),
          correctAnswers: Object.fromEntries(
            Object.entries(st.correctAnswers).map(([qid, s]) => [
              qid,
              Array.from(s),
            ]),
          ),
          attemptedCorrect: Array.from(st.attemptedCorrect),
          attemptedWrong: Array.from(st.attemptedWrong),
        }),
        onRehydrateStorage: () => (state: any, err) => {
          if (err) {
            console.error("🔄 rehydrate failed", err);
            return;
          }
          if (!state) return;

          // rebuild Sets from plain arrays
          state.visited = new Set(state.visited as number[]);
          state.attempted = new Set(state.attempted as number[]);
          state.marked = new Set(state.marked as number[]);
          state.answers = Object.fromEntries(
            Object.entries(state.answers as Record<string, string[]>).map(
              ([qid, arr]) => [Number(qid), new Set(arr)],
            ),
          );
          state.correctAnswers = Object.fromEntries(
            Object.entries(
              state.correctAnswers as Record<string, string[]>,
            ).map(([qid, arr]) => [Number(qid), new Set(arr)]),
          );
          state.attemptedCorrect = new Set(state.attemptedCorrect as number[]);
          state.attemptedWrong = new Set(state.attemptedWrong as number[]);
        },
      },
    ),
  ),
);
