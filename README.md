# Medplum MCP Server

## 🚀 Project Description

This project implements a **complete Model Context Protocol (MCP) server** designed to seamlessly interact with a Medplum FHIR server. The MCP server provides a standardized interface, enabling Large Language Models (LLMs) to perform Create, Read, Update, Delete, and Search (CRUDS) operations on **ALL** FHIR resources and Medplum-specific resources through a comprehensive suite of tools. This empowers users to manage healthcare data stored in Medplum using natural language commands through any MCP-compatible client (Claude Desktop, VS Code MCP extensions, etc.).

The server implements the full MCP protocol specification, providing dynamically generated tools for every resource type supported by Medplum (over 140 types), plus specialized tools for transactions, binary uploads, authentication, project administration, and **Super Admin** instance management.

## ✨ Current Status

🎉 **MCP Server Implementation Complete!** 🎉

**What's Implemented:**
- ✅ **Complete Medplum API Coverage**: Generic CRUD tools for all 140+ Medplum/FHIR resources.
- ✅ **Specialized Tools**:
    - **Transaction/Batch**: `postBundle`.
    - **Binary**: `createBinary`, `getBinaryById`.
    - **Auth**: `whoAmI`, `logout`.
    - **Project Admin**: `inviteUser`, `addProjectSecret`.
    - **Super Admin**: `reindexResources`, `rebuildCompartments`, `purgeResources`, `forceSetPassword`.
    - **Operations**: `validateResource`, `expandValueSet`, `lookupCode`, `validateCode`.
    - **Patch**: `patchResource`.
- ✅ **MCP Server Protocol Implementation** - Full Model Context Protocol server with stdio transport
- ✅ Comprehensive tool schemas for LLM interaction
- ✅ **Interactive Chat Harness** - Full MCP client with natural language interface
- ✅ Jest integration tests for generic and specific tools
- ✅ Medplum FHIR server connectivity and authentication
- ✅ MCP Inspector testing and validation
- ✅ Claude Desktop integration configuration

## 🌟 Features Implemented

### 🛠️ **Generic Resource Management**
For every resource type (e.g., `Patient`, `Project`, `Bot`, `AccessPolicy`, `DomainConfiguration`), the following tools are available:
*   `create<Resource>`: Create a new resource.
*   `get<Resource>ById`: Retrieve a resource by ID.
*   `update<Resource>`: Update an existing resource.
*   `delete<Resource>`: Delete a resource.
*   `search<Resource>s`: Search for resources.

### 🧪 **Specific Domain Tools**
Specific tools with enhanced logic are available for core clinical resources: `Patient`, `Practitioner`, `Organization`, `Encounter`, `Observation`, `Medication`, `MedicationRequest`, `EpisodeOfCare`, `Condition`.

### ⚙️ **Advanced & Admin Operations**
*   **Transactions**: `postBundle` (Execute a FHIR transaction/batch bundle).
*   **Binary**: `createBinary`, `getBinaryById` (Upload/Download files).
*   **Authentication**: `whoAmI` (Current user info), `logout`.
*   **Project Admin**:
    *   `inviteUser`: Invite users to projects with detailed control (admin access, scope, etc.).
    *   `addProjectSecret`: Securely add or update project secrets.
*   **Super Admin** (Instance Management):
    *   `reindexResources`: Reindex resources for search.
    *   `rebuildCompartments`: Rebuild resource compartments.
    *   `purgeResources`: Permanently delete resources (e.g., old AuditEvents).
    *   `forceSetPassword`: Forcefully set a user's password.
*   **Validation**: `validateResource` (Validate resource content).
*   **Terminology**: `expandValueSet`, `lookupCode`, `validateCode`.
*   **Patch**: `patchResource` (Advanced partial updates).
*   **General Search**: `generalFhirSearch` (Advanced search across any resource).

## 🛠️ Technology Stack

*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **FHIR Server Interaction**: `@medplum/core`, `@medplum/fhirtypes`
*   **LLM Integration**: OpenAI API
*   **Testing**: Jest
*   **Linting & Formatting**: ESLint, Prettier

## 📁 Project Structure

```
medplum-mcp/
├── src/                  # Source code
│   ├── config/           # Medplum client configuration
│   ├── tools/            # FHIR resource utility functions
│   │   ├── genericResourceTool.ts # Generic CRUD implementation
│   │   ├── toolRegistry.ts        # Dynamic tool registration
│   │   ├── adminUtils.ts          # Project Admin support
│   │   ├── superAdminUtils.ts     # Super Admin support
│   │   └── ...
│   ├── index.ts          # Main application entry point
│   ├── llm-test-harness.ts # Script for testing LLM tool calling
│   └── test-connection.ts  # Script for basic Medplum connection test
├── tests/                # Test suites
│   └── integration/      # Jest integration tests
├── ...
└── README.md
```

## ⚙️ Setup and Configuration

1.  **Prerequisites**: Node.js, Medplum server instance, Medplum client credentials.
2.  **Installation**: `npm install`
3.  **Environment Variables**: Create `.env` with `MEDPLUM_BASE_URL`, `MEDPLUM_CLIENT_ID`, `MEDPLUM_CLIENT_SECRET`.

## 🚀 Usage

### 💬 Interactive Chat Harness
```bash
npm run chat
```

### ▶️ Running the MCP Server
```bash
npm start # Runs the MCP server with stdio transport
npm run dev # Development mode
```

## ✅ Testing
```bash
npx jest tests/integration
```

## 📄 License
MIT License
