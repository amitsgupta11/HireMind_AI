"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, ClipboardCheck } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import QuestionEditor from "@/components/assessment/QuestionEditor";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { assessmentApi } from "@/lib/api";

const emptyQuestion = () => ({ type: "MCQ", text: "", options: ["", ""], correctIndex: undefined, order: 0 });

export default function AssessmentBuilderPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <AssessmentBuilderBody />
    </ProtectedRoute>
  );
}

function AssessmentBuilderBody() {
  const { id: jobId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [assessmentId, setAssessmentId] = useState(null);
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    assessmentApi
      .getByJob(jobId, token)
      .then((res) => {
        const a = res.data.assessment;
        setAssessmentId(a.id);
        setTitle(a.title);
        setDurationMinutes(a.durationMinutes);
        setQuestions(a.questions.length ? a.questions : [emptyQuestion()]);
      })
      .catch(() => {
        // No assessment yet — start with a blank builder.
      })
      .finally(() => setLoading(false));
  }, [jobId, token]);

  const updateQuestion = (i, updated) => setQuestions((qs) => qs.map((q, idx) => (idx === i ? updated : q)));
  const removeQuestion = (i) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);

  const onSave = async () => {
    setError("");
    if (!title.trim()) return setError("Give the assessment a title.");
    if (questions.length === 0) return setError("Add at least one question.");
    for (const q of questions) {
      if (!q.text.trim()) return setError("Every question needs text.");
      if (q.type === "MCQ" && (!q.options || q.options.filter((o) => o.trim()).length < 2)) {
        return setError("Every MCQ question needs at least 2 non-empty options.");
      }
      if (q.type === "MCQ" && q.correctIndex === undefined) {
        return setError("Select the correct answer for every MCQ question.");
      }
    }

    setSaving(true);
    const payload = {
      title,
      durationMinutes: Number(durationMinutes),
      questions: questions.map((q, i) => ({ ...q, order: i })),
    };

    try {
      if (assessmentId) {
        await assessmentApi.update(assessmentId, payload, token);
      } else {
        await assessmentApi.create({ jobId, ...payload }, token);
      }
      showToast("Assessment saved.");
      router.push("/recruiter/jobs");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell items={recruiterNav} title="Assessment">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell items={recruiterNav} title="Assessment">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">
                {assessmentId ? "Edit assessment" : "Create assessment"}
              </h2>
              <p className="text-sm text-current/60">Attach a screening test to this job.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Screening Test" />
            <Input
              label="Duration (minutes)"
              type="number"
              min={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>
        </Card>

        {questions.map((q, i) => (
          <QuestionEditor
            key={i}
            question={q}
            index={i}
            onChange={(updated) => updateQuestion(i, updated)}
            onRemove={() => removeQuestion(i)}
          />
        ))}

        <Button variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="h-4 w-4" /> Add question
        </Button>

        {error && (
          <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
            {error}
          </p>
        )}

        <Button onClick={onSave} loading={saving} className="w-full">
          Save assessment
        </Button>
      </div>
    </DashboardShell>
  );
}
