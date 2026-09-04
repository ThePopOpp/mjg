import Link from "next/link";
import { redirect } from "next/navigation";
import blackLogo from "@/docs/mjg-logos/mjg_black_white.png";
import whiteLogo from "@/docs/mjg-logos/mjg_white.png";
import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessPortal } from "@/lib/rbac/roles";

export const metadata = {
  title: "Create your account | Michael J. Gauthier",
  description: "Register as a Participant or a Facilitator to join the 6-Week Challenge.",
};

export default async function RegisterPage() {
  const profile = await getCurrentProfile();
  if (profile?.status === "active" && canAccessPortal(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="fixed right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="mx-auto mb-6 block h-14 w-40">
          <img src={blackLogo.src} alt="Michael J. Gauthier" className="h-full w-full object-contain dark:hidden" />
          <img src={whiteLogo.src} alt="Michael J. Gauthier" className="hidden h-full w-full object-contain dark:block" />
        </span>
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Create your account</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Choose the account type that best describes you. Your selection sets your role — and you can change it later
          from your profile.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#c9aa70] hover:underline">Sign in</Link>
        </p>
      </div>

      <RegisterForm />
    </main>
  );
}
