import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tdxjqwbbrcdrdklxtpxw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGpxd2JicmNkcmRrbHh0cHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njc5MDQsImV4cCI6MjA3NzQ0MzkwNH0.HRXGAc1tbLpCNRMrzNE2jPuUqZmImiW-4lVwvnICy3M";

export const supabase = createClient(supabaseUrl, supabaseKey);
