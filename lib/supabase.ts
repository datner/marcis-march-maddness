import { createClient } from "@supabase/supabase-js";
import { Database } from "~supabase/types";

export const supabaseClient = (accessToken: string) => {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY as string,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  return supabase;
};
