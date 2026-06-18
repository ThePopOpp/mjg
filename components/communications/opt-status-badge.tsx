import { Badge } from "@/components/ui/badge";

export function OptStatusBadge({ optedIn }: { optedIn: boolean }) {
  return (
    <Badge variant={optedIn ? "default" : "secondary"} className="text-xs">
      {optedIn ? "Opted in" : "Opted out"}
    </Badge>
  );
}
