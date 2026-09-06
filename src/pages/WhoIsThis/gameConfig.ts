// ─── "Who Is This?" session rules ───

/** Answer options per question: one correct name plus three distractors. */
export const OPTIONS_PER_QUESTION = 4

/**
 * Four options need four different people, so the game cannot start below this
 * many *active* people. The caregiver's Manage Game Data page shows the same number.
 */
export const MIN_ACTIVE_PEOPLE = OPTIONS_PER_QUESTION

/** Questions asked in one session. */
export const QUESTIONS_PER_SESSION = 10
