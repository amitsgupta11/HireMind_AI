"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import ScoreRing from "@/components/ui/ScoreRing";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { assessmentApi } from "@/lib/api";

export default function TakeAssessmentPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <TakeAssessmentBody />
    </ProtectedRoute>
  );
}

function draftKey(attemptId) {
  return `hiremind-assessment-draft-${attemptId}`;
}

function TakeAssessmentBody() {
  const { assessmentId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [state, setState] = useState({ loading: true, error: "" });
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId -> {selectedIndex?, textAnswer?}
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    assessmentApi
      .start(assessmentId, token)
      .then((res) => {
        const { attempt: a, questions: qs, assessment } = res.data;
        setAttempt(a);
        setQuestions(qs);

        if (a.status === "SUBMITTED") {
          setResult({ score: a.score, maxScore: a.maxScore });
        } else {
          const draft = localStorage.getItem(draftKey(a.id));
          setAnswers(draft ? JSON.parse(draft) : {});
          const elapsedMs = Date.now() - new Date(a.startedAt).getTime();
          const remaining = assessment.durationMinutes * 60 - Math.floor(elapsedMs / 1000);
          setSecondsLeft(Math.max(remaining, 0));
        }
        setState({ loading: false, error: "" });
      })
      .catch((err) => setState({ loading: false, error: err.message }));
  }, [assessmentId, token]);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionId, a]) => ({ questionId, ...a }));
    try {
      const res = await assessmentApi.submit(assessmentId, payload, token);
      setResult({ score: res.data.attempt.score, maxScore: res.data.attempt.maxScore });
      localStorage.removeItem(draftKey(attempt.id));
      showToast("Assessment submitted.");
    } catch (err) {
      showToast(err.message, "error");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, assessmentId, token, attempt]);

  // Countdown timer — auto-submits when it hits zero.
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      doSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, doSubmit]);

  const updateAnswer = (questionId, patch) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: { ...prev[questionId], ...patch } };
      if (attempt) localStorage.setItem(draftKey(attempt.id), JSON.stringify(next));
      return next;
    });
  };

  if (state.loading) {
    return (
      <DashboardShell items={candidateNav} title="Assessment">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  if (state.error) {
    return (
      <DashboardShell items={candidateNav} title="Assessment">
        <Card><p className="text-sm text-signal-rose">{state.error}</p></Card>
      </DashboardShell>
    );
  }

  if (result) {
    return (
      <DashboardShell items={candidateNav} title="Assessment">
        <Card className="mx-auto max-w-md text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-signal-mint" />
          <h2 className="mt-3 font-display text-lg font-semibold">Assessment submitted</h2>
          {result.score != null ? (
            <div className="mt-4 flex justify-center">
              <ScoreRing score={result.score} size={120} strokeWidth={10} label="Score" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-current/60">
              Your subjective answers have been submitted for the recruiter to review.
            </p>
          )}
        </Card>
      </DashboardShell>
    );
  }

  const q = questions[current];
  const minutes = Math.floor((secondsLeft || 0) / 60);
  const seconds = (secondsLeft || 0) % 60;

  return (
    <DashboardShell items={candidateNav} title="Assessment">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                  i === current
                    ? "bg-signal-gradient text-white"
                    : answers[qq.id]
                    ? "bg-signal-mint/15 text-signal-mint"
                    : "border border-line-light text-current/50 dark:border-line-dark"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-paper-softer px-3 py-1.5 text-sm font-mono font-medium dark:bg-ink-softer">
            <Clock className="h-3.5 w-3.5" />
            {minutes}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-current/50">
            Question {current + 1} of {questions.length}
          </p>
          <p className="mt-2 font-medium">{q.text}</p>

          {q.type === "MCQ" ? (
            <div className="mt-4 space-y-2">
              {(q.options || []).map((opt, i) => (
                <label
                  key={i}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                    answers[q.id]?.selectedIndex === i
                      ? "border-signal-violet bg-signal-gradient-soft"
                      : "border-line-light dark:border-line-dark"
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id]?.selectedIndex === i}
                    onChange={() => updateAnswer(q.id, { selectedIndex: i })}
                    className="h-4 w-4 accent-signal-violet"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <Textarea
              className="mt-4"
              rows={6}
              value={answers[q.id]?.textAnswer || ""}
              onChange={(e) => updateAnswer(q.id, { textAnswer: e.target.value })}
              placeholder="Type your answer..."
            />
          )}
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrent((c) => Math.max(c - 1, 0))} disabled={current === 0}>
            Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}>Next</Button>
          ) : (
            <Button onClick={doSubmit} loading={submitting}>
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
