import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('audit_logs').insert({
    actor_id: 'd9b9646b-f417-4c4f-95cc-8647573d8eb2', // A fake UUID or real one
    action: 'curriculum.update',
    target_table: 'student_terms',
    target_id: 'fake-target',
    target_label: 'Test Student',
    metadata: {
      student_id: 'fake-target',
      year_level: 1,
      semester: 1,
      courses_added: [{ code: 'TEST101', title: 'Test Course', status: 'enrolled' }],
      courses_removed: [],
      courses_status_changed: [],
      total_units: 3
    }
  });
  console.log("Result:", data, "Error:", error);
}
run();
