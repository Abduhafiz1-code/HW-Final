-- Coins jadvali
CREATE TABLE IF NOT EXISTS coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  coins INT DEFAULT 0,
  progress INT DEFAULT 0,
  claimed_milestones JSONB DEFAULT '[]',
  today_earned INT DEFAULT 0,
  last_day TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coins_policy" ON coins FOR ALL USING (auth.uid() = user_id);

-- Practice natijalari
CREATE TABLE IF NOT EXISTS practice_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT,
  correct INT DEFAULT 0,
  question_count INT DEFAULT 0,
  percent INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_results_policy" ON practice_results FOR ALL USING (auth.uid() = user_id);

-- Game natijalari
CREATE TABLE IF NOT EXISTS game_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pairs INT DEFAULT 0,
  attempts INT DEFAULT 0,
  time_seconds INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "game_results_policy" ON game_results FOR ALL USING (auth.uid() = user_id);

-- Profile premium/role maydonlari
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;

-- O'qituvchi testlari
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  questions JSONB DEFAULT '[]',
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tests_readable" ON tests;
DROP POLICY IF EXISTS "tests_teacher_manage" ON tests;
CREATE POLICY "tests_readable" ON tests FOR SELECT USING (true);
CREATE POLICY "tests_teacher_manage" ON tests FOR ALL USING (auth.uid() = teacher_id);
CREATE INDEX IF NOT EXISTS idx_tests_code ON tests(code);

-- Test natijalari
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  total INT DEFAULT 0,
  percent INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "test_results_owner_or_teacher" ON test_results;
CREATE POLICY "test_results_owner_or_teacher" ON test_results
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM tests WHERE tests.id = test_results.test_id AND tests.teacher_id = auth.uid())
  );
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test ON test_results(test_id);

-- Daily streak
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  streak_count INT DEFAULT 0,
  last_date TEXT,
  history JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "streaks_policy" ON streaks;
CREATE POLICY "streaks_policy" ON streaks FOR ALL USING (auth.uid() = user_id);

-- Premium obunalar tarixi
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_owner" ON subscriptions;
CREATE POLICY "subscriptions_owner" ON subscriptions FOR ALL USING (auth.uid() = user_id);
