1. Project Overview & Step steps

This project is a full-stack Todo Application.  The system allows users to manage personal todos while enforcing Attribute-Based Access Control (ABAC) using user roles and todo status.
The application supports:
* Secure authentication using Better Auth
* Role-based authorization (User, Manager, Admin)
* Modern frontend using Next.js (App Router) and shadcn/ui
* Efficient data fetching with TanStack Query
* 

2. System Architecture (High Level)
Frontend
* Next.js (App Router)
* shadcn/ui for UI components
* TanStack Query for API state management
Backend
* API routes (Next.js)
* MySQL database
* Better Auth for authentication & session handling
Database
* MySQL
* 5 main tables:
    * user
    * todos
    * account
    * session
    * verification
    * 

3. Database Design (Step-by-Step)

3.1 User Table
Stores registered users and their roles.

CREATE TABLE user (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  emailVerified TINYINT(1) NOT NULL DEFAULT 0,
  image VARCHAR(500),
  role ENUM('USER','MANAGER','ADMIN') NOT NULL DEFAULT 'USER',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Purpose
* Identifies users
* Stores role for ABAC decisions
* Tracks email verification
* 

3.2 Todos Table
Stores todo items created by users.

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft','in_progress','completed') NOT NULL DEFAULT 'draft',
  user_id VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

Purpose
* Each todo belongs to a user
* status is an attribute used in ABAC
* Enforces ownership using user_id

3.3 Account Table (Authentication)
Stores login credentials and OAuth-related data.

CREATE TABLE account (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  accountId VARCHAR(255) NOT NULL,
  providerId VARCHAR(50) NOT NULL,
  password VARCHAR(255),
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope VARCHAR(255),
  idToken TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

Purpose
* Supports Better Auth
* Handles credentials and OAuth providers
* 

3.4 Session Table
Manages logged-in sessions.

CREATE TABLE session (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  ipAddress VARCHAR(45),
  userAgent VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
Purpose
* Tracks active user sessions
* Improves security and session validation

3.5 Verification Table
Used for email verification and password resets.

CREATE TABLE verification (
  id VARCHAR(36) PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Purpose
* Handles email verification tokens
* Supports secure authentication flows

4. ABAC Model Implementation (Core Concept)
Attributes Used
* User Attribute: role
* Resource Attribute: todo.status
* Ownership Attribute: todo.user_id

5. Permission Rules (Report Section)
5.1 User Role
Action	Rule
View Todos	Can view only their own todos
Create Todos	Allowed
Update Todos	Allowed (own todos only)
Delete Todos	Only if status = draft
-- User: View own todos
SELECT * FROM todos WHERE user_id = :userId;

-- User: Delete own draft todos
DELETE FROM todos 
WHERE id = :todoId 
AND user_id = :userId 
AND status = 'draft';

5.2 Manager Role
Action	Rule
View Todos	Can view all todos
Create	❌
Update	❌
Delete	❌
-- Manager: View all todos
SELECT todos.*, user.name 
FROM todos 
JOIN user ON todos.user_id = user.id;

5.3 Admin Role
Action	Rule
View Todos	Can view all todos
Create	❌
Update	❌
Delete	Can delete any todo
-- Admin: Delete any todo
DELETE FROM todos WHERE id = :todoId;

6. Step-by-Step Project Workflow
Step 1: Setup Project
* Create Next.js App (App Router)
* Install shadcn/ui
* Configure MySQL
* Setup Better Auth

Step 2: Database Setup
* Create all tables
* Add foreign keys
* Test CRUD queries

Step 3: Authentication
* User registration
* Email verification
* Session management

Step 4: Todo CRUD APIs
* Create todo
* Fetch todos (based on role)
* Update todo
* Delete todo (ABAC enforced)

Step 5: ABAC Enforcement
* Check user role
* Check todo owner
* Check todo status
* Allow or deny action

Step 6: Frontend Integration
* Use TanStack Query for API calls
* Show UI based on permissions
* Hide unauthorized actions
