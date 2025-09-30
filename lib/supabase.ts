// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jubxqrydpkduwmzntodl.supabase.co"; // 👈 pon tu URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YnhxcnlkcGtkdXdtem50b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzgwOTIsImV4cCI6MjA3MzUxNDA5Mn0.YoWgcxzc5djT28CHLKLmnW5a73-GXhcSQ_tEMMI46Bo"; // 👈 pon tu anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
