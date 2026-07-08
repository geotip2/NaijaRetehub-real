import { supabase } from './supabase';

const jobs = [
  {
    title: 'Customer Success Associate (US Remote)',
    company: 'Buffer',
    type: 'Full-time',
    location: 'Remote',
    salary: '₦2,400,000/mo',
    category: 'Customer Support',
    is_free: false,
    apply_url: 'https://buffer.com/jobs',
    posted_at: new Date().toISOString()
  },
  {
    title: 'React Developer (Lagos/Remote)',
    company: 'Paystack',
    type: 'Full-time',
    location: 'Lagos, NG',
    salary: '₦1,800,000/mo',
    category: 'Engineering',
    is_free: true,
    apply_url: 'https://paystack.com/careers',
    posted_at: new Date().toISOString()
  },
  {
    title: 'Content Writer (Global Remote)',
    company: 'Ghost',
    type: 'Contract',
    location: 'Remote',
    salary: '₦950,000/mo',
    category: 'Marketing',
    is_free: false,
    apply_url: 'https://ghost.org/careers',
    posted_at: new Date().toISOString()
  }
];

const courses = [
  {
    title: 'How to Land Your First $2k Remote Job',
    description: 'Learn the exact strategies to optimize your LinkedIn, pass global interviews, and negotiate USD salaries from Nigeria.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    is_free: true,
    content_url: '#'
  },
  {
    title: 'AI Productivity for Remote Workers',
    description: 'Master ChatGPT and Claude to automate your workflow and handle 3 remote jobs simultaneously.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    is_free: false,
    content_url: '#'
  }
];

export async function seedSupabase() {
  const { data: jobsList } = await supabase.from('jobs').select('id').limit(1);
  if (!jobsList || jobsList.length === 0) {
    console.log('Seeding jobs...');
    await supabase.from('jobs').insert(jobs);
  }

  const { data: coursesList } = await supabase.from('courses').select('id').limit(1);
  if (!coursesList || coursesList.length === 0) {
    console.log('Seeding courses...');
    await supabase.from('courses').insert(courses);
  }
}
