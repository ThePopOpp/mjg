"use server";

import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(email: string, password: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Authentication service unavailable." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  return {};
}
