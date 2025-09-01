// stores/usePracticeStore.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export const EMPTY_SET: ReadonlySet<string> = new Set()

/**
 * Payload for a single question’s state
 */
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

    setCurrent:   (qid: number) => void
    markVisited:  (qid: number) => void
    toggleMarked: (qid: number) => void
    markAnswer:   (qid: number, optId: string) => void

    /**
     * Restore one question’s state from server payload
     */
    restoreQuestion: (raw: QuestionPayload) => void
}

const addNumber = (set: Set<number>, n: number) => {
    const next = new Set(set)
    next.add(n)
    return next
}

const addString = (set: Set<string>, s: string) => {
    const next = new Set(set)
    next.add(s)
    return next
}

export const usePracticeStore = create<PracticeStore>()(
    // Enable subscribe(selector, listener) overload
    subscribeWithSelector(
        persist(
            (set) => ({
                current: 1,
                visited: new Set(),
                attempted: new Set(),
                marked: new Set(),
                answers: {},

                setCurrent: (qid) =>
                    set((state) => ({
                        current: qid,
                        visited: addNumber(state.visited, qid),
                    })),

                markVisited: (qid) =>
                    set((state) => ({
                        visited: addNumber(state.visited, qid),
                    })),

                toggleMarked: (qid) =>
                    set((state) => {
                        const next = new Set(state.marked)
                        next.has(qid) ? next.delete(qid) : next.add(qid)
                        return {
                            marked: next,
                            visited: addNumber(state.visited, qid),
                        }
                    }),

                markAnswer: (qid, optId) =>
                    set((state) => ({
                        answers: {
                            ...state.answers,
                            [qid]: addString(state.answers[qid] ?? new Set(), optId),
                        },
                        attempted: addNumber(state.attempted, qid),
                        visited:   addNumber(state.visited, qid),
                    })),

                restoreQuestion: (raw) =>
                    set((st) => ({
                        visited:   raw.visited   ? addNumber(st.visited, raw.questionId)   : st.visited,
                        attempted: raw.attempted ? addNumber(st.attempted, raw.questionId) : st.attempted,
                        marked:    raw.marked    ? addNumber(st.marked, raw.questionId)    : st.marked,
                        answers: {
                            ...st.answers,
                            [raw.questionId]: new Set(raw.answers),
                        },
                    })),
            }),
            {
                name: 'practice-store',
                partialize: (state) => ({
                    current:   state.current,
                    visited:   Array.from(state.visited),
                    attempted: Array.from(state.attempted),
                    marked:    Array.from(state.marked),
                    answers: Object.fromEntries(
                        Object.entries(state.answers).map(([qid, set]) => [
                            qid,
                            Array.from(set),
                        ])
                    ),
                }),
                onRehydrateStorage: () => (state, error) => {
                    if (error) {
                        console.error('🔄 failed to rehydrate practice-store', error)
                        return
                    }
                    if (state) {
                        state.visited   = new Set(state.visited as unknown as number[])
                        state.attempted = new Set(state.attempted as unknown as number[])
                        state.marked    = new Set(state.marked as unknown as number[])
                        state.answers   = Object.fromEntries(
                            Object.entries(state.answers as Record<string, unknown>).map(
                                ([qid, arr]) => [Number(qid), new Set(arr as string[])]
                            )
                        ) as Record<number, Set<string>>
                    }
                },
            }
        )
    )
)

/**
 * Serialize one question’s state for sending to server
 */
export function serializeQuestion(
    state: PracticeStore,
    qid: number
): QuestionPayload {
    return {
        questionId: qid,
        visited:    state.visited.has(qid),
        attempted:  state.attempted.has(qid),
        marked:     state.marked.has(qid),
        answers:    Array.from(state.answers[qid] ?? []),
    }
}
