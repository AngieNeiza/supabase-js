// src/supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://nqgthxmkrwvjtcjrjafp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZ3RoeG1rcnd2anRjanJqYWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTgxODcsImV4cCI6MjA3OTYzNDE4N30.lqRruv0xIeiBXJCFc2tEFpSuYRrNwiHDsu5N6fb7vfI';
export const supabase = createClient(supabaseUrl, supabaseKey);