# Medplum MCP Server

## 🚀 Project Description

This project implements a **complete Model Context Protocol (MCP) server** designed to seamlessly interact with a Medplum FHIR server. The MCP server provides a standardized interface, enabling Large Language Models (LLMs) to perform Create, Read, Update, Delete, and Search (CRUDS) operations on **ALL** FHIR resources and Medplum-specific resources through a comprehensive suite of tools. This empowers users to manage healthcare data stored in Medplum using natural language commands through any MCP-compatible client (Claude Desktop, VS Code MCP extensions, etc.).

The server implements the full MCP protocol specification, providing dynamically generated tools for every resource type supported by Medplum (over 140 types), plus specialized tools for transactions, binary uploads, authentication, and admin operations.

## ✨ Current Status

🎉 **MCP Server Implementation Complete!** 🎉

**What's Implemented:**
- ✅ **Complete Medplum API Coverage**: Generic CRUD tools for all 140+ Medplum/FHIR resources (Patient, Practitioner, Project, Bot, ClientApplication, etc.)
- ✅ **Specialized Tools**:
    - **Transaction/Batch**: `postBundle` for executing FHIR bundles.
    - **Binary**: `createBinary` and `getBinaryById` for handling attachments.
    - **Auth**: `whoAmI`, `logout`.
    - **Admin**: `inviteUser`, `addProjectSecret` for project management.
    - **Operations**: `validateResource`, `expandValueSet`, `lookupCode`, `validateCode`.
    - **Patch**: `patchResource` for partial updates using JSON Patch.
- ✅ **MCP Server Protocol Implementation** - Full Model Context Protocol server with stdio transport
- ✅ Comprehensive tool schemas for LLM interaction
- ✅ **Interactive Chat Harness** - Full MCP client with natural language interface
- ✅ Jest integration tests for generic and specific tools
- ✅ Medplum FHIR server connectivity and authentication
- ✅ MCP Inspector testing and validation
- ✅ Claude Desktop integration configuration

## 🌟 Features Implemented

The MCP server currently supports tools for **all Medplum resources**.

### 🛠️ **Generic Resource Management**
For every resource type (e.g., `Patient`, `Project`, `Bot`, `AccessPolicy`), the following tools are available:
*   `create<Resource>`: Create a new resource.
*   `get<Resource>ById`: Retrieve a resource by ID.
*   `update<Resource>`: Update an existing resource.
*   `delete<Resource>`: Delete a resource.
*   `search<Resource>s`: Search for resources.

### 🧪 **Specific Domain Tools**
Specific tools with enhanced logic are available for core clinical resources:
*   **Patient**: `createPatient`, `searchPatients`, etc.
*   **Practitioner**: `createPractitioner`, `searchPractitioners`, etc.
*   **Organization**: `createOrganization`, `searchOrganizations`, etc.
*   **Encounter**: `createEncounter`, `searchEncounters`, etc.
*   **Observation**: `createObservation`, `searchObservations`, etc.
*   **Medication**: `createMedication`, `searchMedications`, etc.
*   **MedicationRequest**: `createMedicationRequest`, `searchMedicationRequests`, etc.
*   **EpisodeOfCare**: `createEpisodeOfCare`, `searchEpisodesOfCare`, etc.
*   **Condition**: `createCondition`, `searchConditions`, etc.

### ⚙️ **Advanced Operations**
*   **Transactions**: `postBundle` (Execute a FHIR transaction/batch bundle).
*   **Binary**: `createBinary`, `getBinaryById` (Upload/Download files).
*   **Authentication**: `whoAmI` (Current user info), `logout`.
*   **Admin**:
    *   `inviteUser`: Invite users to projects with detailed control (admin access, scope, etc.).
    *   `addProjectSecret`: Securely add or update project secrets.
*   **Validation**: `validateResource` (Validate resource content).
*   **Terminology**: `expandValueSet`, `lookupCode`, `validateCode`.
*   **Patch**: `patchResource` (Advanced partial updates).
*   **General Search**: `generalFhirSearch` (Advanced search across any resource).

## 🛠️ Technology Stack

*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **FHIR Server Interaction**: `@medplum/core`, `@medplum/fhirtypes`
*   **LLM Integration**: OpenAI API (specifically `gpt-4o` in the test harness)
*   **Testing**: Jest (for integration tests), Manual E2E via test harness
*   **Linting & Formatting**: ESLint, Prettier
*   **Environment Management**: `dotenv`
*   **HTTP Client (for Medplum SDK)**: `node-fetch`

## 📁 Project Structure

```
medplum-mcp/
├── src/                  # Source code
│   ├── config/           # Medplum client configuration (medplumClient.ts)
│   ├── tools/            # FHIR resource utility functions
│   │   ├── genericResourceTool.ts # Generic CRUD implementation
│   │   ├── toolRegistry.ts        # Dynamic tool registration
│   │   ├── patientUtils.ts        # Specific patient logic
│   │   ├── transactionUtils.ts    # Transaction support
│   │   ├── binaryUtils.ts         # Binary support
│   │   ├── authUtils.ts           # Auth support
│   │   ├── adminUtils.ts          # Admin support
│   │   ├── operationsUtils.ts     # Operations support
│   │   └── ...
│   ├── index.ts          # Main application entry point
│   ├── llm-test-harness.ts # Script for testing LLM tool calling
│   └── test-connection.ts  # Script for basic Medplum connection test
├── tests/                # Test suites
│   └── integration/      # Jest integration tests for tools
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── .prettierignore
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Setup and Configuration

1.  **Prerequisites**:
    *   Node.js (refer to `package.json` for engine specifics; LTS versions recommended)
    *   A running Medplum server instance (e.g., local Dockerized instance at `http://localhost:8103/`)
    *   Medplum client credentials (Client ID and Client Secret)

2.  **Installation**:
    ```bash
    git clone https://github.com/rkirkendall/medplum-mcp.git
    cd medplum-mcp
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the project root with your specific Medplum server details and API keys:
    ```dotenv
    MEDPLUM_BASE_URL=http://your-medplum-server-url/
    MEDPLUM_CLIENT_ID=your_client_id
    MEDPLUM_CLIENT_SECRET=your_client_secret
    OPENAI_API_KEY=your_openai_api_key # Required for llm-test-harness.ts
    ```

## 🚀 Usage

### 💬 Interactive Chat Harness (Recommended)
The most user-friendly way to test your MCP server is through the interactive chat interface:

```bash
# Build and run the chat harness
npm run chat

# Or in development mode
npx ts-node src/llm-test-harness.ts
```

### ▶️ Running the MCP Server Directly
```bash
npm start # Runs the MCP server with stdio transport
npm run dev # Development mode with live reloading
```

### 🧪 Alternative Testing Methods
```bash
# MCP Inspector (web-based tool testing)
npx @modelcontextprotocol/inspector node dist/index.js
```

## ✅ Testing
### 🔗 Integration Tests
Integration tests use Jest and interact with a live Medplum instance (configured via `.env`).

To run all integration tests:
```bash
npx jest tests/integration
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
