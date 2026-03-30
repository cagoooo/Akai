import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import admin from "firebase-admin";

// Initialize Firebase using Application Default Credentials
admin.initializeApp({
  // Project ID is optionally passed via GCLOUD_PROJECT env var or inferred automatically
});

const db = admin.firestore();

// Create the MCP server instance
const server = new McpServer({
  name: "firebase-lite-mcp-server",
  version: "1.0.0",
});

// Tool 1: get_document
server.tool(
  "get_document",
  "取得指定路徑的 Firestore 檔案",
  { path: z.string().describe("檔案的完整路徑，例如：users/alovelace") },
  async ({ path }) => {
    try {
      const doc = await db.doc(path).get();
      if (!doc.exists) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Document not found" }) }] };
      }
      return { content: [{ type: "text", text: JSON.stringify({ id: doc.id, ...doc.data() }) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

// Tool 2: query_collection
server.tool(
  "query_collection",
  "查詢特定集合下的文件",
  {
    collection_path: z.string().describe("集合的完整路徑，例如：users"),
    limit: z.number().optional().describe("查詢結果最大數量，預設10"),
  },
  async ({ collection_path, limit = 10 }) => {
    try {
      const snapshot = await db.collection(collection_path).limit(limit).get();
      const results = [];
      snapshot.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

// Tool 3: add_document
server.tool(
  "add_document",
  "新增一份文件到指定的集合中",
  {
    collection_path: z.string().describe("集合路徑，例如：users"),
    document_data: z.string().describe("要新增的 JSON 字串資料"),
  },
  async ({ collection_path, document_data }) => {
    try {
      const data = JSON.parse(document_data);
      const res = await db.collection(collection_path).add(data);
      return { content: [{ type: "text", text: JSON.stringify({ success: true, id: res.id }) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

// Tool 4: update_document
server.tool(
  "update_document",
  "更新特定已存在的 Firestore 文件",
  {
    document_path: z.string().describe("文件路徑，例如：users/alovelace"),
    document_data: z.string().describe("要更新的 JSON 字串資料"),
  },
  async ({ document_path, document_data }) => {
    try {
      const data = JSON.parse(document_data);
      await db.doc(document_path).set(data, { merge: true });
      return { content: [{ type: "text", text: JSON.stringify({ success: true, path: document_path }) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

// Tool 5: delete_document
server.tool(
  "delete_document",
  "刪除指定的 Firestore 文件",
  {
    document_path: z.string().describe("文件路徑，例如：users/alovelace"),
  },
  async ({ document_path }) => {
    try {
      await db.doc(document_path).delete();
      return { content: [{ type: "text", text: JSON.stringify({ success: true, path: document_path }) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

// Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log message strictly to stderr so we don't pollute MCP stdio transport
  console.error("Firebase Lite MCP Server started successfully.");
}

run().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
