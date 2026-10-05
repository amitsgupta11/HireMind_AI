"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SkillInput from "./SkillInput";
import StepIndicator from "./StepIndicator";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

const schema = z
  .object({
    title: z.string().min(3, "Job title is required"),
    location: z.string().min(2, "Location is required"),
    employmentType: z.enum(EMPLOYMENT_TYPES, { errorMap: () => ({ message: "Select an employment type" }) }),
    description: z.string().min(20, "Write at least 20 characters"),
    requiredSkills: z.array(z.string()).min(1, "Add at least one required skill"),
    preferredSkills: z.array(z.string()).default([]),
    experienceMin: z.coerce.number({ invalid_type_error: "Required" }).int().min(0),
    experienceMax: z.coerce.number().int().min(0).optional().or(z.literal("")),
    salaryMin: z.coerce.number().int().min(0).optional().or(z.literal("")),
    salaryMax: z.coerce.number().int().min(0).optional().or(z.literal("")),
  })
  .refine(
    (d) => d.experienceMax === "" || d.experienceMax === undefined || d.experienceMax >= d.experienceMin,
    { message: "Max must be ≥ min experience", path: ["experienceMax"] }
  );

const STEPS = [
  "Basic Info",
  "Description",
  "Required Skills",
  "Preferred Skills",
  "Experience & Salary",
  "Assessment",
  "Review & Publish",
];

const STEP_FIELDS = [
  ["title", "location", "employmentType"],
  ["description"],
  ["requiredSkills"],
  [],
  ["experienceMin", "experienceMax", "salaryMin", "salaryMax"],
  [],
  [],
];

// Drives job creation AND editing — the parent page passes initialValues
// and an onSubmit(data, isPublished) handler, so this component only
// owns the wizard UX, never the API call itself.
export default function JobWizard({ initialValues, onSubmit, submitting, serverError }) {
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      location: "",
      employmentType: "",
      description: "",
      requiredSkills: [],
      preferredSkills: [],
      experienceMin: 0,
      experienceMax: "",
      salaryMin: "",
      salaryMax: "",
      ...initialValues,
    },
    mode: "onSubmit",
  });

  const values = watch();

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submitAs = (isPublished) => handleSubmit((data) => onSubmit(data, isPublished))();

  return (
    <Card className="mx-auto max-w-3xl">
      <StepIndicator steps={STEPS} currentStep={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <Input label="Job title" placeholder="Senior Frontend Engineer" error={errors.title?.message} {...register("title")} />
              <Input label="Location" placeholder="Remote / Bengaluru, India" error={errors.location?.message} {...register("location")} />
              <Select
                label="Employment type"
                placeholder="Select type"
                options={EMPLOYMENT_TYPES}
                error={errors.employmentType?.message}
                {...register("employmentType")}
              />
            </div>
          )}

          {step === 1 && (
            <Textarea
              label="Job description"
              rows={10}
              placeholder="Describe the role, responsibilities, and what success looks like..."
              error={errors.description?.message}
              {...register("description")}
            />
          )}

          {step === 2 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Required skills</label>
              <p className="mb-3 text-xs text-current/50">
                Candidates need these to be considered a strong match. Weighted 70% in job matching.
              </p>
              <SkillInput
                value={values.requiredSkills}
                onChange={(v) => setValue("requiredSkills", v, { shouldValidate: true })}
                placeholder="e.g. React, press Enter"
                tone="violet"
              />
              {errors.requiredSkills && (
                <p className="mt-1.5 text-xs text-signal-rose">{errors.requiredSkills.message}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Preferred skills</label>
              <p className="mb-3 text-xs text-current/50">
                Nice-to-haves that boost a candidate's match score. Weighted 15%. Optional.
              </p>
              <SkillInput
                value={values.preferredSkills}
                onChange={(v) => setValue("preferredSkills", v)}
                placeholder="e.g. Docker, press Enter"
                tone="cyan"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min experience (years)"
                  type="number"
                  min={0}
                  error={errors.experienceMin?.message}
                  {...register("experienceMin")}
                />
                <Input
                  label="Max experience (years)"
                  type="number"
                  min={0}
                  error={errors.experienceMax?.message}
                  {...register("experienceMax")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min salary (₹/yr)" type="number" min={0} {...register("salaryMin")} />
                <Input label="Max salary (₹/yr)" type="number" min={0} {...register("salaryMax")} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-light py-12 text-center dark:border-line-dark">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-gradient-soft text-signal-violet">
                <ClipboardCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="font-medium">Assessments arrive in Phase 9</p>
                <p className="mt-1 max-w-sm text-sm text-current/60">
                  You'll be able to attach an MCQ or subjective assessment to this job once the
                  Assessment System ships. For now, you can publish without one.
                </p>
              </div>
            </div>
          )}

          {step === 6 && <ReviewStep values={values} />}
        </motion.div>
      </AnimatePresence>

      {serverError && (
        <p role="alert" className="mt-5 rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
          {serverError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-line-light pt-6 dark:border-line-dark">
        <Button variant="ghost" onClick={goBack} disabled={step === 0} type="button">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={goNext} type="button">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => submitAs(false)} loading={submitting} type="button">
              Save as Draft
            </Button>
            <Button onClick={() => submitAs(true)} loading={submitting} type="button">
              <Sparkles className="h-4 w-4" /> Publish Job
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function ReviewStep({ values }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold">{values.title || "Untitled role"}</h3>
        <p className="text-sm text-current/60">
          {values.location} {values.employmentType && `· ${values.employmentType}`}
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-current/50">Description</p>
        <p className="whitespace-pre-line text-sm text-current/70">{values.description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-current/50">Required skills</p>
          <div className="flex flex-wrap gap-2">
            {values.requiredSkills?.map((s) => (
              <Badge key={s} tone="violet">{s}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-current/50">Preferred skills</p>
          <div className="flex flex-wrap gap-2">
            {values.preferredSkills?.length ? (
              values.preferredSkills.map((s) => (
                <Badge key={s} tone="cyan">{s}</Badge>
              ))
            ) : (
              <span className="text-xs text-current/40">None specified</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-line-light pt-4 dark:border-line-dark">
        <div>
          <p className="text-xs text-current/50">Experience</p>
          <p className="font-medium">
            {values.experienceMin || 0}
            {values.experienceMax ? `–${values.experienceMax}` : "+"} years
          </p>
        </div>
        <div>
          <p className="text-xs text-current/50">Salary</p>
          <p className="font-medium">
            {values.salaryMin || values.salaryMax
              ? `₹${values.salaryMin || 0} – ₹${values.salaryMax || "—"}`
              : "Not disclosed"}
          </p>
        </div>
      </div>
    </div>
  );
}
