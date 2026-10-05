"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Send } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import ScoreRing from "@/components/ui/ScoreRing";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { interviewApi } from "@/lib/api";

const CRITERIA_LABEL = {
  technicalAccuracy: "Technical Accuracy",
  communication: "Communication",
  problemSolving: "Problem Solving",
  confidence: "Confidence",
  relevance: "Relevance",
};

export default function InterviewFlowPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <InterviewFlowBody />
    </ProtectedRoute>
  );
}

function InterviewFlowBody() {
  const { applicationId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    interviewApi
      .start(applicationId, token)
      .then((res) => setInterview(res.data.interview))
      .catch((err) => setError(err.message));
  }, [applicationId, token]);

  if (error) {
    return (
      <DashboardShell items={candidateNav} title="AI Interview">
        <Card><p className="text-sm text-signal-rose">{error}</p></Card>
      </DashboardShell>
    );
  }

  if (!interview) {
    return (
      <DashboardShell items={candidateNav} title="AI Interview">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  if (interview.status === "COMPLETED") {
    return (
      <DashboardShell items={candidateNav} title="AI Interview Report">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <div className="flex items-center gap-8">
              <ScoreRing score={interview.overallScore ?? 0} size={110} strokeWidth={9} label="Interview Score" />
              <div className="grid flex-1 grid-cols-2 gap-3">
                {Object.entries(interview.scoreBreakdown || {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-paper-softer p-2.5 text-center dark:bg-ink-softer">
                    <p className="font-display text-base font-semibold">{value}</p>
                    <p className="text-[10px] text-current/50">{CRITERIA_LABEL[key] || key}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-current/70">{interview.summary}</p>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-base font-semibold">Full transcript</h3>
            <div className="space-y-5">
              {interview.questions.map((q, i) => (
                <div key={q.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-current/50">Q{i + 1}</p>
                  <p className="mt-1 text-sm font-medium">{q.questionText}</p>
                  {q.answer && (
                    <>
                      <p className="mt-2 rounded-xl bg-paper-softer p-3 text-sm text-current/70 dark:bg-ink-softer">
                        {q.answer.answerText}
                      </p>
                      <p className="mt-1.5 text-xs text-current/50">{q.answer.feedback}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const currentQuestion = interview.questions.find((q) => !q.answer);

  const onSubmit = async () => {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      const res = await interviewApi.answer(interview.id, currentQuestion.id, draft, token);
      setDraft("");
      if (res.data.completed) {
        setInterview(res.data.report);
        showToast("Interview completed!");
      } else {
        setInterview((prev) => ({
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === currentQuestion.id ? { ...q, answer: { answerText: draft, ...res.data.evaluation } } : q
          ).concat(res.data.nextQuestion),
        }));
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell items={candidateNav} title="AI Interview">
      <div className="mx-auto max-w-2xl space-y-4">
        {interview.questions
          .filter((q) => q.answer)
          .map((q) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-signal-violet">
                  <Sparkles className="h-3 w-3" /> Interviewer
                </p>
                <p className="mt-1.5 text-sm font-medium">{q.questionText}</p>
                <p className="mt-3 rounded-xl bg-paper-softer p-3 text-sm text-current/70 dark:bg-ink-softer">
                  {q.answer.answerText}
                </p>
                <p className="mt-2 text-xs text-current/50">{q.answer.feedback}</p>
              </Card>
            </motion.div>
          ))}

        {currentQuestion && (
          <Card>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-signal-violet">
              <Sparkles className="h-3 w-3" /> Interviewer
            </p>
            <p className="mt-1.5 text-sm font-medium">{currentQuestion.questionText}</p>
            <Textarea
              className="mt-4"
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your answer..."
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={onSubmit} loading={submitting} disabled={!draft.trim()}>
                <Send className="h-4 w-4" /> Submit Answer
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
