import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Access Restricted | MJG Dashboard",
};

export default function AccessRestrictedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
          <CardDescription>
            Your account is signed in, but it does not currently have active dashboard access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask a Super Admin to confirm your role, status, and profile record in Supabase.
          </p>
          <form action="/auth/logout" method="post">
            <Button type="submit">Sign out</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
