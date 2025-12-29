import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { email, password, username } = await req.json();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const role = email.endsWith("@mindgenz.com") ? "admin" : "user";

  await supabase.from("profiles").insert({
    id: data.user.id,
    username,
    role,
  });

  return Response.json({ success: true });
}
