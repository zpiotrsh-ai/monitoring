import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://vzaixyxozdoabkiqcyyo.supabase.co";

const supabaseKey = "sb_publishable_7ARb66-eRNDAfkek20jUPw_nofgggdJ";

export const supabase = createClient(supabaseUrl, supabaseKey);
