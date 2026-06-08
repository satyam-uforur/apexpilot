import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zzsbxfpvrtncagdszzep.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6c2J4ZnB2cnRuY2FnZHN6emVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjMxMTksImV4cCI6MjA5NjQzOTExOX0.cw3QcY7c2LsU3VXb0kPEmVM-NIsrbPzjrYNzTN7BfLk'
);

const dummies = [
  { username: 'Rahul_Sharma', score: 1010, is_anonymous: false },
  { username: 'Priya_Patel', score: 982, is_anonymous: false },
  { username: 'Amit_Verma', score: 965, is_anonymous: false },
  { username: 'Sneha_Reddy', score: 947, is_anonymous: false },
  { username: 'Vikram_Singh', score: 933, is_anonymous: false },
  { username: 'Ananya_Gupta', score: 918, is_anonymous: false },
  { username: 'Rohit_Joshi', score: 905, is_anonymous: false },
  { username: 'Kavya_Nair', score: 892, is_anonymous: false },
  { username: 'Arjun_Kumar', score: 878, is_anonymous: false },
  { username: 'Deepika_Rao', score: 865, is_anonymous: false },
  { username: 'Manish_Agarwal', score: 852, is_anonymous: false },
  { username: 'Neha_Deshmukh', score: 840, is_anonymous: false },
  { username: 'Siddharth_Malik', score: 828, is_anonymous: false },
  { username: 'Pooja_Iyer', score: 816, is_anonymous: false },
  { username: 'Karan_Mehta', score: 805, is_anonymous: false },
  { username: 'Ishita_Bose', score: 800, is_anonymous: false },
  { username: 'Ajay_Chopra', score: 800, is_anonymous: false },
  { username: 'Divya_Saxena', score: 800, is_anonymous: false },
  { username: 'Harsh_Dubey', score: 800, is_anonymous: false },
  { username: 'Riya_Kapoor', score: 800, is_anonymous: false },
];

const { error: delErr } = await supabase.from('leaderboard').delete().neq('id', '00000000-0000-0000-0000-000000000000');
if (delErr) console.error('Delete failed:', delErr.message);
else console.log('Cleared existing entries');

const entries = dummies.map(d => ({ ...d, plays: 1 }));
const { data, error } = await supabase.from('leaderboard').insert(entries).select();

if (error) {
  console.error('Seed failed:', error.message);
} else {
  console.log(`Inserted ${data.length} Indian-name entries with ELO 800-1010`);
}

process.exit(0);
