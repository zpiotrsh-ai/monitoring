import { supabase } from "./supabase.js";

const { data, error } = await supabase
  .from("najnowsze_pomiary_kominow")
  .select("*")
  .limit(1);

console.log(data);
console.log(error);
