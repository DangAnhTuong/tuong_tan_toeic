/**
 * Smart Word & Sentence Matching Utility for TOEIC Practice & Dictation
 * Handles:
 * - Direct matches & case-insensitivity
 * - Curly vs straight apostrophes (' vs ’, ‘, `, ´)
 * - Leading/trailing punctuation (periods, commas, question marks, quotation marks)
 * - Lenient fallback (allows typing "he's" for "hes" or vice versa)
 */

export function isWordMatch(userInput, targetWord) {
  if (!userInput || !targetWord) return false;

  const rawUser = String(userInput).trim().toLowerCase();
  const rawTarget = String(targetWord).trim().toLowerCase();

  // 1. Direct match (e.g., "washing" === "washing", "uniform" === "uniform")
  if (rawUser === rawTarget) return true;

  // 2. Normalized apostrophes (standard ' vs curly ’ \u2019 vs ‘ \u2018 vs ` \u0060 vs ´ \u00b4)
  const normUser = rawUser.replace(/[\u2018\u2019\u0060\u00b4]/g, "'");
  const normTarget = rawTarget.replace(/[\u2018\u2019\u0060\u00b4]/g, "'");
  if (normUser === normTarget) return true;

  // 3. Trim outer punctuation except internal apostrophes/hyphens
  const trimUser = normUser.replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
  const trimTarget = normTarget.replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
  if (trimUser && trimTarget && trimUser === trimTarget) return true;

  // 4. Lenient alphanumeric match (allow typing "hes" for "he's" or "he's" for "hes", "dont" for "don't")
  const alphaUser = rawUser.replace(/[^a-z0-9]/g, '');
  const alphaTarget = rawTarget.replace(/[^a-z0-9]/g, '');
  if (alphaUser.length > 0 && alphaUser === alphaTarget) return true;

  return false;
}

export function isSentenceMatch(userInput, targetSentence) {
  if (!userInput || !targetSentence) return false;
  const cleanUser = String(userInput).trim().toLowerCase().replace(/[\u2018\u2019\u0060\u00b4]/g, "'").replace(/[.,!?;:]+$/g, '');
  const cleanTarget = String(targetSentence).trim().toLowerCase().replace(/[\u2018\u2019\u0060\u00b4]/g, "'").replace(/[.,!?;:]+$/g, '');
  return cleanUser === cleanTarget;
}
