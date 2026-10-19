# 🧑‍⚖️ LegalTrack – Legal Case Management System

A full-stack case and document management system for law firms, with an AI legal chat that answers questions based on the documents in each case.

- **Lawyers' app** (React): manage clients, cases and documents, and chat with the AI about a case.
- **Admin app** (Angular): office managers invite lawyers, manage users and view dashboard statistics.
- **Server** (ASP.NET Core): REST API with JWT auth, MySQL, Amazon S3 file storage and OpenAI integration.

---

## 🏗️ Tech Stack

| Layer           | Technology                                                     |
|-----------------|----------------------------------------------------------------|
| Backend         | ASP.NET Core Web API (.NET 9), Entity Framework Core, AutoMapper |
| Lawyers' client | React 19, TypeScript, Vite, Redux Toolkit, Material UI, Recharts |
| Admin client    | Angular 19, Angular Material, Chart.js (ng2-charts)            |
| Database        | MySQL (Pomelo EF Core provider)                                |
| File storage    | Amazon S3 (presigned upload/download URLs)                     |
| PDF parsing     | PdfPig (text extraction for the AI chat)                       |
| AI engine       | OpenAI Chat Completions (`gpt-4o-mini`)                        |
| Email           | SendGrid (lawyer invitations)                                  |
| Auth            | JWT Bearer tokens, Admin / Lawyer roles                        |
| Deployment      | Docker, Render.com                                             |

---

## 📁 Repository Structure

```plaintext
LegalTrack/
├── LagalTrackServer/              # ASP.NET Core solution (TaxManagerServer.sln)
│   ├── AaxManagerServer.API/      # Web API project: controllers, Program.cs, Dockerfile
│   ├── TaxManagerServer.Core/     # Entities, DTOs, interfaces, middleware
│   ├── TaxManagerServer.Data/     # DbContext, EF Core migrations, repositories
│   ├── TaxManagerServer.Service/  # Business logic (auth, chat, S3, email, PDF…)
│   └── Dockerfile
├── legal-track-react/             # Lawyers' application (Vite + React)
└── legal-track-angular/           # Admin application (Angular)
```

---

## ⚙️ Features

### 🧑‍💼 Lawyers' Application (React)

- **Clients** – add, edit, delete and search clients (name, email, phone).
- **Cases (folders)** – create cases linked to a client, view them in a grid, filter by client.
- **Documents** – upload PDFs to S3, view, download and delete documents per case.
- **AI legal chat** – ask questions about a case; answers are based on the text extracted from that case's documents. Chat history is saved per case.
- **Stats** – overview of cases and documents.

### 🏢 Admin Application (Angular)

- Register an office (group) with an admin account.
- Invite lawyers by email (SendGrid); invite links expire after a configurable time.
- View, edit and remove users.
- Dashboard with charts of users and activity.

---

## 🗃️ Data Model

```plaintext
Group (law firm)          User                      Client
├── Id                    ├── UserId                ├── Id
├── Name                  ├── UserName              ├── FullName
├── CreatedByUserId       ├── Email                 ├── Email
└── Users[]               ├── Password              ├── Phone
                          ├── IsAdmin               └── Folders[]
                          └── GroupId

Folder (case)             Document                  ChatMessage
├── FolderId              ├── DocumentId            ├── Id
├── FolderName            ├── DocumentName          ├── FolderId
├── ClientId              ├── FilePath (S3 key)     ├── Question
├── GroupId               ├── UploadDate            ├── Answer
├── CreatedDate           └── FolderId              └── CreatedAt
└── Documents[]

Invite
├── Id, Email, Token, GroupId, IsUsed, CreatedAt
```

---

## 🧪 API Endpoints

All routes are prefixed with `/api`. Swagger UI is available at `/swagger`.

| Area      | Endpoints |
|-----------|-----------|
| Auth      | `POST /login`, `POST /register`, `POST /register-admin` |
| Users     | `GET/POST /user`, `GET/PUT/DELETE /user/{id}`, `GET /user/{email}` |
| Invites   | `POST /invite/invite-lawyer` (Admin), `POST /invite/validate` |
| Groups    | `GET/POST /group`, `GET /group/{id}` |
| Clients   | `GET/POST /client`, `GET/PUT/DELETE /client/{id}` |
| Folders   | `GET/POST /folders`, `GET/PUT/DELETE /folders/{id}`, `GET /folders/by-client/{clientId}` |
| Documents | `GET/POST /document`, `GET/PUT/DELETE /document/{id}` |
| S3        | `POST /s3/upload`, `GET /s3/presigned-upload-url`, `GET /s3/presigned-download-url`, `GET /s3/download`, `GET /s3/list`, `POST /s3/notify-upload`, `DELETE /s3/delete` |
| Chat      | `GET /chat/{folderId}` (history), `POST /chat/{folderId}` (ask a question) |

---

## ✅ Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- Node.js 18+ and npm
- MySQL 8
- An AWS S3 bucket, an OpenAI API key and a SendGrid API key

### 1. Clone the repository

```bash
git clone https://github.com/efrat-stinberg/LegalTrack.git
cd LegalTrack
```

### 2. Configure the server

The server reads settings from `appsettings.json`, [user secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) or environment variables (use `__` instead of `:` in env var names, e.g. `JWT__Key`). Don't commit real secrets.

| Key | Description |
|-----|-------------|
| `ConnectionStrings:DefaultConnection` | MySQL connection string |
| `JWT:Key`, `JWT:Issuer`, `JWT:Audience` | JWT signing settings |
| `JWT:TokenExpirationMinutes` | Token lifetime |
| `AWS:AccessKey`, `AWS:SecretKey`, `AWS:Region`, `AWS:BucketName` | S3 storage |
| `ChatKey` | OpenAI API key |
| `SendGrid:ApiKey`, `SendGrid:SenderEmail` | Invitation emails |
| `Invite:ExpirationMinutes` | Invite link lifetime |
| `Frontend:BaseUrl` | URL of the React app (used in invite links) |

Example using user secrets:

```bash
cd LagalTrackServer/AaxManagerServer.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=legaltrack;User=root;Password=yourpassword;"
dotnet user-secrets set "JWT:Key" "a-long-random-secret-key"
```

### 3. Run the server

```bash
cd LagalTrackServer
dotnet ef database update --project TaxManagerServer.Data --startup-project AaxManagerServer.API
dotnet run --project AaxManagerServer.API
```

Or with Docker:

```bash
cd LagalTrackServer
docker build -t legaltrack-server .
docker run -p 8080:8080 --env-file .env legaltrack-server
```

### 4. Run the lawyers' app (React)

```bash
cd legal-track-react
npm install
npm run dev
```

Set `VITE_API_URL` (e.g. in `.env.local`) to point at your server. By default it uses `https://legaltrack-server.onrender.com/api`.

### 5. Run the admin app (Angular)

```bash
cd legal-track-angular
npm install
npm start
```

The API URL is set in `src/environments/environment.ts` (`apiUrl`).

---

## 🔐 Security

- JWT authentication on protected endpoints, validated on every request.
- Role-based access: admin-only actions (e.g. inviting lawyers) require the `Admin` role.
- Cases are scoped to the user's office (group).
- Files are stored in S3 and uploaded/downloaded via presigned URLs.

---

## 👩‍💻 Author

[@efrat-stinberg](https://github.com/efrat-stinberg)
