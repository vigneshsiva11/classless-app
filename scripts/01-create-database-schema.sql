-- Classless AI Tutor Database Schema
-- Core tables for the inclusive education platform

-- Users table (students, teachers, admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin')),
    preferred_language VARCHAR(10) DEFAULT 'en',
    location VARCHAR(100),
    education_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    education_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'text' CHECK (question_type IN ('text', 'image', 'voice')),
    image_url VARCHAR(255),
    audio_url VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'escalated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    answer_text TEXT NOT NULL,
    answer_type VARCHAR(20) DEFAULT 'ai' CHECK (answer_type IN ('ai', 'teacher', 'peer')),
    teacher_id INTEGER REFERENCES users(id),
    confidence_score DECIMAL(3,2),
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning sessions table (for tracking progress)
CREATE TABLE IF NOT EXISTS learning_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('web', 'sms', 'ivr', 'station')),
    questions_asked INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Scholarships and government schemes
CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    amount DECIMAL(10,2),
    deadline DATE,
    application_url VARCHAR(255),
    target_audience VARCHAR(100),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User scholarship applications tracking
CREATE TABLE IF NOT EXISTS user_scholarships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    scholarship_id INTEGER REFERENCES scholarships(id),
    application_status VARCHAR(20) DEFAULT 'interested' CHECK (application_status IN ('interested', 'applied', 'approved', 'rejected')),
    applied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community learning stations
CREATE TABLE IF NOT EXISTS learning_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(15),
    operating_hours VARCHAR(100),
    available_subjects TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS/IVR interaction logs
CREATE TABLE IF NOT EXISTS interaction_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('sms', 'ivr', 'web')),
    message_content TEXT,
    response_content TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_questions_user ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_active ON scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
