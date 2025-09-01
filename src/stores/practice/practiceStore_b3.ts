// stores/usePracticeStore.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export const EMPTY_SET: ReadonlySet<string> = new Set()

/** The shape we send/receive when syncing one question */
export interface QuestionPayload {
    questionId: number
    visited:    boolean
    attempted:  boolean
    marked:     boolean
    answers:    string[]
}

export interface PracticeStore {
    current: number
    visited: Set<number>
    attempted: Set<number>
    marked: Set<number>
    answers: Record<number, Set<string>>

    /** from server: which option-IDs are correct per question */
    correctAnswers: Record<number, Set<string>>

    /** Derived flags for fast lookup */
    attemptedCorrect: Set<number>
    attemptedWrong:   Set<number>

    /* ── Actions ───────────────────────────────────── */
    setCurrent:        (qid: number) => void
    markVisited:       (qid: number) => void
    toggleMarked:      (qid: number) => void
    markAnswer:        (qid: number, optId: string) => void
    setCorrectAnswers: (qid: number, opts: string[]) => void
    restoreQuestion:   (raw: QuestionPayload) => void

    /** Clear all clicks / flags for one question, back to “visited only” */
    resetQuestion:     (qid: number) => void

    /* ── Computed selector ─────────────────────────── */
    getIsCorrect:      (qid: number) => boolean
}

const addNumber = (s: Set<number>, n: number) => {
    const next = new Set(s)
    next.add(n)
    return next
}
const addString = (s: Set<string>, v: string) => {
    const next = new Set(s)
    next.add(v)
    return next
}

export const usePracticeStore = create<PracticeStore>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                // ─── STATE ───────────────────────────
                current: 1,
                visited: new Set(),
                attempted: new Set(),
                marked: new Set(),
                answers: {},

                correctAnswers: {},

                attemptedCorrect: new Set(),
                attemptedWrong:   new Set(),

                // ─── ACTIONS ─────────────────────────
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
                        const m = new Set(st.marked)
                        m.has(qid) ? m.delete(qid) : m.add(qid)
                        return {
                            marked: m,
                            visited: addNumber(st.visited, qid),
                        }
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
                        const newAns     = addString(st.answers[qid] ?? new Set(), optId)
                        const newVisited = addNumber(st.visited, qid)
                        const newAtt     = addNumber(st.attempted, qid)

                        const correctSet = st.correctAnswers[qid] ?? new Set<string>()
                        const hasWrong   = [...newAns].some(a => !correctSet.has(a))
                        const allCorrect =
                            correctSet.size > 0 &&
                            newAns.size === correctSet.size &&
                            [...correctSet].every(a => newAns.has(a))

                        return {
                            answers: {
                                ...st.answers,
                                [qid]: newAns,
                            },
                            visited:          newVisited,
                            attempted:        newAtt,
                            attemptedWrong:   hasWrong   ? addNumber(st.attemptedWrong,   qid) : st.attemptedWrong,
                            attemptedCorrect: allCorrect ? addNumber(st.attemptedCorrect, qid) : st.attemptedCorrect,
                        }
                    }),

                // ─── COMPUTED ─────────────────────────
                getIsCorrect: (qid) => {
                    const userAns = get().answers[qid]   ?? new Set<string>()
                    const correct = get().correctAnswers[qid] ?? new Set<string>()
                    return (
                        correct.size > 0 &&
                        userAns.size === correct.size &&
                        [...correct].every(opt => userAns.has(opt))
                    )
                },


                // ← add this at the bottom of your actions block:
                resetQuestion: (qid) =>
                    set((st) => {
                        // 1) copy answers but remove this qid
                        const newAnswers = { ...st.answers }
                        delete newAnswers[qid]

                        // 2) create new Sets without this qid
                        const newAttempted        = new Set(st.attempted)
                        const newAttemptedCorrect = new Set(st.attemptedCorrect)
                        const newAttemptedWrong   = new Set(st.attemptedWrong)
                        newAttempted.delete(qid)
                        newAttemptedCorrect.delete(qid)
                        newAttemptedWrong.delete(qid)

                        return {
                            answers:          newAnswers,
                            attempted:        newAttempted,
                            attemptedCorrect: newAttemptedCorrect,
                            attemptedWrong:   newAttemptedWrong,
                        }
                    }),

                // ─── HYDRATION ────────────────────────
                restoreQuestion: (raw) =>
                    set((st) => ({
                        visited:   raw.visited   ? addNumber(st.visited,   raw.questionId) : st.visited,
                        attempted: raw.attempted ? addNumber(st.attempted, raw.questionId) : st.attempted,
                        marked:    raw.marked    ? addNumber(st.marked,    raw.questionId) : st.marked,
                        answers: {
                            ...st.answers,
                            [raw.questionId]: new Set(raw.answers),
                        },
                    })),
            }),
            {
                name: 'practice-store',
                partialize: (st) => ({
                    current:          st.current,
                    visited:          Array.from(st.visited),
                    attempted:        Array.from(st.attempted),
                    marked:           Array.from(st.marked),
                    answers: Object.fromEntries(
                        Object.entries(st.answers).map(([qid, s]) => [
                            qid,
                            Array.from(s),
                        ])
                    ),

                    correctAnswers: Object.fromEntries(
                        Object.entries(st.correctAnswers).map(([qid, s]) => [
                            qid,
                            Array.from(s),
                        ])
                    ),

                    attemptedCorrect: Array.from(st.attemptedCorrect),
                    attemptedWrong:   Array.from(st.attemptedWrong),
                }),
                onRehydrateStorage: () => (state: any, err) => {
                    if (err) {
                        console.error('🔄 rehydrate failed', err)
                        return
                    }
                    if (!state) return

                    // turn arrays back into Sets
                    state.visited          = new Set(state.visited)
                    state.attempted        = new Set(state.atempted) // ← make sure this is spelled 'attempted'
                    state.marked           = new Set(state.marked)
                    state.answers          = Object.fromEntries(
                        Object.entries(state.answers).map(([qid, arr]) => [
                            Number(qid),
                            new Set(arr as string[]),
                        ])
                    )
                    state.correctAnswers   = Object.fromEntries(
                        Object.entries(state.correctAnswers).map(([qid, arr]) => [
                            Number(qid),
                            new Set(arr as string[]),
                        ])
                    )
                    state.attemptedCorrect = new Set(state.attemptedCorrect)
                    state.attemptedWrong   = new Set(state.attemptedWrong)
                },
            }
        )
    )
)
