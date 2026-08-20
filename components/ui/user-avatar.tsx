import { cn } from "@/lib/utils";

/** Initials from first + last name (e.g. "Jeremy Waters" → "JW"), falling back to the
 *  email's first letter, then "?". Used by the avatar and anywhere initials are shown. */
export function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  const f = (firstName ?? "").trim();
  const l = (lastName ?? "").trim();
  const initials = `${f.charAt(0)}${l.charAt(0)}`.trim();
  if (initials) return initials.toUpperCase();
  const e = (email ?? "").trim();
  return (e.charAt(0) || "?").toUpperCase();
}

/** A round avatar: the uploaded photo if present, otherwise the user's initials on the
 *  brand gold. Size is controlled with `className` (e.g. "h-9 w-9" / "h-24 w-24"). */
export function UserAvatar({
  firstName,
  lastName,
  email,
  avatarUrl,
  className,
}: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  className?: string;
}) {
  const initials = getInitials(firstName, lastName, email);
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={initials}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground",
        className,
      )}
      aria-label={initials}
    >
      {initials}
    </div>
  );
}
