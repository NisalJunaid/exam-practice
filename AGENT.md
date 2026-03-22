# Exam Prep App Blueprint

## Project Overview

This document is the canonical product and engineering blueprint for an exam paper practice app built with:

* **Backend:** Laravel 10
* **Frontend:** React
* **Database:** MySQL
* **UI:** shadcn/ui components
* **Primary feature set:** paper practice, answer submission, AI marking, score assignment, and per-question feedback after paper completion

This blueprint is written to be used as a **Codex reference document** during implementation and iteration. The goal is to keep architecture, naming, folder structure, UX behavior, data contracts, and file responsibilities stable so code generation and refactoring remain consistent over time.

---

## Product Goal

The app allows students to:

1. choose an exam board, level, subject, and paper
2. take a full paper in a focused exam-like interface
3. submit all answers only after finishing the paper
4. have answers marked by AI against a stored reference answer, rubric, and max marks
5. review results with:

   * total score
   * per-question awarded marks
   * marking reasoning
   * strengths
   * mistakes
   * improvement feedback

The app also allows admins to:

1. upload a question paper PDF and a matching mark scheme PDF
2. use AI-assisted extraction to produce a structured draft JSON for the full paper
3. preview extracted metadata, questions, marks, and scheme answers before saving
4. edit and verify extracted items
5. confirm the import only after review, which then saves the paper into the live app

The first version should not include live tutoring, chat, revision planning, handwriting upload, or adaptive quizzes.

---

## Core Product Rules

1. **Paper-first workflow**

   * Students complete the entire paper before seeing feedback.
   * No answer reveal during the paper attempt.

2. **AI marks after submission**

   * AI assigns score, reasons for score, and feedback.
   * AI must be guided by reference answer and marking guidelines stored in the database.

3. **Transparent review**

   * Every question review must show:

     * the question
     * the student answer
     * awarded score out of max marks
     * reasoning for score
     * feedback on improvement

4. **Stable data contracts**

   * API payloads and frontend types should remain predictable for Codex iteration.

5. **Structured UI**

   * Interface must feel like an exam system, not a chatbot.

---

## Suggested Monorepo / Project Layout

Two-project layout is preferred:

* `backend/` → Laravel 10 API
* `frontend/` → React app with shadcn/ui

Alternative is one repo with `/api` and `/web`, but the two-folder split is easier for ownership and clearer for Codex.

```text
root/
  backend/
  frontend/
  docs/
```

This blueprint can live inside:

```text
docs/exam-prep-app-blueprint.md
```

---

# 1. Backend Blueprint (Laravel 10)

## Backend Responsibilities

Laravel handles:

* authentication
* admin content management
* question, paper, and rubric storage
* student attempt lifecycle
* answer submission storage
* AI marking orchestration
* result persistence
* reporting APIs for review screens

Laravel should expose a JSON API only.

---

## Backend Directory Structure

```text
backend/
  app/
    Console/
    Exceptions/
    Http/
      Controllers/
        Api/
          Auth/
          Student/
          Admin/
      Middleware/
      Requests/
        Auth/
        Student/
        Admin/
      Resources/
        Student/
        Admin/
    Jobs/
    Models/
    Policies/
    Services/
      AI/
      Marking/
      Papers/
      Attempts/
    DTOs/
    Enums/
    Actions/
  bootstrap/
  config/
  database/
    factories/
    migrations/
    seeders/
  routes/
    api.php
  tests/
    Feature/
    Unit/
```

---

## Backend Domain Models

### Core Models

1. `User`
2. `ExamBoard`
3. `ExamLevel`
4. `Subject`
5. `Paper`
6. `PaperQuestion`
7. `QuestionRubric`
8. `PaperAttempt`
9. `AttemptAnswer`
10. `AttemptMarking`
11. `AiMarkingLog`

Optional later:

* `Topic`
* `YearSession`
* `PaperSection`

---

## Database Schema Blueprint

### 1. users

Purpose: student and admin accounts.

Suggested fields:

* `id`
* `name`
* `email`
* `password`
* `role` (`admin`, `student`)
* `created_at`
* `updated_at`

### 2. exam_boards

Fields:

* `id`
* `name` (Oxford, Edexcel)
* `slug`
* `created_at`
* `updated_at`

### 3. exam_levels

Fields:

* `id`
* `name` (O Level, A Level)
* `slug`
* `created_at`
* `updated_at`

### 4. subjects

Fields:

* `id`
* `exam_board_id`
* `exam_level_id`
* `name`
* `slug`
* `code` nullable
* `created_at`
* `updated_at`

### 5. papers

Fields:

* `id`
* `subject_id`
* `title`
* `slug`
* `paper_code` nullable
* `year` nullable
* `session` nullable
* `duration_minutes` nullable
* `total_marks`
* `instructions` longText nullable
* `is_published` boolean default false
* `created_at`
* `updated_at`

### 6. paper_questions

Fields:

* `id`
* `paper_id`
* `question_number`
* `question_text` longText
* `reference_answer` longText
* `max_marks` unsigned integer
* `marking_guidelines` longText nullable
* `sample_full_mark_answer` longText nullable
* `order_index`
* `created_at`
* `updated_at`

Notes:

* Keep one record per displayed question.
* If subparts are needed later, introduce `question_parts` table.

### 7. question_rubrics

Fields:

* `id`
* `paper_question_id`
* `band_descriptor` longText nullable
* `keywords_expected` json nullable
* `common_mistakes` json nullable
* `acceptable_alternatives` json nullable
* `marker_notes` longText nullable
* `created_at`
* `updated_at`

Purpose:

* richer AI context for consistent scoring

### 8. paper_attempts

Fields:

* `id`
* `user_id`
* `paper_id`
* `status` (`in_progress`, `submitted`, `marking`, `completed`, `failed`)
* `started_at`
* `submitted_at` nullable
* `completed_at` nullable
* `total_awarded_marks` nullable
* `total_max_marks`
* `marking_summary` longText nullable
* `created_at`
* `updated_at`

### 9. attempt_answers

Fields:

* `id`
* `paper_attempt_id`
* `paper_question_id`
* `student_answer` longText nullable
* `is_blank` boolean default false
* `submitted_at` nullable
* `created_at`
* `updated_at`

### 10. attempt_markings

Fields:

* `id`
* `paper_attempt_id`
* `attempt_answer_id`
* `paper_question_id`
* `awarded_marks`
* `max_marks`
* `reasoning` longText
* `feedback` longText
* `strengths` json nullable
* `mistakes` json nullable
* `ai_confidence` decimal(5,2) nullable
* `created_at`
* `updated_at`

### 11. ai_marking_logs

Fields:

* `id`
* `paper_attempt_id`
* `attempt_answer_id` nullable
* `provider`
* `model_name`
* `request_payload` longText
* `response_payload` longText nullable
* `status` (`success`, `failed`, `invalid_output`)
* `error_message` longText nullable
* `created_at`
* `updated_at`

Purpose:

* troubleshooting
* prompt versioning
* audit trail

---

## Eloquent Model Responsibilities

### `app/Models/User.php`

Functions:

* `attempts()`
* `isAdmin()`
* `isStudent()`

### `app/Models/ExamBoard.php`

Functions:

* `subjects()`

### `app/Models/ExamLevel.php`

Functions:

* `subjects()`

### `app/Models/Subject.php`

Functions:

* `examBoard()`
* `examLevel()`
* `papers()`

### `app/Models/Paper.php`

Functions:

* `subject()`
* `questions()`
* `attempts()`
* `publishedScope()`
* `calculateTotalMarks()`

### `app/Models/PaperQuestion.php`

Functions:

* `paper()`
* `rubric()`
* `attemptAnswers()`
* `attemptMarkings()`

### `app/Models/QuestionRubric.php`

Functions:

* `question()`

### `app/Models/PaperAttempt.php`

Functions:

* `user()`
* `paper()`
* `answers()`
* `markings()`
* `isSubmittable()`
* `isCompleted()`
* `calculateAwardedMarks()`

### `app/Models/AttemptAnswer.php`

Functions:

* `attempt()`
* `question()`
* `marking()`

### `app/Models/AttemptMarking.php`

Functions:

* `attempt()`
* `answer()`
* `question()`

### `app/Models/AiMarkingLog.php`

Functions:

* `attempt()`
* `answer()`

---

## Laravel Enums

Create PHP enums for stable status values.

### `app/Enums/UserRole.php`

Values:

* `ADMIN`
* `STUDENT`

### `app/Enums/PaperAttemptStatus.php`

Values:

* `IN_PROGRESS`
* `SUBMITTED`
* `MARKING`
* `COMPLETED`
* `FAILED`

### `app/Enums/AiLogStatus.php`

Values:

* `SUCCESS`
* `FAILED`
* `INVALID_OUTPUT`

These enums should be used in models, validation, and services.

---

## API Routes Blueprint

### `routes/api.php`

Organize by role and feature.

Suggested route groups:

```php
Route::prefix('auth')->group(...);
Route::middleware('auth:sanctum')->group(...);
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(...);
```

### Public/Auth endpoints

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me`

### Student endpoints

* `GET /api/student/catalog`
* `GET /api/student/papers`
* `GET /api/student/papers/{paper}`
* `POST /api/student/papers/{paper}/attempts`
* `GET /api/student/attempts/{attempt}`
* `PUT /api/student/attempts/{attempt}/answers`
* `POST /api/student/attempts/{attempt}/submit`
* `GET /api/student/attempts/{attempt}/results`
* `GET /api/student/attempts/{attempt}/review`

### Admin endpoints

* `GET /api/admin/exam-boards`
* `GET /api/admin/subjects`
* `GET /api/admin/papers`
* `POST /api/admin/papers`
* `GET /api/admin/papers/{paper}`
* `PUT /api/admin/papers/{paper}`
* `DELETE /api/admin/papers/{paper}`
* `POST /api/admin/papers/{paper}/questions`
* `PUT /api/admin/questions/{question}`
* `DELETE /api/admin/questions/{question}`
* `PUT /api/admin/questions/{question}/rubric`
* `POST /api/admin/papers/{paper}/publish`
* `POST /api/admin/imports`
* `GET /api/admin/imports/{import}`
* `GET /api/admin/imports/{import}/items`
* `PUT /api/admin/import-items/{item}`
* `POST /api/admin/imports/{import}/approve`

---

## Controller Blueprint

### `app/Http/Controllers/Api/Auth/AuthController.php`

Functions:

* `register(RegisterRequest $request)`
* `login(LoginRequest $request)`
* `logout(Request $request)`
* `me(Request $request)`

Responsibilities:

* token issuance
* auth user profile response

### `app/Http/Controllers/Api/Student/CatalogController.php`

Functions:

* `index()`

Responsibilities:

* return exam boards, levels, subjects, and filters for paper search UI

### `app/Http/Controllers/Api/Student/PaperController.php`

Functions:

* `index(PaperIndexRequest $request)`
* `show(Paper $paper)`

Responsibilities:

* list available papers
* show paper metadata and instructions
* do not expose reference answers

### `app/Http/Controllers/Api/Student/AttemptController.php`

Functions:

* `store(Paper $paper)`
* `show(PaperAttempt $attempt)`
* `updateAnswers(UpdateAttemptAnswersRequest $request, PaperAttempt $attempt)`
* `submit(SubmitAttemptRequest $request, PaperAttempt $attempt)`
* `results(PaperAttempt $attempt)`
* `review(PaperAttempt $attempt)`

Responsibilities:

* create attempts
* save draft answers
* submit attempt
* dispatch AI marking
* return summary and full review

### `app/Http/Controllers/Api/Admin/PaperAdminController.php`

Functions:

* `index()`
* `store(StorePaperRequest $request)`
* `show(Paper $paper)`
* `update(UpdatePaperRequest $request, Paper $paper)`
* `destroy(Paper $paper)`
* `publish(Paper $paper)`

### `app/Http/Controllers/Api/Admin/QuestionAdminController.php`

Functions:

* `store(StoreQuestionRequest $request, Paper $paper)`
* `update(UpdateQuestionRequest $request, PaperQuestion $question)`
* `destroy(PaperQuestion $question)`
* `updateRubric(UpdateQuestionRubricRequest $request, PaperQuestion $question)`

Responsibilities:

* manage question body, reference answer, marks, and rubric fields

---

## Form Request Blueprint

### Auth Requests

* `RegisterRequest`
* `LoginRequest`

### Student Requests

* `PaperIndexRequest`
* `UpdateAttemptAnswersRequest`
* `SubmitAttemptRequest`

### Admin Requests

* `StorePaperRequest`
* `UpdatePaperRequest`
* `StoreQuestionRequest`
* `UpdateQuestionRequest`
* `UpdateQuestionRubricRequest`

Validation examples:

#### `UpdateAttemptAnswersRequest`

Validate:

* `answers` is an array
* each answer contains:

  * `paper_question_id`
  * `student_answer`

#### `StoreQuestionRequest`

Validate:

* `question_text`
* `reference_answer`
* `max_marks`
* `marking_guidelines` nullable
* `sample_full_mark_answer` nullable

---

## API Resource Classes

### Student Resources

* `PaperListResource`
* `PaperDetailResource`
* `AttemptResource`
* `AttemptResultResource`
* `AttemptReviewResource`

### Admin Resources

* `AdminPaperResource`
* `AdminQuestionResource`

Purpose:

* stable API responses
* consistent shape for React types

---

## Service Layer Blueprint

This app should keep business logic out of controllers.

### `app/Services/Papers/PaperCatalogService.php`

Functions:

* `getCatalogFilters(): array`
* `searchPublishedPapers(array $filters)`
* `getPaperForStudent(Paper $paper): Paper`

### `app/Services/Attempts/AttemptService.php`

Functions:

* `createAttempt(User $user, Paper $paper): PaperAttempt`
* `saveAnswers(PaperAttempt $attempt, array $answers): PaperAttempt`
* `submitAttempt(PaperAttempt $attempt): PaperAttempt`
* `completeAttempt(PaperAttempt $attempt): PaperAttempt`
* `calculateTotals(PaperAttempt $attempt): array`

Responsibilities:

* manage attempt lifecycle

### `app/Services/Marking/MarkingOrchestrator.php`

Functions:

* `markAttempt(PaperAttempt $attempt): void`
* `markAnswer(AttemptAnswer $answer): AttemptMarking`
* `persistAttemptSummary(PaperAttempt $attempt): void`

Responsibilities:

* iterate over all answers in an attempt
* call AI service per answer or in batches
* write marking records
* update attempt totals

### `app/Services/Marking/MarkingPromptBuilder.php`

Functions:

* `buildForAnswer(AttemptAnswer $answer): array`
* `buildSystemPrompt(): string`
* `buildUserPrompt(AttemptAnswer $answer): string`

Responsibilities:

* construct stable prompt payloads
* centralize prompt versioning

### `app/Services/AI/OpenAIClient.php`

Functions:

* `markAnswer(array $payload): array`

Responsibilities:

* call OpenAI Responses API or chat completion equivalent
* return decoded response
* handle retries and request logging

### `app/Services/Marking/MarkingResponseValidator.php`

Functions:

* `validate(array $response, int $maxMarks): array`
* `normalize(array $response, int $maxMarks): array`

Responsibilities:

* ensure awarded score is valid
* ensure required keys exist
* sanitize malformed output

### `app/Services/Marking/AttemptReviewBuilder.php`

Functions:

* `buildResultsPayload(PaperAttempt $attempt): array`
* `buildReviewPayload(PaperAttempt $attempt): array`

Responsibilities:

* prepare summary and detailed review JSON payloads

---

## Queue / Job Blueprint

AI marking should run in a queue job after attempt submission.

### `app/Jobs/MarkPaperAttemptJob.php`

Functions:

* `__construct(int $attemptId)`
* `handle(MarkingOrchestrator $orchestrator)`
* `failed(Throwable $exception)`

Responsibilities:

* set attempt status to `marking`
* process answer markups
* set attempt to `completed` or `failed`

### Why queue it?

* avoids blocking the API request too long
* supports retries
* better user experience for larger papers

### Submission UX implication

When student submits paper:

* API returns accepted response
* frontend moves to marking progress screen
* polling checks results endpoint until complete

---

## Actions Layer (Optional but Useful)

If preferred, use small actions instead of heavy services.

Suggested actions:

* `CreatePaperAttemptAction`
* `SaveAttemptAnswersAction`
* `SubmitPaperAttemptAction`
* `MarkSingleAnswerAction`
* `UpdateAttemptTotalsAction`

These are optional but help Codex keep class responsibilities narrow.

---

## Policy Layer

### `app/Policies/PaperAttemptPolicy.php`

Functions:

* `view(User $user, PaperAttempt $attempt)`
* `update(User $user, PaperAttempt $attempt)`
* `submit(User $user, PaperAttempt $attempt)`
* `review(User $user, PaperAttempt $attempt)`

Purpose:

* ensure students can access only their own attempts

### `app/Policies/PaperPolicy.php`

Functions:

* `viewAdmin(User $user)`
* `manage(User $user)`

---

## Middleware

### `app/Http/Middleware/AdminMiddleware.php`

Responsibility:

* restrict admin routes to admin role

---

## Suggested Migration Files

```text
database/migrations/
  202x_xx_xx_create_exam_boards_table.php
  202x_xx_xx_create_exam_levels_table.php
  202x_xx_xx_create_subjects_table.php
  202x_xx_xx_create_papers_table.php
  202x_xx_xx_create_paper_questions_table.php
  202x_xx_xx_create_question_rubrics_table.php
  202x_xx_xx_create_paper_attempts_table.php
  202x_xx_xx_create_attempt_answers_table.php
  202x_xx_xx_create_attempt_markings_table.php
  202x_xx_xx_create_ai_marking_logs_table.php
```

---

## Seeder Strategy

### `database/seeders/ExamBoardSeeder.php`

Seed:

* Oxford
* Edexcel

### `database/seeders/ExamLevelSeeder.php`

Seed:

* O Level
* A Level

### `database/seeders/AdminUserSeeder.php`

Seed a default admin account for local development.

### `database/seeders/SubjectSeeder.php`

Seed a few initial subjects.

### `database/seeders/DemoPaperSeeder.php`

Seed one or two sample papers for testing UI and AI marking flow.

---

## Testing Blueprint (Backend)

### Feature tests

Create tests for:

* auth flow
* paper listing
* attempt creation
* answer saving
* attempt submission
* marking completion
* review retrieval
* admin paper creation

Suggested files:

```text
tests/Feature/Auth/LoginTest.php
tests/Feature/Student/ListPapersTest.php
tests/Feature/Student/CreateAttemptTest.php
tests/Feature/Student/SaveAttemptAnswersTest.php
tests/Feature/Student/SubmitAttemptTest.php
tests/Feature/Student/ViewResultsTest.php
tests/Feature/Admin/CreatePaperTest.php
tests/Feature/Admin/CreateQuestionTest.php
```

### Unit tests

Test:

* prompt builder
* response validator
* totals calculation

Suggested files:

```text
tests/Unit/Services/MarkingPromptBuilderTest.php
tests/Unit/Services/MarkingResponseValidatorTest.php
tests/Unit/Services/AttemptServiceTest.php
```

---

# 2. AI Marking Blueprint

## AI Role in the App

The AI is responsible for two separate jobs:

### A. Post-submission marking

* reading the question
* reading the student answer
* reading the reference answer and marking guidelines
* assigning marks up to the allowed max
* giving reasons for the score
* giving learning feedback

### B. Admin-side import extraction

* reading uploaded question paper text/page chunks
* reading uploaded mark scheme text/page chunks
* extracting structured draft metadata
* extracting question trees and lowest-answerable units
* extracting mark-scheme entries and marks
* returning normalized JSON for preview before confirmation

The AI is not responsible for:

* changing the official max marks after admin confirmation without evidence
* inventing new exam criteria
* auto-publishing imported papers without review
* exposing hidden system instructions

---

## Prompt Contract

There are two prompt contracts in this app.

### 1. Marking prompt contract

Every answer marking request should include:

* exam board
* level
* subject
* paper title
* question number
* question text
* max marks
* reference answer
* marking guidelines
* sample full-mark answer if available
* student answer

The AI must be instructed to return strict JSON.

#### Required JSON shape

```json
{
  "awarded_score": 0,
  "max_score": 0,
  "reasoning": "",
  "feedback": "",
  "strengths": [],
  "mistakes": [],
  "ai_confidence": 0
}
```

#### Rules for validator

* `awarded_score` must be `0 <= awarded_score <= max_score`
* `max_score` must equal stored `max_marks`
* `reasoning` cannot be empty
* `feedback` cannot be empty
* `strengths` and `mistakes` must be arrays

### 2. Import extraction prompt contract

The extraction pipeline should use AI to return structured draft JSON from uploaded paper and mark scheme documents.

The model must be instructed to:

* preserve question numbering exactly
* preserve subpart hierarchy
* use the lowest answerable unit as the extracted question item
* include `question_key`
* include `parent_key` where relevant
* include `stem_context`
* include `question_text`
* include `max_marks`
* include `reference_answer`
* include `marking_guidelines`
* include source page numbers
* flag uncertain items instead of guessing
* return strict JSON only

#### Recommended draft extraction JSON shape

```json
{
  "paper": {
    "title": "",
    "board": "",
    "level": "",
    "subject": "",
    "paper_code": "",
    "session": "",
    "year": 0,
    "duration_minutes": 0,
    "total_marks": 0
  },
  "questions": [
    {
      "question_key": "",
      "parent_key": null,
      "sort_order": 0,
      "stem_context": "",
      "question_text": "",
      "max_marks": 0,
      "reference_answer": "",
      "marking_guidelines": "",
      "source": {
        "question_page": 0,
        "mark_scheme_page": 0
      },
      "flags": {
        "needs_review": false,
        "has_visual": false,
        "low_confidence_match": false
      }
    }
  ]
}
```

This draft JSON is not saved directly as a live paper. It must go through backend validation and admin preview/confirmation first.

## AI Error Handling

### Marking errors

If a marking response is malformed:

1. retry once with stricter prompt
2. if still invalid, mark attempt as failed or partial failed
3. log the raw payload in `ai_marking_logs`

Optional fallback:

* award zero only when answer is blank and clearly blank
* otherwise hold the attempt in failed state for admin review

### Import extraction errors

If an extraction response is malformed:

1. retry once with stricter import prompt
2. if still invalid, mark the import as `failed`
3. save raw AI payloads and validation errors
4. do not create any live paper records

If extraction is partially valid:

* set import status to `needs_review`
* flag missing or ambiguous items
* allow admin to edit before confirmation

## AI Performance Strategy

For MVP, mark answers one by one for clarity.

Later optimization:

* batch small-answer questions in one request
* keep long-answer questions one-by-one

For Codex clarity, implement single-answer marking first, then refactor later if needed.

---

# 3. Frontend Blueprint (React + shadcn/ui)

## Frontend Responsibilities

React handles:

* auth screens
* paper browsing
* exam attempt UI
* autosave answer draft UI
* submit flow
* marking progress screen
* result summary UI
* per-question review UI
* admin paper management screens
* admin import upload screen
* admin import preview and verification screen
* admin confirmation flow before saving extracted papers

---

## Suggested Frontend Stack

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* Axios or Fetch wrapper
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod

This is a strong setup for component clarity and maintainability.

---

## Frontend Directory Structure

```text
frontend/
  src/
    app/
      router/
      providers/
    components/
      ui/
      layout/
      common/
      paper/
      attempt/
      review/
      admin/
    features/
      auth/
      catalog/
      papers/
      attempts/
      review/
      admin/
    hooks/
    lib/
      api/
      utils/
      constants/
      types/
    pages/
    styles/
```

---

## Frontend Route Blueprint

### Public routes

* `/login`
* `/register`

### Student routes

* `/dashboard`
* `/papers`
* `/papers/:paperId`
* `/attempts/:attemptId/take`
* `/attempts/:attemptId/marking`
* `/attempts/:attemptId/results`
* `/attempts/:attemptId/review`

### Admin routes

* `/admin`
* `/admin/papers`
* `/admin/papers/new`
* `/admin/papers/:paperId/edit`
* `/admin/questions/:questionId/edit`
* `/admin/imports/new`
* `/admin/imports/:importId/review`

---

## Frontend Page Blueprint

### `src/pages/LoginPage.tsx`

Responsibilities:

* render login form
* call login mutation
* route by role

### `src/pages/RegisterPage.tsx`

Responsibilities:

* render registration form
* create student account

### `src/pages/DashboardPage.tsx`

Responsibilities:

* show quick entry to paper catalog
* show recent attempts

### `src/pages/PaperCatalogPage.tsx`

Responsibilities:

* filters for board, level, subject
* paper list cards

### `src/pages/PaperDetailPage.tsx`

Responsibilities:

* show paper instructions
* show total marks and duration
* allow start attempt

### `src/pages/TakeAttemptPage.tsx`

Responsibilities:

* render full paper
* allow typed responses
* autosave answers
* show question navigator
* handle final submit

### `src/pages/MarkingProgressPage.tsx`

Responsibilities:

* show marking in progress state
* poll result endpoint
* route to results when completed

### `src/pages/AttemptResultsPage.tsx`

Responsibilities:

* show score summary
* show quick question status cards
* link to detailed review

### `src/pages/AttemptReviewPage.tsx`

Responsibilities:

* display each question with student answer, score, reasoning, and feedback

### Admin pages

* `AdminDashboardPage.tsx`
* `AdminPaperListPage.tsx`
* `AdminCreatePaperPage.tsx`
* `AdminEditPaperPage.tsx`
* `AdminEditQuestionPage.tsx`
* `AdminImportPaperPage.tsx`
* `AdminImportReviewPage.tsx`

---

## Frontend Feature Modules

### `src/features/auth/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/LoginForm.tsx`
* `components/RegisterForm.tsx`

Functions:

* `login()`
* `register()`
* `logout()`
* `useCurrentUser()`

### `src/features/catalog/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/CatalogFilters.tsx`
* `components/PaperCard.tsx`

Functions:

* `fetchCatalog()`
* `fetchPapers(filters)`
* `useCatalog()`
* `usePapers(filters)`

### `src/features/papers/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/PaperHeader.tsx`
* `components/PaperInstructionsCard.tsx`

Functions:

* `fetchPaper(paperId)`
* `startAttempt(paperId)`

### `src/features/attempts/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/AttemptHeader.tsx`
* `components/QuestionNavigator.tsx`
* `components/QuestionAnswerCard.tsx`
* `components/SubmitAttemptDialog.tsx`

Functions:

* `fetchAttempt(attemptId)`
* `saveAttemptAnswers(attemptId, payload)`
* `submitAttempt(attemptId)`
* `useAttempt()`
* `useSaveAttemptAnswers()`
* `useSubmitAttempt()`

### `src/features/review/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/ResultsSummaryCard.tsx`
* `components/QuestionReviewCard.tsx`
* `components/FeedbackPanel.tsx`
* `components/MarkBreakdownBadge.tsx`

Functions:

* `fetchResults(attemptId)`
* `fetchReview(attemptId)`
* `useResults()`
* `useReview()`

### `src/features/admin/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/PaperForm.tsx`
* `components/QuestionForm.tsx`
* `components/RubricForm.tsx`

Functions:

* `createPaper()`
* `updatePaper()`
* `createQuestion()`
* `updateQuestion()`
* `updateRubric()`

### `src/features/imports/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/ImportUploadForm.tsx`
* `components/ImportSummaryCard.tsx`
* `components/ImportItemReviewTable.tsx`
* `components/ImportItemEditorDialog.tsx`
* `components/ImportMatchStatusBadge.tsx`

Functions:

* `createImport()`
* `fetchImport(importId)`
* `fetchImportItems(importId)`
* `updateImportItem(itemId, payload)`
* `approveImport(importId)`
* `useImport()`
* `useImportItems()`
* `useApproveImport()`

## Shared Components Blueprint

### `src/components/layout/AppShell.tsx`

Responsibilities:

* top nav
* sidebar
* page container

### `src/components/layout/StudentShell.tsx`

Responsibilities:

* student navigation
* responsive layout

### `src/components/layout/AdminShell.tsx`

Responsibilities:

* admin navigation

### `src/components/common/EmptyState.tsx`

Responsibilities:

* reusable empty states

### `src/components/common/ErrorState.tsx`

Responsibilities:

* reusable API error states

### `src/components/common/LoadingState.tsx`

Responsibilities:

* reusable skeleton/loading UI

---

## UI Components Using shadcn/ui

Recommended component usage:

* `Button`
* `Card`
* `Badge`
* `Input`
* `Textarea`
* `Label`
* `Select`
* `Dialog`
* `Tabs`
* `Accordion`
* `ScrollArea`
* `Separator`
* `Skeleton`
* `Alert`
* `Toast`
* `Sheet`
* `Tooltip`
* `Progress`

Use existing shadcn conventions instead of custom low-level components wherever possible.

---

# 4. UI/UX Requirements

## UX Principles

1. **Exam focus first**

   * clean layout
   * minimal distractions
   * clear progress through the paper

2. **Clarity over novelty**

   * avoid flashy educational UI patterns
   * prioritize readability and confidence

3. **Feedback must feel fair**

   * show awarded marks clearly
   * explain how score was reached

4. **Admin workflow must be efficient**

   * quick question creation and editing
   * easy rubric maintenance

---

## Visual Tone

Use a modern academic style:

* neutral colors
* calm contrast
* strong spacing
* clear typography hierarchy
* very readable text blocks for long questions and feedback

Avoid making it look like a game in V1.

---

## Student UX Requirements

### Paper Catalog UX

Must allow easy filtering by:

* board
* level
* subject

Each paper card should show:

* title
* board
* level
* subject
* total marks
* duration if available
* question count

Primary action:

* `Start Paper`

### Paper Detail UX

Must show:

* paper title
* metadata
* instructions
* note that feedback comes after submission
* clear `Start Attempt` CTA

### Attempt Taking UX

Requirements:

* one visible question block at a time or stacked list with navigator
* persistent question navigation panel
* answer autosave indicator
* visible submit button
* confirmation dialog before submit
* disable review answers before submission

Recommended behavior:

* text area for each answer
* next/previous question controls
* navigator with status:

  * unanswered
  * answered
  * current

### Marking Progress UX

Need a dedicated progress page:

* title: `Marking your paper`
* short message explaining AI is scoring and generating feedback
* spinner/progress skeleton
* polling every few seconds

### Results UX

Must show summary first:

* total marks awarded
* total max marks
* percentage
* count of questions attempted
* count of fully blank responses if applicable

Then show question status list:

* `Q1 - 3/5`
* `Q2 - 5/5`
* `Q3 - 1/4`

### Review UX

Each question review card must include:

* question number
* question text
* student answer
* reference answer can remain hidden or summarized as part of reasoning depending on product choice
* awarded marks / max marks
* reasoning section
* strengths section
* mistakes section
* improvement feedback section

Recommended layout:

* top row: score badge + question number
* middle: question text and student answer
* bottom: accordions or stacked cards for reasoning and feedback

---

## Admin UX Requirements

### Admin Paper List

Must allow:

* list of all papers
* draft/published status
* edit action
* create new paper action
* import paper action

### Admin Paper Form

Fields:

* title
* board
* level
* subject
* year
* session
* duration
* instructions
* published status

### Admin Question Form

Fields:

* question number
* question text
* reference answer
* max marks
* marking guidelines
* sample full-mark answer

### Admin Rubric Form

Fields:

* expected keywords
* acceptable alternatives
* common mistakes
* marker notes
* band descriptors

### Admin Import Upload UX

Must have:

* upload field for question paper PDF
* upload field for mark scheme PDF
* submit button
* progress state after upload
* clear note that uploaded documents will be extracted into a draft preview and not saved live until confirmed

### Admin Import Review UX

Must show:

* detected metadata
* source filenames
* import status
* matched count
* unmatched count
* ambiguous count
* list/table of extracted question-answer-mark items

Each extracted item should show:

* question key
* question text preview
* stem context if present
* extracted answer preview
* marks
* status badge
* source page references
* edit action

Editing a row should allow:

* change question key
* fix question text
* fix stem context
* fix answer text
* fix marks
* fix match status
* toggle review flags

Primary actions on review screen:

* `Save Draft Changes`
* `Confirm and Import Paper`
* `Cancel Import`

Important rule:

* extracted content must remain draft-only until `Confirm and Import Paper` is clicked

Admin UI must optimize for accuracy and repeated entry, not visual flair.

# 5. File-by-File Codex Reference Map

This section is intended specifically for iterative code generation and refactoring.

## Backend File Map

### Models

* `app/Models/User.php`

  * user relations and role helpers
* `app/Models/ExamBoard.php`

  * board relations
* `app/Models/ExamLevel.php`

  * level relations
* `app/Models/Subject.php`

  * subject relations
* `app/Models/Paper.php`

  * paper metadata and relations
* `app/Models/PaperQuestion.php`

  * question content and relations
* `app/Models/QuestionRubric.php`

  * rubric metadata
* `app/Models/PaperAttempt.php`

  * attempt lifecycle helpers
* `app/Models/AttemptAnswer.php`

  * student answer data
* `app/Models/AttemptMarking.php`

  * saved AI marking output
* `app/Models/AiMarkingLog.php`

  * AI audit log

### Controllers

* `app/Http/Controllers/Api/Auth/AuthController.php`
* `app/Http/Controllers/Api/Student/CatalogController.php`
* `app/Http/Controllers/Api/Student/PaperController.php`
* `app/Http/Controllers/Api/Student/AttemptController.php`
* `app/Http/Controllers/Api/Admin/PaperAdminController.php`
* `app/Http/Controllers/Api/Admin/QuestionAdminController.php`
* `app/Http/Controllers/Api/Admin/PaperImportController.php`

### Requests

* `app/Http/Requests/Auth/RegisterRequest.php`
* `app/Http/Requests/Auth/LoginRequest.php`
* `app/Http/Requests/Student/PaperIndexRequest.php`
* `app/Http/Requests/Student/UpdateAttemptAnswersRequest.php`
* `app/Http/Requests/Student/SubmitAttemptRequest.php`
* `app/Http/Requests/Admin/StorePaperRequest.php`
* `app/Http/Requests/Admin/UpdatePaperRequest.php`
* `app/Http/Requests/Admin/StoreQuestionRequest.php`
* `app/Http/Requests/Admin/UpdateQuestionRequest.php`
* `app/Http/Requests/Admin/UpdateQuestionRubricRequest.php`
* `app/Http/Requests/Admin/UploadPaperImportRequest.php`
* `app/Http/Requests/Admin/ApprovePaperImportRequest.php`
* `app/Http/Requests/Admin/UpdateImportItemRequest.php`

### Services

* `app/Services/Papers/PaperCatalogService.php`
* `app/Services/Attempts/AttemptService.php`
* `app/Services/Marking/MarkingOrchestrator.php`
* `app/Services/Marking/MarkingPromptBuilder.php`
* `app/Services/Marking/MarkingResponseValidator.php`
* `app/Services/Marking/AttemptReviewBuilder.php`
* `app/Services/AI/OpenAIClient.php`
* `app/Services/Imports/PaperImportService.php`
* `app/Services/Imports/PdfTextExtractionService.php`
* `app/Services/Imports/PaperMetadataExtractor.php`
* `app/Services/Imports/QuestionPaperParser.php`
* `app/Services/Imports/MarkSchemeParser.php`
* `app/Services/Imports/QuestionMarkSchemeMatcher.php`
* `app/Services/Imports/ImportDraftBuilder.php`
* `app/Services/Imports/ImportApprovalService.php`

### Jobs

* `app/Jobs/MarkPaperAttemptJob.php`
* `app/Jobs/ProcessPaperImportJob.php`

### Resources

* `app/Http/Resources/Student/PaperListResource.php`
* `app/Http/Resources/Student/PaperDetailResource.php`
* `app/Http/Resources/Student/AttemptResource.php`
* `app/Http/Resources/Student/AttemptResultResource.php`
* `app/Http/Resources/Student/AttemptReviewResource.php`
* `app/Http/Resources/Admin/AdminPaperResource.php`
* `app/Http/Resources/Admin/AdminQuestionResource.php`
* `app/Http/Resources/Admin/DocumentImportResource.php`
* `app/Http/Resources/Admin/DocumentImportItemResource.php`

### Enums

* `app/Enums/UserRole.php`
* `app/Enums/PaperAttemptStatus.php`
* `app/Enums/AiLogStatus.php`
* `app/Enums/DocumentImportStatus.php`
* `app/Enums/ImportItemMatchStatus.php`
* `app/Enums/PaperSourceFileType.php`

---

## Frontend File Map

### App bootstrapping

* `src/main.tsx`

  * React entrypoint
* `src/app/router/index.tsx`

  * all routes and route guards
* `src/app/providers/AppProviders.tsx`

  * Query client, router, auth, theme providers

### Layout

* `src/components/layout/AppShell.tsx`
* `src/components/layout/StudentShell.tsx`
* `src/components/layout/AdminShell.tsx`

### Pages

* `src/pages/LoginPage.tsx`
* `src/pages/RegisterPage.tsx`
* `src/pages/DashboardPage.tsx`
* `src/pages/PaperCatalogPage.tsx`
* `src/pages/PaperDetailPage.tsx`
* `src/pages/TakeAttemptPage.tsx`
* `src/pages/MarkingProgressPage.tsx`
* `src/pages/AttemptResultsPage.tsx`
* `src/pages/AttemptReviewPage.tsx`
* `src/pages/admin/AdminDashboardPage.tsx`
* `src/pages/admin/AdminPaperListPage.tsx`
* `src/pages/admin/AdminCreatePaperPage.tsx`
* `src/pages/admin/AdminEditPaperPage.tsx`
* `src/pages/admin/AdminEditQuestionPage.tsx`
* `src/pages/admin/AdminImportPaperPage.tsx`
* `src/pages/admin/AdminImportReviewPage.tsx`

### Feature modules

* `src/features/auth/api.ts`
* `src/features/auth/hooks.ts`
* `src/features/auth/types.ts`
* `src/features/catalog/api.ts`
* `src/features/catalog/hooks.ts`
* `src/features/catalog/types.ts`
* `src/features/papers/api.ts`
* `src/features/papers/hooks.ts`
* `src/features/papers/types.ts`
* `src/features/attempts/api.ts`
* `src/features/attempts/hooks.ts`
* `src/features/attempts/types.ts`
* `src/features/review/api.ts`
* `src/features/review/hooks.ts`
* `src/features/review/types.ts`
* `src/features/admin/api.ts`
* `src/features/admin/hooks.ts`
* `src/features/admin/types.ts`
* `src/features/imports/api.ts`
* `src/features/imports/hooks.ts`
* `src/features/imports/types.ts`

### Shared library

* `src/lib/api/client.ts`
* `src/lib/api/endpoints.ts`
* `src/lib/types/api.ts`
* `src/lib/utils/cn.ts`
* `src/lib/constants/routes.ts`
* `src/lib/constants/queryKeys.ts`

---

# 6. API Contract Notes for Codex

## Important response shapes

### Paper list item

```json
{
  "id": 1,
  "title": "Biology Paper 1",
  "board": "Edexcel",
  "level": "O Level",
  "subject": "Biology",
  "total_marks": 60,
  "duration_minutes": 90,
  "question_count": 12
}
```

### Attempt detail

```json
{
  "id": 5,
  "status": "in_progress",
  "paper": {
    "id": 1,
    "title": "Biology Paper 1"
  },
  "questions": [
    {
      "id": 11,
      "question_number": "1",
      "question_text": "Explain the function of red blood cells.",
      "max_marks": 3,
      "student_answer": ""
    }
  ]
}
```

### Results summary

```json
{
  "attempt_id": 5,
  "status": "completed",
  "total_awarded_marks": 38,
  "total_max_marks": 50,
  "percentage": 76,
  "questions": [
    {
      "question_id": 11,
      "question_number": "1",
      "awarded_marks": 2,
      "max_marks": 3
    }
  ]
}
```

### Review item

```json
{
  "question_id": 11,
  "question_number": "1",
  "question_text": "Explain the function of red blood cells.",
  "student_answer": "They carry air.",
  "awarded_marks": 2,
  "max_marks": 3,
  "reasoning": "The student identified transport, but the answer lacked precision about oxygen and did not mention hemoglobin.",
  "feedback": "To get full marks, explain that red blood cells transport oxygen using hemoglobin.",
  "strengths": ["Recognized transport as the main role"],
  "mistakes": ["Used vague wording", "Did not mention oxygen"]
}
```

Codex should keep these stable unless intentionally versioned.

---

# 7. Implementation Order

## Phase 1: Foundations

* Laravel auth
* React app shell
* database migrations
* core models and seeders

## Phase 2: Admin content management

* create paper
* add questions
* add rubric
* publish paper
* upload import PDFs
* build import draft preview
* edit extracted items
* confirm import

## Phase 3: Student paper flow

* catalog
* paper detail
* create attempt
* save answers
* submit attempt

## Phase 4: AI marking flow

* prompt builder
* OpenAI client
* validator
* marking job
* results and review endpoints

## Phase 5: Review UX polish

* summary screen
* detailed per-question review cards
* error and failed marking states

---

# 8. Non-Functional Requirements

## Security

* backend-only AI calls
* auth-protected student routes
* admin role protection
* validate ownership of attempts

## Reliability

* queue-based marking
* retry on malformed AI output
* audit logs for prompts and responses

## Performance

* autosave answers in lightweight payloads
* cache paper catalog if needed
* paginate admin lists

## Maintainability

* service classes over fat controllers
* typed frontend API modules
* stable enums and resources
* one source of truth for routes and query keys

---

# 9. Paper + Mark Scheme Ingestion Blueprint

## Goal

The app should support uploading a question paper PDF and a matching mark scheme PDF, then automatically:

1. extract paper metadata
2. extract questions and sub-questions from the question paper
3. extract marking entries and marks from the mark scheme
4. correlate question parts from the paper to the mark scheme
5. create draft database records for admin review
6. allow admin correction before publishing

This must be designed as a **draft import workflow**, not a silent fully automatic publish workflow.

---

## What the sample files show

The uploaded Cambridge Chemistry paper and mark scheme demonstrate a repeatable pattern:

* the question paper contains numbered questions and subparts like `1(a)`, `2(c)(iv)`, `7(d)`
* the mark scheme is organized by the same identifiers and includes the expected answer plus per-part marks
* diagrams and tables appear in some questions and some mark-scheme entries
* the mark scheme includes generic marking principles before the actual question-by-question scheme

This means the import system should rely on a **question-key format** such as:

* `1(a)`
* `2(c)(ii)`
* `5(e)`
* `7(d)`

That key should become the main correlation anchor between uploaded paper content and marking content.

---

## Recommended Product Flow

### Admin upload flow

1. Admin opens `Import Paper` screen
2. Admin uploads:

   * question paper PDF
   * mark scheme PDF
3. Backend creates an `import job`
4. Extraction pipeline reads both files
5. System produces:

   * detected paper metadata
   * parsed question tree
   * parsed mark scheme tree
   * matched correlations
   * unmatched / ambiguous items
6. Admin reviews imported draft
7. Admin edits/corrects any mismatches
8. Admin confirms import
9. System writes final `paper`, `questions`, `rubrics`, and source file records

This review step is essential. Never auto-publish directly from PDF parsing.

---

## Database Changes Needed

Add source-document and import-tracking tables.

### `document_imports`

Fields:

* `id`
* `uploaded_by`
* `status` (`uploaded`, `processing`, `needs_review`, `completed`, `failed`)
* `paper_pdf_path`
* `mark_scheme_pdf_path`
* `detected_board` nullable
* `detected_subject` nullable
* `detected_level` nullable
* `detected_paper_code` nullable
* `detected_session` nullable
* `detected_year` nullable
* `error_message` nullable
* `created_at`
* `updated_at`

### `document_import_items`

Purpose: store parsed units before final save.

Fields:

* `id`
* `document_import_id`
* `question_key` (examples: `1(a)`, `2(c)(iv)`)
* `question_text` longText nullable
* `question_marks` nullable
* `mark_scheme_text` longText nullable
* `mark_scheme_marks` nullable
* `sample_answer` longText nullable
* `match_status` (`matched`, `paper_only`, `scheme_only`, `ambiguous`)
* `question_page_number` nullable
* `mark_scheme_page_number` nullable
* `sort_order`
* `raw_question_payload` json nullable
* `raw_mark_scheme_payload` json nullable
* `created_at`
* `updated_at`

### `paper_source_files`

Purpose: persist original uploaded artifacts attached to final paper.

Fields:

* `id`
* `paper_id`
* `file_type` (`question_paper`, `mark_scheme`)
* `file_path`
* `original_name`
* `mime_type`
* `created_at`
* `updated_at`

---

## Final Data Model Guidance

### Question key strategy

Each persisted question should store a stable external key.

Add to `paper_questions`:

* `question_key` nullable but recommended
* examples: `1(a)`, `2(c)(iv)`

This key is the primary bridge between imported question text and mark scheme rubric.

### Marks source

When imported from official papers:

* `question_marks` should usually come from the question paper brackets if present
* `max_marks` should be cross-checked with mark-scheme marks
* if they differ, flag for review

---

## Parsing Pipeline Design

### Stage 1: file intake

Service receives uploaded PDFs and creates `document_imports` row.

### Stage 2: text extraction

Extract page text from:

* question paper PDF
* mark scheme PDF

Keep page numbers in the extraction result because admin review and debugging need them.

### Stage 3: metadata extraction

Detect and normalize:

* board
* level
* subject
* paper code
* session
* year
* total marks
* duration

### Stage 4: question segmentation

Parse the question paper into a tree:

* main question: `1`, `2`, `3`
* subparts: `1(a)`, `2(c)`, `2(c)(i)`, `2(c)(ii)`

For the app, the scoring unit should usually be the **lowest answerable subpart**.

Example:

* `2(c)` is a container block
* `2(c)(i)` is the actual answerable unit
* `2(c)(ii)` is the actual answerable unit

### Stage 5: mark scheme segmentation

Parse the mark scheme into entries keyed by the same pattern:

* `1(a)`
* `2(a)`
* `2(c)(iv)`
* `9(d)`

Each entry should capture:

* answer text
* mark count
* any multi-point breakdown
* any notable marking instructions

### Stage 6: correlation

Match paper nodes to mark scheme nodes using:

1. exact `question_key`
2. nearby context if exact key missing
3. page order and sequence as fallback

### Stage 7: draft generation

Create `document_import_items` for review.

### Stage 8: admin review + approval

Admin confirms or edits mappings.

### Stage 9: final persistence

Convert approved draft items into:

* `papers`
* `paper_questions`
* `question_rubrics`
* `paper_source_files`

---

## Important Parsing Rules

### 1. Use hierarchical keys, not plain numbering only

Do not rely only on question number `2` because papers contain nested parts.

Always normalize keys like:

* `2(a)`
* `2(c)(iv)`

### 2. Lowest answerable node becomes the stored question record

For import purposes, the final question record should usually map to the smallest answerable unit.

Examples:

* `1(a)` through `1(e)` should become 5 separate stored questions
* `2(c)(i)` to `2(c)(iv)` should each become separate stored questions
* `2(d)(ii)` should become one stored question, even though it references a diagram

### 3. Preserve parent context

Subpart text often depends on parent text.

Example:

* `2(c)(ii)` only makes sense if the student also sees that it refers to ethyne from question 2

So each final stored question should preserve:

* `stem_context` (parent question lead-in)
* `question_text` (subpart-specific prompt)

### 4. Support diagram/image flags

Some questions and mark schemes include diagrams, tables, or structures.

Add to `paper_questions` if needed:

* `has_visual` boolean
* `visual_assets` json nullable

For V1, at minimum flag such questions for admin review.

---

## Backend Files to Add

### Models

* `app/Models/DocumentImport.php`
* `app/Models/DocumentImportItem.php`
* `app/Models/PaperSourceFile.php`

### Enums

* `app/Enums/DocumentImportStatus.php`
* `app/Enums/ImportItemMatchStatus.php`
* `app/Enums/PaperSourceFileType.php`

### Controllers

* `app/Http/Controllers/Api/Admin/PaperImportController.php`

### Requests

* `app/Http/Requests/Admin/UploadPaperImportRequest.php`
* `app/Http/Requests/Admin/ApprovePaperImportRequest.php`
* `app/Http/Requests/Admin/UpdateImportItemRequest.php`

### Services

* `app/Services/Imports/PaperImportService.php`
* `app/Services/Imports/PdfTextExtractionService.php`
* `app/Services/Imports/PaperMetadataExtractor.php`
* `app/Services/Imports/QuestionPaperParser.php`
* `app/Services/Imports/MarkSchemeParser.php`
* `app/Services/Imports/QuestionMarkSchemeMatcher.php`
* `app/Services/Imports/ImportDraftBuilder.php`
* `app/Services/Imports/ImportApprovalService.php`

### Jobs

* `app/Jobs/ProcessPaperImportJob.php`

### Resources

* `app/Http/Resources/Admin/DocumentImportResource.php`
* `app/Http/Resources/Admin/DocumentImportItemResource.php`

---

## Responsibilities of New Backend Files

### `app/Http/Controllers/Api/Admin/PaperImportController.php`

Functions:

* `store(UploadPaperImportRequest $request)`
* `show(DocumentImport $import)`
* `items(DocumentImport $import)`
* `updateItem(UpdateImportItemRequest $request, DocumentImportItem $item)`
* `approve(ApprovePaperImportRequest $request, DocumentImport $import)`

### `app/Services/Imports/PaperImportService.php`

Functions:

* `createImportFromUpload(array $files, User $admin): DocumentImport`
* `queueProcessing(DocumentImport $import): void`

### `app/Services/Imports/PdfTextExtractionService.php`

Functions:

* `extract(string $path): array`

Return shape should include:

* page number
* page text
* optional image/visual markers

### `app/Services/Imports/PaperMetadataExtractor.php`

Functions:

* `extractFromQuestionPaper(array $pages): array`
* `extractFromMarkScheme(array $pages): array`
* `mergeMetadata(array $paperMeta, array $schemeMeta): array`

### `app/Services/Imports/QuestionPaperParser.php`

Functions:

* `parse(array $pages): array`
* `buildQuestionTree(array $lines): array`
* `flattenAnswerableNodes(array $tree): array`

Output per node:

* `question_key`
* `parent_key` nullable
* `stem_context`
* `question_text`
* `marks`
* `page_number`
* `sort_order`

### `app/Services/Imports/MarkSchemeParser.php`

Functions:

* `parse(array $pages): array`
* `extractMarkEntries(array $lines): array`
* `normalizeAnswerBlock(array $entry): array`

Output per entry:

* `question_key`
* `answer_text`
* `marks`
* `page_number`
* `raw_breakdown`

### `app/Services/Imports/QuestionMarkSchemeMatcher.php`

Functions:

* `match(array $questionNodes, array $markEntries): array`
* `matchExactKeys(array $questionNodes, array $markEntries): array`
* `findAmbiguousItems(array $questionNodes, array $markEntries): array`

### `app/Services/Imports/ImportDraftBuilder.php`

Functions:

* `build(DocumentImport $import, array $metadata, array $matchedItems): void`

### `app/Services/Imports/ImportApprovalService.php`

Functions:

* `approve(DocumentImport $import): Paper`
* `createPaperFromImport(DocumentImport $import): Paper`
* `createQuestionsFromImportItems(Paper $paper, Collection $items): void`
* `attachSourceFiles(Paper $paper, DocumentImport $import): void`

### `app/Jobs/ProcessPaperImportJob.php`

Functions:

* `handle(...)`
* `failed(Throwable $e)`

Responsibilities:

* run extraction
* run parsing
* run matching
* save import draft items
* set status to `needs_review` or `failed`

---

## Routes to Add

Under admin routes:

* `POST /api/admin/imports`
* `GET /api/admin/imports/{import}`
* `GET /api/admin/imports/{import}/items`
* `PUT /api/admin/import-items/{item}`
* `POST /api/admin/imports/{import}/approve`

---

## Frontend Files to Add

### Pages

* `src/pages/admin/AdminImportPaperPage.tsx`
* `src/pages/admin/AdminImportReviewPage.tsx`

### Feature module

Add `src/features/imports/`

Files:

* `api.ts`
* `hooks.ts`
* `types.ts`
* `components/ImportUploadForm.tsx`
* `components/ImportSummaryCard.tsx`
* `components/ImportItemReviewTable.tsx`
* `components/ImportItemEditorDialog.tsx`
* `components/ImportMatchStatusBadge.tsx`

### Shared UI additions

* file upload dropzone component if needed
* PDF source file preview link component

---

## Frontend UX for Import Review

### Admin Import Upload Page

Must have:

* upload field for question paper PDF
* upload field for mark scheme PDF
* submit button
* progress state after upload

### Admin Import Review Page

Must show:

* detected metadata
* upload source filenames
* counts:

  * matched items
  * paper-only items
  * scheme-only items
  * ambiguous items
* review table of each imported node

Each import item row should show:

* question key
* question text preview
* question paper marks
* mark scheme marks
* match status
* edit action

Editing a row should allow:

* change question key
* fix question text
* fix answer text
* fix marks
* resolve match status

Primary final CTA:

* `Approve Import`

This admin review UI is mandatory for trust.

---

## Parsing Heuristics Based on This Sample

For the Cambridge sample, the parser should expect:

### In question paper

* main question numbers at page starts, such as `1`, `2`, `3`
* subparts in forms like `(a)`, `(b)`, `(c)(i)`
* marks shown in square brackets like `[2]` or `[Total: 13]`
* parent stem text before subparts

### In mark scheme

* generic principles first, which must be ignored for matching
* then rows with columns:

  * `Question`
  * `Answer`
  * `Marks`
* entries like `2(c)(iv)` and `5(e)`
* answer text may include multi-line bullet-like marking points
* some entries include diagrams or tables

So the parser should explicitly skip front matter until the first actual question key appears.

---

## Correlation Logic Rules

### Primary rule

Match exact normalized key.

Normalization examples:

* `2(c)(iv)` == `2(c)(iv)`
* trim spaces
* standardize bracket formatting
* standardize Roman numeral casing if needed

### Secondary rule

If a question paper node has marks but no exact scheme match:

* mark as `paper_only`

If a scheme entry has no paper node:

* mark as `scheme_only`

### Ambiguity rule

If one paper node could map to multiple scheme entries or vice versa:

* mark as `ambiguous`
* require admin correction

---

## How Approved Imports Map to Final Tables

For each approved `document_import_item`:

### Create `paper_questions`

Map:

* `question_key`
* `question_text`
* `max_marks`
* `order_index`
* optional `stem_context`

### Create `question_rubrics`

Map:

* `marker_notes` from mark-scheme text
* `band_descriptor` if present
* `keywords_expected` optionally extracted later
* `common_mistakes` optional future enhancement
* `acceptable_alternatives` optional future enhancement

### Reference answer strategy

For import from official mark schemes:

* `reference_answer` should contain the cleaned mark-scheme answer block
* `marking_guidelines` should contain the raw or slightly normalized marking notes

---

## AI Marking Implications

Imported official mark schemes improve AI marking quality because each question will now have:

* real exam wording from the question paper
* real mark allocation
* real examiner phrasing from the scheme

When building prompts later, include:

* imported `question_text`
* imported `question_key`
* imported `reference_answer`
* imported `marking_guidelines`
* imported `max_marks`

This is much stronger than hand-entering only short model answers.

---

## Recommended V1 Boundary

Build V1 import to support:

* text-based parsing of standard papers
* exact key correlation
* admin review before publish

Do not try to fully solve in V1:

* complex image OCR inside diagrams
* automatic extraction of drawn chemical structures as structured data
* perfect parsing of every table layout

For visual-heavy questions, flag them for manual admin cleanup.

---

## Codex Rules for Import Feature

When Codex iterates on this feature:

1. Keep import parsing separate from final paper CRUD.
2. Never publish imported content without admin review.
3. Preserve `question_key` as the primary correlation field.
4. Do not discard page numbers from parsed items.
5. Keep raw extraction payloads for debugging.
6. Treat ambiguous matches as review-required, not silently resolved.
7. Preserve source PDFs in storage and attach them to the final paper.

---

# 10. Future Extensions (Do Not Build in V1)

Planned later but explicitly out of scope for first iteration:

* student-AI live chat
* flashcards
* revision planner
* topic analytics dashboard
* adaptive practice generation
* handwriting OCR
* teacher/classroom accounts
* payment/subscription layer

---

# 11. Codex Working Rules

When iterating on this codebase, Codex should follow these principles:

1. Do not collapse domain boundaries between papers, attempts, and marking.
2. Do not move AI prompt logic into controllers.
3. Do not let frontend infer business rules that belong in backend.
4. Keep API response shapes stable.
5. Prefer adding a new service or helper over bloating a controller or page.
6. Use shadcn/ui building blocks instead of custom primitive UI unless necessary.
7. Preserve attempt lifecycle states and enum usage.
8. Preserve the distinction between:

   * question content
   * student answer
   * AI reasoning
   * AI feedback
   * awarded score

---

# 12. Recommended First Deliverables

The best first coding milestone is:

1. migrations
2. models and relations
3. admin paper/question CRUD
4. student paper list and detail
5. attempt create/save/submit flow
6. placeholder marking flow
7. real AI marking integration
8. results and review pages

This keeps the product usable throughout development.

---

# 13. Final Architecture Summary

This app should be built as a structured exam workflow system with AI-assisted extraction and AI-assisted marking.

* **Laravel 10** manages domain logic, persistence, jobs, import workflows, and AI orchestration.
* **React + shadcn/ui** provides a clean, focused academic interface for students and a draft verification workflow for admins.
* **MySQL** stores papers, questions, rubrics, attempts, answers, marking results, import drafts, and source files.
* **AI** has two bounded roles:

  * extract draft paper + mark scheme data from uploaded PDFs for preview
  * assign marks and generate reasoning and feedback only after the student submits the paper

The design goal is to keep the system:

* understandable
* auditable
* preview-first for imports
* scalable
* easy for Codex to extend without breaking architecture
