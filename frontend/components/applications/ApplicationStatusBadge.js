import Badge from "@/components/ui/Badge";

const STATUS_TONE = {
  APPLIED: "cyan",
  UNDER_REVIEW: "amber",
  ASSESSMENT_ASSIGNED: "violet",
  INTERVIEW_ASSIGNED: "violet",
  SHORTLISTED: "mint",
  REJECTED: "rose",
};

const STATUS_LABEL = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  ASSESSMENT_ASSIGNED: "Assessment Assigned",
  INTERVIEW_ASSIGNED: "Interview Assigned",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
};

export default function ApplicationStatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] || "violet"}>{STATUS_LABEL[status] || status}</Badge>;
}
