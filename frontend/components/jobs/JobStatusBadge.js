import Badge from "@/components/ui/Badge";

export default function JobStatusBadge({ isPublished }) {
  return isPublished ? (
    <Badge tone="mint">Published</Badge>
  ) : (
    <Badge tone="amber">Draft</Badge>
  );
}
