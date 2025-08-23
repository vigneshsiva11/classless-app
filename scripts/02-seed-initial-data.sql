-- Seed data for Classless AI Tutor platform

-- Insert sample subjects
INSERT INTO subjects (name, code, description, education_level) VALUES
('Mathematics', 'MATH', 'Basic to advanced mathematics concepts', 'all'),
('Science', 'SCI', 'Physics, Chemistry, Biology fundamentals', 'all'),
('English', 'ENG', 'English language and literature', 'all'),
('Hindi', 'HIN', 'Hindi language and literature', 'all'),
('Social Studies', 'SOC', 'History, Geography, Civics', 'all'),
('Computer Science', 'CS', 'Basic programming and computer concepts', 'high_school'),
('Vocational Skills', 'VOC', 'Practical skills and trades', 'all');

-- Insert sample scholarships
INSERT INTO scholarships (title, description, eligibility_criteria, amount, deadline, target_audience, location, is_active) VALUES
('PM Scholarship Scheme', 'Scholarship for children of armed forces personnel', 'Children of ex-servicemen, family income < 6 lakh', 25000.00, '2024-12-31', 'students', 'India', true),
('Merit Scholarship for Girls', 'Encouraging girls education in rural areas', 'Female students, rural background, merit-based', 15000.00, '2024-11-30', 'female_students', 'Rural India', true),
('Digital India Scholarship', 'Supporting students in technology education', 'Students pursuing computer science/IT', 30000.00, '2024-10-15', 'tech_students', 'India', true),
('Minority Community Scholarship', 'Educational support for minority communities', 'Students from minority communities, income < 5 lakh', 20000.00, '2024-12-15', 'minority_students', 'India', true);

-- Insert sample learning stations
INSERT INTO learning_stations (name, location, contact_person, contact_phone, operating_hours, available_subjects, is_active) VALUES
('Community Center - Sector 15', 'Sector 15, Chandigarh', 'Rajesh Kumar', '+91-9876543210', '9 AM - 6 PM', ARRAY['Mathematics', 'Science', 'English'], true),
('Village Library - Khanna', 'Khanna, Punjab', 'Sunita Devi', '+91-9876543211', '10 AM - 5 PM', ARRAY['Mathematics', 'Hindi', 'Social Studies'], true),
('Youth Center - Model Town', 'Model Town, Ludhiana', 'Amit Singh', '+91-9876543212', '8 AM - 8 PM', ARRAY['Computer Science', 'English', 'Vocational Skills'], true);

-- Insert sample admin user
INSERT INTO users (phone_number, name, user_type, preferred_language, location, education_level) VALUES
('+91-9999999999', 'System Admin', 'admin', 'en', 'India', 'graduate');
