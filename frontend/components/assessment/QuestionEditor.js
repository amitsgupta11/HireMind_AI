"use client";

import { Trash2, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

// One editable question card — handles both MCQ (options + correct
// answer radio) and Subjective (just the prompt) question types.
export default function QuestionEditor({ question, index, onChange, onRemove }) {
  const update = (patch) => onChange({ ...question, ...patch });

  const updateOption = (i, value) => {
    const options = [...(question.options || [])];
    options[i] = value;
    update({ options });
  };

  const addOption = () => update({ options: [...(question.options || []), ""] });
  const removeOption = (i) => {
    const options = (question.options || []).filter((_, idx) => idx !== i);
    const correctIndex = question.correctIndex === i ? undefined : question.correctIndex;
    update({ options, correctIndex });
  };

  return (
    <div className="rounded-2xl border border-line-light p-5 dark:border-line-dark">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-current/50">
          Question {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-current/40 hover:text-signal-rose"
          aria-label="Remove question"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <Select
          label="Type"
          value={question.type}
          onChange={(e) => update({ type: e.target.value, options: e.target.value === "MCQ" ? ["", ""] : undefined, correctIndex: undefined })}
          options={["MCQ", "SUBJECTIVE"]}
        />
        <Textarea
          label="Question text"
          rows={2}
          value={question.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="What is..."
        />

        {question.type === "MCQ" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Options (select the correct one)</label>
            <div className="space-y-2">
              {(question.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correctIndex === i}
                    onChange={() => update({ correctIndex: i })}
                    className="h-4 w-4 accent-signal-violet"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1"
                  />
                  {(question.options || []).length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-current/30 hover:text-signal-rose">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-signal-violet hover:underline"
            >
              <Plus className="h-3 w-3" /> Add option
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
