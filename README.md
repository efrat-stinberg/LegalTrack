# 🧑‍⚖️ Legal Case Management System

A full-featured case and document management system for legal professionals, with integrated AI-powered legal chat.  
Built as a Full Stack project using modern web technologies and cloud infrastructure.

---

## 📚 Overview

The **Legal Case Management System** is built to streamline lawyers’ workflows by providing tools to manage legal cases, organize documents, and leverage AI to extract insights from legal materials.

---

## 🏗️ Tech Stack

| Layer          | Technology                      |
|----------------|----------------------------------|
| Backend        | ASP.NET Core Web API             |
| Lawyer Frontend| React                            |
| Admin Frontend | Angular                          |
| Database       | MySQL                            |
| File Storage   | Amazon S3                        |
| AI Engine      | GPT-based legal chat             |
| Auth           | JWT with role-based permissions  |

---

## 🎯 System Objectives

- Empower lawyers to manage cases and documents independently.
- Provide AI tools to extract and interpret legal insights from documents.
- Centralize all legal materials in one secure, accessible workspace.

---

## ⚙️ Main Modules

### 🧑‍💼 Lawyers’ Application (React)

#### 📁 Case Management
- Create, update, and delete cases (folders).
- Assign client info, status, open/close dates.
- Filter case list by status (open/closed).

#### 📄 Document Management
- Upload (PDF), view, download, and delete documents.
- Documents are linked to specific cases.
- Text is extracted for AI processing (OCR/Parser).

#### 💬 AI Legal Chat
- Ask case-specific questions.
- AI answers are based solely on associated documents.
- Chat history stored per case.

#### 📚 Client Management
- Manage basic client details (name, contact).
- View documents by client.

---

### 🏢 Administrative Application (Angular)

- Accessible only to office managers.
- Add/remove users (lawyers), assign to cases.
- View lawyer activity and workload.
- Dashboard for case statistics and user load.

---

## 🗃️ Data Model

```plaintext
User
├── Id
├── Name
├── Email
├── Role (Lawyer / Admin)

Folder (Case)
├── Id
├── Title
├── ClientName
├── Status (Open/Closed)
├── CreatedDate
├── UserId

Document
├── Id
├── FileName
├── FolderId
├── S3Url
├── ExtractedText

ChatMessage
├── Id
├── FolderId
├── Question
├── Answer
├── Timestamp
🔐 Infrastructure & Security
JWT Authentication with token validation.

Role-based access (Admin, Lawyer).

Document access restricted per case.

Lawyers and admins are fully separated by access level.

🧪 API Endpoints
Endpoint	Description
/api/folders	Manage cases (CRUD)
/api/documents	Upload/download/delete documents
/api/chat	Ask questions and get AI answers
/api/users	Manage users (admins only)
/api/auth	Register/login

🎨 UI/UX Principles
Clean, responsive design with intuitive navigation.

Case display using card/grid layout.

Drag & Drop support for file upload.

File previews with metadata.

Legal chat interface with contextual hints.

✅ Getting Started
1. Clone the repository
bash
Copy
Edit
git clone https://github.com/your-org/legal-case-system.git
2. Configure your environment
Set the following values in appsettings.json or environment variables:

JWT:Key, JWT:Issuer, JWT:Audience

AWS:AccessKey, AWS:SecretKey, AWS:BucketName

MySQL connection string in DefaultConnection

3. Run the backend
bash
Copy
Edit
cd LegalCaseManagement.Server
dotnet ef database update
dotnet run
4. Run React client (lawyers)
bash
Copy
Edit
cd Client.React
npm install
npm start
5. Run Angular client (admins)
bash
Copy
Edit
cd Client.Angular
npm install
ng serve
👥 Contributors

[Your Name] – Backend Developer (.NET)

[Frontend Dev] – React UI Developer

[Admin UI Dev] – Angular Admin Dashboard
