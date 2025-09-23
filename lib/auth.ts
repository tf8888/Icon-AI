import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY);

export async function upsertUserFromClerk(clerkUser: any) {
  if (!clerkUser || !clerkUser.id) return;

  const user = {
    id: clerkUser.id,
    email: clerkUser.email_addresses?.[0]?.email_address || null,
    first_name: clerkUser.first_name || null,
    last_name: clerkUser.last_name || null,
  };

  await supabaseAdmin.from("users").upsert(user);
}
