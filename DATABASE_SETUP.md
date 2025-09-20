# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the Classless AI Tutor application.

## Prerequisites

1. **PostgreSQL** installed on your system
2. **Node.js** and **npm** installed
3. **Git** (if cloning the repository)

## Installation Steps

### 1. Install PostgreSQL

#### Windows:

- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user

#### macOS:

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or using Postgres.app
# Download from https://postgresapp.com/
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

Connect to PostgreSQL as the superuser:

```bash
# On Windows (if installed with default settings)
psql -U postgres

# On macOS/Linux
sudo -u postgres psql
```

Create the database and user:

```sql
-- Create database
CREATE DATABASE classless_db;

-- Create user (optional - you can use postgres user)
CREATE USER classless_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE classless_db TO classless_user;

-- Exit psql
\q
```

### 3. Install Dependencies

```bash
# Install PostgreSQL dependencies
npm install

# Or if using yarn
yarn install
```

### 4. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://classless_user:your_secure_password@localhost:5432/classless_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=classless_db
DB_USER=classless_user
DB_PASSWORD=your_secure_password

# Existing API Keys (keep your existing ones)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
```

### 5. Setup Database Schema

Run the database setup script:

```bash
npm run db:setup
```

This will:

- Create all necessary tables
- Insert default subjects
- Set up indexes for performance
- Verify the setup

### 6. Test Database Connection

```bash
npm run db:test
```

### 7. Start the Application

```bash
npm run dev
```

## Database Schema

The application creates the following tables:

- **users** - User accounts (students, teachers, admins)
- **subjects** - Available subjects for quizzes
- **questions** - User-submitted questions
- **answers** - AI and teacher answers
- **replies** - Discussion replies
- **quiz_attendance** - Quiz participation tracking
- **learning_sessions** - User learning sessions
- **scholarships** - Available scholarships
- **learning_stations** - Physical learning centers
- **interaction_logs** - User interaction history
- **notifications** - System notifications

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running:**

   ```bash
   # Windows
   services.msc # Look for PostgreSQL service

   # macOS
   brew services list | grep postgres

   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify credentials in `.env.local`**

3. **Check firewall settings** (if connecting from remote)

### Permission Issues

```sql
-- Grant additional permissions if needed
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO classless_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO classless_user;
```

### Reset Database

```sql
-- Drop and recreate database (WARNING: This deletes all data)
DROP DATABASE classless_db;
CREATE DATABASE classless_db;
GRANT ALL PRIVILEGES ON DATABASE classless_db TO classless_user;
```

Then run `npm run db:setup` again.

## Production Considerations

1. **Use connection pooling** (already configured)
2. **Set up SSL** for production
3. **Configure backups**
4. **Monitor performance**
5. **Use environment-specific configurations**

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your PostgreSQL installation
3. Ensure all environment variables are set correctly
4. Check the database connection using `npm run db:test`

The application will now use PostgreSQL instead of the mock database, providing persistent storage for all user data, quiz progress, and other information.
