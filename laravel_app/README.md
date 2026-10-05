# KnowledgeBot - PHP Laravel + MySQL Implementation

A lightweight, high-performance PHP & MySQL implementation of the AI-Powered Knowledge Chatbot, matching the exact UI designs from your uploaded images:
- **Image 1**: Mobile / Card Chatbot Interface with the KnowledgeBot avatar, user bubble, and `Source: Account_Security.pdf` citation badge.
- **Image 2**: Admin Console Ingestion Pipeline: `[Upload Document] -> [Embedding Model] -> [Vector Database] -> [Knowledge Base Index]`.

---

## 🛠️ Requirements & Tech Stack
- **Web Server & Runtime**: PHP 8.2+ (Using XAMPP `C:\xampp\php\php.exe`)
- **Database**: MySQL (Using XAMPP `C:\xampp\mysql\bin\mysqld.exe` on port 3306)
- **Frontend**: Clean Tailwind CSS + Vanilla JS (No npm build needed, runs instantly!)

---

## 🚀 Quick Setup with XAMPP

### 1. Ensure MySQL is Running
In XAMPP Control Panel, ensure the **MySQL** module is started (Port 3306).

### 2. Database Creation & Schema Import
The schema file `database/schema.sql` automatically creates the `knowledge_chatbot` database, tables, and pre-seeds the knowledge base (including `Account_Security.pdf`).

In PowerShell:
```powershell
Get-Content "laravel_app/database/schema.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root knowledge_chatbot
```

### 3. Start the PHP Web Application
Simply double-click or run:
```powershell
laravel_app\run_server.bat
```
Or run directly:
```powershell
& "C:\xampp\php\php.exe" -S 127.0.0.1:8080 -t "laravel_app/public"
```

---

## 🌐 Navigating the Web Interfaces

| Interface | URL | Screenshot Match | Description |
| :--- | :--- | :--- | :--- |
| **Chat Widget** | `http://127.0.0.1:8080/` | **Image 1** | Clean mobile phone frame displaying KnowledgeBot responses with `Source: Account_Security.pdf` citations. |
| **Admin Console** | `http://127.0.0.1:8080/admin` | **Image 2** | Dashboard with the 4-step vector ingestion pipeline cards and document manager. |

---

## 📡 REST API Reference

- `POST /api/chat`: Process query, calculate vector similarity, return answer with citations.
  ```json
  // Request
  { "query": "How do I reset my password?" }

  // Response
  {
    "answer": "According to the \"Account Security\" document, you can reset your password by clicking the \"Forgot Password\" link on the login page and following the instructions sent to your registered email.",
    "source_doc": "Account_Security.pdf",
    "source_chunk": 0,
    "confidence_score": 0.28,
    "in_scope": true
  }
  ```
- `GET /api/admin/stats`: Get total documents, chunks, and message counts from MySQL.
- `POST /api/admin/upload`: Ingest new text/PDF document into MySQL and chunk without retraining.
- `POST /api/admin/delete?id={id}`: Prune a document and its chunks from MySQL.
