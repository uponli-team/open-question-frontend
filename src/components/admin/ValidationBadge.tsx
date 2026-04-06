"use client";

import { Badge } from "@/components/ui/badge";

export default function ValidationBadge({
  valid,
}: {
  valid: boolean;
}) {
  return (
    <Badge variant={valid ? "success" : "danger"}>
      {valid ? "Valid" : "Invalid"}
    </Badge>
  );
}

