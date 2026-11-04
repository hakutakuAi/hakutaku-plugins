# ChatGPT

Source: [Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt).

## Connect

1. Open [chatgpt.com/plugins](https://chatgpt.com/plugins), select **+**, then **Add custom MCP server**.
2. Name `Hakutaku`, description "My second brain: documents, meetings, decisions, tables, agents and apps".
3. Connection: public endpoint `https://app.hakutaku.ai/api/mcp`.
4. Authentication: OAuth (ChatGPT discovers it; Hakutaku supports client metadata documents and dynamic registration). Confirm, then **Create as a plugin** and sign in on the Hakutaku page.

Workspace policies apply: on Business and Enterprise an admin may need to allow custom MCP servers.

ChatGPT reads the tools' annotations: reads run directly; anything that writes asks you first, and Hakutaku itself refuses outward actions (send, post, delete, spend) until you confirm.

Right after connecting, ask: "Save the Hakutaku usage note to your memory." The server returns a short note; with memory on, ChatGPT keeps it for later chats.
