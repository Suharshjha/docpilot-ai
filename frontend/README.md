<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project. -->

DocPilot AI — Intelligent Document Processing & RAG Copilot
DocPilot AI is a modern, secure, full-stack document intelligence platform. It enables enterprise users to upload PDF documents (invoices, resumes, purchase orders, contracts), automatically extract text using optical character recognition (OCR), parse raw text into structured database schemas using Large Language Models (LLMs), audit data through a human-in-the-loop workflow, and query document context semantically using an AI Copilot chat workspace.

🚀 Key Features
Asynchronous OCR Pipeline: Process scanned documents in the background using an asynchronous processing queue (Tess4J and Apache PDFBox) without blocking request threads.
LLM Metadata Parsing: Automatic schema-based extraction powered by Google Gemini, parsing plain texts into structured fields (vendor name, invoice number, tax registration, amounts, currencies, due dates, categories, and summaries).
Human-in-the-Loop Audit Panel: A side-by-side details workspace highlighting field extraction confidence levels. Low-confidence extractions trigger a NEEDS_REVIEW state, allowing manual updates and auditor approval/rejection.
AI Copilot RAG Chat: An interactive chat dashboard utilizing sliding-window text chunking (500-char blocks), Gemini Embeddings (text-embedding-004), and Pinecone vector databases to query document context with deep-linked source citations.
Audit Trail Traceability: Chronological security logs logging all authentication events, document operations, AI extractions, manual auditor overrides, and source IP addresses.
Docker Production Architecture: Containerized using Docker Compose, linking MySQL, Spring Boot (with preinstalled Tesseract packages), and Nginx reverse proxies serving frontend assets and routing API requests internally.
🛠️ Technology Stack
Backend: Spring Boot 3.3.1, Java 17, Hibernate JPA, Spring Security (JWT), Tess4J (Tesseract OCR), Google Gemini REST Integrations.
Frontend: React 18, Vite, Material UI (MUI) v5, Axios, React Router Dom.
Database: MySQL 8.0, Pinecone Vector Database (or offline local in-memory cosine similarity fallback).
DevOps: Docker Compose, Nginx.
📂 Project Structure
text

docpilot-ai/
├── backend/ # Spring Boot Maven application
│ ├── src/ # Java source files and configurations
│ ├── Dockerfile # Backend Docker configuration (JRE + Tesseract installation)
│ └── pom.xml # Maven dependencies
├── frontend/ # React Single Page Application (SPA)
│ ├── src/ # React pages, layouts, and API services
│ ├── nginx.conf # Production Nginx reverse-proxy configuration
│ └── Dockerfile # Frontend Docker configuration (Node build + Nginx host)
├── docker-compose.yml # Multi-container orchestration config
├── .env.example # Environment variables template
└── README.md # Project documentation
⚙️ Getting Started
📋 Prerequisites
Ensure you have the following installed locally:

Java SDK 17 and Maven 3.8+
Node.js v20+
MySQL Server
Tesseract OCR Engine (Add Tesseract to your system environment variables and path)

1. Backend Setup (backend/)
   Create a MySQL database named docpilot_db.
   Configure your properties in backend/src/main/resources/application.yml or set the following environment variables:
   env

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/docpilot_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_mysql_password
GEMINI_API_KEY=your_google_gemini_api_key
APP_OCR_TESSDATA_PATH=C:/Program Files/Tesseract-OCR/tessdata # Path to your local tessdata
Run the Spring Boot application:
bash

cd backend
mvn spring-boot:run
The backend will be running on http://localhost:8080. 2. Frontend Setup (frontend/)
Install Node modules:
bash

cd frontend
npm install
Run the Vite development server:
bash

npm run dev
The frontend will be running on http://localhost:5173.
