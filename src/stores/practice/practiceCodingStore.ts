// stores/useCodingStore.ts
import { create } from 'zustand'
// import { shallow } from 'zustand/shallow'

export type LangId = string

export interface CodingStore {
    /* ids of the question we’re on */
    practiceId:  string
    practiceQid: number

    /* language → default code (HTML)  */
    defaultCode: Record<LangId, string>
    /* language → user‑edited code     */
    userCode:    Record<LangId, string>

    /* which language is currently shown */
    selectedLang: LangId

    /* --------------- actions --------------- */
    setQuestion  : (
        practiceId:  string,
        practiceQid: number,
        defaults:     Array<{ lang_id: LangId; default_code_html: string }>
    ) => void

    setLanguage  : (lang: LangId)             => void
    setUserCode  : (lang: LangId, code: string) => void
    resetCode    : (lang?: LangId)            => void
}

/* -------- helper for immutable Set ---------- */
const omit = <T extends Record<string, unknown>>(obj: T, key: string) => {
    const { [key]: _, ...rest } = obj
    return rest as T
}

/* ==========  THE HOOK  ========== */
export const useCodingStore = create<CodingStore>()((set, get) => ({
    practiceId:   '',
    practiceQid:  0,
    defaultCode:  {},
    userCode:     {},
    selectedLang: '',

    /* ----- initialise when a new question arrives ----- */
    setQuestion: (practiceId, practiceQid, defaults) => {
        const dc: Record<LangId, string> = {}
        defaults.forEach(({ lang_id, default_code_html }) => {
            dc[lang_id] = default_code_html
        })

        set({
            practiceId,
            practiceQid,
            defaultCode:  dc,
            userCode:     {},                 // wipe previous edits
            selectedLang: defaults[0]?.lang_id ?? '',
        })
    },

    /* ----- ui helpers ----- */
    setLanguage: (lang) => set({ selectedLang: lang }),

    setUserCode: (lang, code) =>
        set((st) => ({
            userCode: { ...st.userCode, [lang]: code },
        })),

    resetCode: (lang) =>
        set((st) =>
            lang
                ? { userCode: omit(st.userCode, lang) } // only that language
                : { userCode: {} }                      // all languages
        ),
}))
