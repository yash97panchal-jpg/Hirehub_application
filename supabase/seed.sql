-- HireHub Seed Data for Development
-- Includes verified and pending companies, jobs with various apply modes, applications, and realistic user profiles.

-- Note: Ensure UUIDs are consistent for foreign keys
DO $$
DECLARE
  company_meta_id UUID := '11111111-1111-1111-1111-111111111111';
  company_google_id UUID := '22222222-2222-2222-2222-222222222222';
  company_stripe_id UUID := '33333333-3333-3333-3333-333333333333';
  company_spotify_id UUID := '44444444-4444-4444-4444-444444444444';
  company_pending_id UUID := '55555555-5555-5555-5555-555555555555';
  
  job1_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  job2_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  job3_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  job4_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
BEGIN

  -- 1. SEED COMPANIES
  INSERT INTO public.companies (id, name, slug, logo, banner, website, description, size, industry, location, address, coordinates, verified, status, rating, review_count)
  VALUES
    (
      company_meta_id,
      'Meta',
      'meta',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop&auto=format',
      'https://about.meta.com',
      'Building technologies that help people connect, find communities, and grow businesses across AI and metaverse.',
      '10,000+',
      'Social Technology',
      'Menlo Park, CA',
      '1 Hacker Way, Menlo Park, CA 94025',
      '{"lat": 37.4848, "lng": -122.1484}',
      true,
      'approved',
      4.9,
      1280
    ),
    (
      company_google_id,
      'Google',
      'google',
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop&auto=format',
      'https://google.com/careers',
      'Organizing the world’s information and making it universally accessible and useful through breakthrough AI.',
      '10,000+',
      'Cloud & AI',
      'Mountain View, CA',
      '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
      '{"lat": 37.4220, "lng": -122.0841}',
      true,
      'approved',
      4.9,
      2400
    ),
    (
      company_stripe_id,
      'Stripe',
      'stripe',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=300&fit=crop&auto=format',
      'https://stripe.com/jobs',
      'Financial infrastructure for the internet. Millions of companies use Stripe software to accept payments and manage businesses.',
      '5,000-10,000',
      'Fintech',
      'San Francisco, CA',
      '354 Oyster Point Blvd, South San Francisco, CA 94080',
      '{"lat": 37.6604, "lng": -122.3880}',
      true,
      'approved',
      4.8,
      950
    ),
    (
      company_spotify_id,
      'Spotify',
      'spotify',
      'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=128&h=128&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=300&fit=crop&auto=format',
      'https://spotifyjobs.com',
      'Unlocking the potential of human creativity by giving a million creative artists the opportunity to live off their art.',
      '5,000-10,000',
      'Audio Streaming',
      'Stockholm, Sweden / Remote',
      'Regeringsgatan 19, 111 53 Stockholm, Sweden',
      '{"lat": 59.3326, "lng": 18.0649}',
      true,
      'approved',
      4.7,
      820
    ),
    (
      company_pending_id,
      'Nova AI Labs',
      'nova-ai-labs',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=300&fit=crop&auto=format',
      'https://nova-ai.example.com',
      'Next-generation cognitive robotics research laboratory developing autonomous physical intelligence.',
      '10-50',
      'Artificial Intelligence',
      'Austin, TX',
      '100 Congress Ave, Austin, TX 78701',
      '{"lat": 30.2672, "lng": -97.7431}',
      false,
      'pending',
      5.0,
      1
    )
  ON CONFLICT (slug) DO NOTHING;

  -- 2. SEED JOBS WITH VARIED APPLY MODES ('easy', 'external', 'both')
  INSERT INTO public.jobs (
    id, company_id, title, description, location, address, coordinates, remote_type, job_type,
    salary_min, salary_max, currency, skills, experience_level, category, status,
    apply_mode, external_apply_url, screening_questions, responsibilities, requirements, benefits, source, application_count
  )
  VALUES
    (
      job1_id,
      company_meta_id,
      'Staff AI Systems Engineer (PyTorch & Distributed Training)',
      'We are looking for a Staff AI Systems Engineer to architect next-generation large-scale training pipelines for our generative foundations.',
      'Menlo Park, CA (Hybrid)',
      '1 Hacker Way, Menlo Park, CA',
      '{"lat": 37.4848, "lng": -122.1484}',
      'Hybrid',
      'Full-time',
      240000,
      360000,
      'USD',
      ARRAY['Python', 'PyTorch', 'Distributed Systems', 'CUDA', 'C++'],
      '5+ years',
      'Engineering',
      'published',
      'both',
      'https://about.meta.com/careers/jobs/staff-ai-systems',
      '[{"id": "q1", "question": "How many years of experience do you have scaling distributed PyTorch clusters?", "type": "text", "required": true}, {"id": "q2", "question": "Are you legally authorized to work in the United States?", "type": "yes_no", "required": true}]'::jsonb,
      ARRAY['Design and optimize petabyte-scale GPU clusters', 'Scale training throughput using FlashAttention and FSDP', 'Collaborate with foundational research scientists'],
      ARRAY['BS/MS in Computer Science or equivalent', '5+ years experience in high-performance computing', 'Deep familiarity with CUDA profiling tools'],
      ARRAY['Top-tier 401(k) matching', 'Comprehensive wellness stipend', 'On-site gourmet meals', 'Equity package'],
      'posted',
      42
    ),
    (
      job2_id,
      company_google_id,
      'Senior Cloud Solutions Architect',
      'Help Fortune 500 enterprises migrate mission-critical applications to Google Cloud Platform using modern Kubernetes and Serverless paradigms.',
      'Mountain View, CA',
      '1600 Amphitheatre Pkwy, Mountain View, CA',
      '{"lat": 37.4220, "lng": -122.0841}',
      'Hybrid',
      'Full-time',
      190000,
      285000,
      'USD',
      ARRAY['GCP', 'Kubernetes', 'Terraform', 'Go', 'Enterprise Architecture'],
      '3-5 years',
      'Engineering',
      'published',
      'external',
      'https://google.com/careers/jobs/cloud-solutions-architect',
      '[]'::jsonb,
      ARRAY['Lead technical architecture reviews with enterprise CTOs', 'Build reusable Terraform infrastructure modules', 'Conduct architectural audits'],
      ARRAY['Google Cloud Professional Cloud Architect certification', 'Solid grasp of distributed networking and VPC peering', 'Bilingual proficiency is a plus'],
      ARRAY['Generous parental leave', 'Health insurance with zero deductible', 'Annual education budget'],
      'posted',
      28
    ),
    (
      job3_id,
      company_stripe_id,
      'Lead Frontend Engineer (React 19 & Design Systems)',
      'Shape the developer ergonomics of the Stripe Dashboard across millions of daily financial transactions.',
      'San Francisco, CA / Remote',
      '354 Oyster Point Blvd, South San Francisco, CA',
      '{"lat": 37.6604, "lng": -122.3880}',
      'Remote',
      'Full-time',
      180000,
      260000,
      'USD',
      ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'Accessibility'],
      '3-5 years',
      'Engineering',
      'published',
      'easy',
      null,
      '[{"id": "q1", "question": "What is your proudest web performance optimization victory?", "type": "text", "required": false}]'::jsonb,
      ARRAY['Craft world-class UI interactions and accessible primitives', 'Maintain sub-second page transitions across complex data views', 'Mentor intermediate frontend engineers'],
      ARRAY['Deep expertise in modern React and TypeScript', 'Obsession with layout stability and micro-animations', 'Proven history with design tokens'],
      ARRAY['Home office setup budget ($2,500)', 'Annual wellness days', 'Flexible PTO'],
      'posted',
      19
    ),
    (
      job4_id,
      company_spotify_id,
      'Product Designer (Mobile Audio Experiences)',
      'Design delightful listening, playlist generation, and social sharing interfaces for over 600 million music fans.',
      'Stockholm, Sweden (Hybrid)',
      'Regeringsgatan 19, Stockholm',
      '{"lat": 59.3326, "lng": 18.0649}',
      'Hybrid',
      'Full-time',
      110000,
      165000,
      'USD',
      ARRAY['Figma', 'UI/UX', 'Mobile Design', 'User Research', 'Prototyping'],
      '3-5 years',
      'Design',
      'published',
      'both',
      'https://spotifyjobs.com/product-designer-mobile',
      '[]'::jsonb,
      ARRAY['Create intuitive mobile mockups and functional Figma prototypes', 'Conduct international user testing sessions', 'Align cross-functional team roadmaps'],
      ARRAY['Portfolio demonstrating shipped mobile app interfaces', 'Fluency with iOS Human Interface Guidelines and Material 3', 'Empathetic mindset'],
      ARRAY['Free Spotify Premium for life', 'Relocation assistance to Sweden', 'Pension scheme'],
      'posted',
      35
    )
  ON CONFLICT DO NOTHING;

END $$;
