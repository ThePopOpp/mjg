import { Suspense } from "react";
import { AcceptInviteForm } from "@/components/user-management/accept-invite-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Accept Invitation | MJG Dashboard",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl">Accept MJG Dashboard Invitation</CardTitle>
          <CardDescription>Create your secure dashboard account.</CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <Suspense>
              <AcceptInviteForm token={token} />
            </Suspense>
          ) : (
            <p className="text-sm text-destructive">This invitation link is missing its secure token.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
