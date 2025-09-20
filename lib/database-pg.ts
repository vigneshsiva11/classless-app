// PostgreSQL Database functions for Classless AI Tutor
import { pool } from "./db-config";
import type {
  User,
  Question,
  Answer,
  Subject,
  Reply,
  QuizAttendance,
  LearningSession,
  Scholarship,
  LearningStation,
  InteractionLog,
} from "./types";

// User operations
export async function createUser(
  userData: Omit<User, "id" | "created_at" | "updated_at">
): Promise<User> {
  const query = `
    INSERT INTO users (phone_number, name, user_type, preferred_language, location, education_level)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    userData.phone_number,
    userData.name,
    userData.user_type,
    userData.preferred_language,
    userData.location,
    userData.education_level,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getUserByPhone(
  phone_number: string
): Promise<User | null> {
  const query = "SELECT * FROM users WHERE phone_number = $1";
  const result = await pool.query(query, [phone_number]);
  return result.rows[0] || null;
}

export async function getAllUsers(): Promise<User[]> {
  const query = "SELECT * FROM users ORDER BY created_at DESC";
  const result = await pool.query(query);
  return result.rows;
}

// Question operations
export async function createQuestion(
  questionData: Omit<Question, "id" | "created_at" | "status">
): Promise<Question> {
  const query = `
    INSERT INTO questions (user_id, subject_id, question_text, question_type, image_url, audio_url, language, response_language)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    questionData.user_id,
    questionData.subject_id,
    questionData.question_text,
    questionData.question_type,
    questionData.image_url,
    questionData.audio_url,
    questionData.language,
    questionData.response_language,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getQuestionById(id: number): Promise<Question | null> {
  const query = "SELECT * FROM questions WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function getQuestionsByUser(user_id: number): Promise<Question[]> {
  const query =
    "SELECT * FROM questions WHERE user_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(query, [user_id]);
  return result.rows;
}

export async function getPendingQuestions(): Promise<Question[]> {
  const query =
    "SELECT * FROM questions WHERE status = $1 ORDER BY created_at ASC";
  const result = await pool.query(query, ["pending"]);
  return result.rows;
}

// Answer operations
export async function createAnswer(
  answerData: Omit<Answer, "id" | "created_at" | "helpful_votes">
): Promise<Answer> {
  const query = `
    INSERT INTO answers (question_id, answer_text, answer_type, teacher_id, confidence_score)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    answerData.question_id,
    answerData.answer_text,
    answerData.answer_type,
    answerData.teacher_id,
    answerData.confidence_score,
  ];

  const result = await pool.query(query, values);

  // Update question status to answered
  await pool.query("UPDATE questions SET status = $1 WHERE id = $2", [
    "answered",
    answerData.question_id,
  ]);

  return result.rows[0];
}

export async function getRepliesByQuestion(
  question_id: number
): Promise<Reply[]> {
  const query = `
    SELECT * FROM replies 
    WHERE question_id = $1 
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [question_id]);
  return result.rows;
}

export async function createReply(
  replyData: Omit<Reply, "id" | "created_at">
): Promise<Reply> {
  const query = `
    INSERT INTO replies (question_id, user_id, text)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [replyData.question_id, replyData.user_id, replyData.text];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getAnswersByQuestion(
  question_id: number
): Promise<Answer[]> {
  const query =
    "SELECT * FROM answers WHERE question_id = $1 ORDER BY created_at ASC";
  const result = await pool.query(query, [question_id]);
  return result.rows;
}

// Subject operations
export async function getAllSubjects(): Promise<Subject[]> {
  const query = "SELECT * FROM subjects ORDER BY name";
  const result = await pool.query(query);
  return result.rows;
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  const query = "SELECT * FROM subjects WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// Quiz Attendance operations
export async function createQuizAttendance(
  attendanceData: Omit<QuizAttendance, "id">
): Promise<QuizAttendance> {
  const query = `
    INSERT INTO quiz_attendance (student_id, quiz_id, subject, level, attended_at, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    attendanceData.student_id,
    attendanceData.quiz_id,
    attendanceData.subject,
    attendanceData.level,
    attendanceData.attended_at,
    attendanceData.status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getQuizAttendanceByStudent(
  student_id: number
): Promise<QuizAttendance[]> {
  const query = `
    SELECT * FROM quiz_attendance 
    WHERE student_id = $1 
    ORDER BY attended_at DESC
  `;
  const result = await pool.query(query, [student_id]);
  return result.rows;
}

export async function updateQuizAttendance(
  id: number,
  updates: Partial<
    Pick<
      QuizAttendance,
      | "status"
      | "completed_at"
      | "score"
      | "total_questions"
      | "completion_time"
    >
  >
): Promise<QuizAttendance | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.completed_at !== undefined) {
    fields.push(`completed_at = $${paramCount++}`);
    values.push(updates.completed_at);
  }
  if (updates.score !== undefined) {
    fields.push(`score = $${paramCount++}`);
    values.push(updates.score);
  }
  if (updates.total_questions !== undefined) {
    fields.push(`total_questions = $${paramCount++}`);
    values.push(updates.total_questions);
  }
  if (updates.completion_time !== undefined) {
    fields.push(`completion_time = $${paramCount++}`);
    values.push(updates.completion_time);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id);
  const query = `
    UPDATE quiz_attendance 
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function getQuizAttendanceById(
  id: number
): Promise<QuizAttendance | null> {
  const query = "SELECT * FROM quiz_attendance WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// Utility functions
export async function searchQuestions(
  query: string,
  subject_id?: number
): Promise<Question[]> {
  let sql = "SELECT * FROM questions WHERE question_text ILIKE $1";
  const values = [`%${query}%`];

  if (subject_id) {
    sql += " AND subject_id = $2";
    values.push(subject_id.toString());
  }

  sql += " ORDER BY created_at DESC";

  const result = await pool.query(sql, values);
  return result.rows;
}

export async function getRecentQuestions(limit = 10): Promise<Question[]> {
  const query = `
    SELECT * FROM questions 
    ORDER BY created_at DESC 
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
}

// Learning Session operations
export async function createLearningSession(
  sessionData: Omit<LearningSession, "id" | "started_at">
): Promise<LearningSession> {
  const query = `
    INSERT INTO learning_sessions (user_id, session_type, questions_asked, questions_answered, duration_minutes, ended_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    sessionData.user_id,
    sessionData.session_type,
    sessionData.questions_asked,
    sessionData.questions_answered,
    sessionData.duration_minutes,
    sessionData.ended_at,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Scholarship operations
export async function getAllScholarships(): Promise<Scholarship[]> {
  const query =
    "SELECT * FROM scholarships WHERE is_active = true ORDER BY created_at DESC";
  const result = await pool.query(query);
  return result.rows;
}

// Learning Station operations
export async function getAllLearningStations(): Promise<LearningStation[]> {
  const query =
    "SELECT * FROM learning_stations WHERE is_active = true ORDER BY name";
  const result = await pool.query(query);
  return result.rows;
}

// Interaction Log operations
export async function createInteractionLog(
  logData: Omit<InteractionLog, "id" | "created_at">
): Promise<InteractionLog> {
  const query = `
    INSERT INTO interaction_logs (user_id, interaction_type, message_content, response_content, session_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    logData.user_id,
    logData.interaction_type,
    logData.message_content,
    logData.response_content,
    logData.session_id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}
