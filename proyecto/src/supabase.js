// src/supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://gqebtwnadrhoqtyfjsgv.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZWJ0d25hZHJob3F0eWZqc2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjIxNTMsImV4cCI6MjA3OTU5ODE1M30.y_-vyyWe1k4RmYsFumkuEE-TO-A2n5OKBHncUg6KlkM';
export const supabase = createClient(supabaseUrl, supabaseKey);