-- Classless AI Tutor Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin')),
    preferred_language VARCHAR(10) DEFAULT 'en',
    location VARCHAR(255),
    education_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    education_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('text', 'image', 'voice')),
    image_url TEXT,
    audio_url TEXT,
    language VARCHAR(10) DEFAULT 'en',
    response_language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'escalated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    answer_type VARCHAR(20) NOT NULL CHECK (answer_type IN ('ai', 'teacher', 'peer')),
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    confidence_score DECIMAL(3,2),
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Attendance table
CREATE TABLE IF NOT EXISTS quiz_attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    attended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'attended' CHECK (status IN ('attended', 'completed', 'abandoned')),
    score INTEGER,
    total_questions INTEGER,
    completion_time INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('web', 'sms', 'ivr', 'station')),
    questions_asked INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    amount DECIMAL(12,2),
    deadline DATE,
    application_url TEXT,
    target_audience VARCHAR(255),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Stations table
CREATE TABLE IF NOT EXISTS learning_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    operating_hours TEXT,
    available_subjects TEXT[], -- Array of subject names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interaction Logs table
CREATE TABLE IF NOT EXISTS interaction_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('sms', 'ivr', 'web')),
    message_content TEXT,
    response_content TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('scholarship', 'question', 'system', 'reminder')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    scholarship_id INTEGER REFERENCES scholarships(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_replies_question_id ON replies(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attendance_student_id ON quiz_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attendance_status ON quiz_attendance(status);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user_id ON interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert default subjects
INSERT INTO subjects (name, code, description, education_level) VALUES
('Mathematics', 'MATH', 'Basic to advanced mathematics', 'all'),
('Science', 'SCI', 'Physics, Chemistry, Biology', 'all'),
('English', 'ENG', 'English language and literature', 'all'),
('History', 'HIST', 'World and local history', 'all'),
('Geography', 'GEO', 'Physical and human geography', 'all'),
('Computer Science', 'CS', 'Programming and computer concepts', 'all')
ON CONFLICT (code) DO NOTHING;
