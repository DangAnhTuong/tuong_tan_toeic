# 🗣️ Knowledge Item: TOEIC Speaking & Writing AI Engine Architecture

---

## 1. Overview & Pedagogical Scope

The Speaking & Writing Modules (`/speaking`, `/speaking/practice`, `/write`, `/write/part1/:id`, `/write/part2/:id`) provide an automated AI coach for the 2 productive TOEIC skills, graded on the standard ETS **0 - 200 point scale**.

---

## 2. TOEIC Speaking AI Coach Architecture (`speaking.controller.js`)

### 2.1 5 Speaking Parts Structure
| Part | Title | Task Description | Prep Time | Speak Time |
|:---:|:---|:---|:---:|:---:|
| **Part 1** | Read a Text Aloud | Read supermarket, airport, or conference announcements aloud. | 45s | 45s |
| **Part 2** | Describe a Picture | Describe a high-res business/office picture in detail. | 45s | 30s |
| **Part 3** | Respond to Questions | Answer 3 conversational questions without preparation. | 3s | 15s / 30s |
| **Part 4** | Respond Using Info Provided | Answer 3 questions based on a conference or travel itinerary table. | 45s | 15s / 30s |
| **Part 5** | Express an Opinion | State and defend an opinion on business/workplace policies. | 45s | 60s |

### 2.2 Speech Recognition & AI Grading Rubric (`POST /api/v1/speaking/evaluate`)
* **Voice Capture**: Native Web Speech Recognition API streams live transcripts to the frontend.
* **Scoring Dimensions**:
  1. **Pronunciation & Intonation Accuracy** (Word matching percentage against expected ETS script).
  2. **Fluency & Hesitation Metric** (Calculates words-per-minute rate and pauses).
  3. **Lexical Richness & Relevance** (Evaluates keywords and sentence structures in Parts 2-5).
* **Automated Feedback Engine**:
  - Highlights mispronounced words and missing consonant clusters.
  - Suggests pitch modulation (rising intonation for lists, falling intonation for statements).

---

## 3. TOEIC Writing Engine Architecture (`writing.controller.js`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TOEIC WRITING 3 PARTS ARCHITECTURE                    │
├────────────────────────┬──────────────────────────┬─────────────────────────┤
│ Part 1: Write Sentence │ Part 2: Respond to Email │ Part 3: Opinion Essay   │
│ • 1 Image + 2 Keywords │ • Business email context │ • 300+ Words argument   │
│ • Syntax & grammar check│ • 20m countdown timer    │ • 30m countdown timer   │
│ • Score: 0 - 3 points  │ • Score: 0 - 4 points    │ • Score: 0 - 5 points   │
└────────────────────────┴──────────────────────────┴─────────────────────────┘
```

### 3.1 Part 1: Write a Sentence Based on a Picture
* Student must construct 1 grammatically correct sentence containing **2 mandatory keywords** (e.g. `carrying / tray`, `repair / equipment`).
* AI Evaluator validates:
  - Presence of both target lemmas.
  - Sentence length ($\ge 5$ words).
  - Subject-verb agreement and preposition usage.

### 3.2 Part 2: Respond to a Written Request (Email)
* Real-time 20-minute countdown timer with live word counter.
* AI Evaluator assesses:
  - Salutation and formal closing.
  - Answering all prompt requirements (e.g. 2 questions + 1 proposal).
  - Vocabulary sophistication and cohesion.

---

## 4. Maintenance & Testing Commands

* **Seed Writing Prompts**:
  ```bash
  cd backend && node src/seed/seedWritingData.js
  ```
* **Verify Speaking & Writing APIs in E2E Suite**:
  ```bash
  cd backend && node src/test/runFullSystemE2ETest.js
  ```
