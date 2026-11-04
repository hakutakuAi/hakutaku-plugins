# Claude (claude.ai, Claude Desktop, Cowork)

Sources: [Custom connectors](https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp), [Skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude).

## Connect

1. Customize > Connectors > **+ Add** > **Add custom connector**.
2. Name `Hakutaku`, URL `https://app.hakutaku.ai/api/mcp`, Continue.
3. Keep the detected OAuth sign-in, click Add, then Connect and approve on the Hakutaku page.

Team and Enterprise: an Owner adds it once under Organization settings > Connectors (Add > Custom > Web); each member then clicks Connect to sign in as themselves. Free plans allow one custom connector.

After the first connection the server asks Claude to save a short Hakutaku note to its memory; that note is what makes later chats use your brain without asking.

## Skills (optional)

The core skill works in Claude chats too. Zip the `skills/hakutaku` folder (the folder itself at the root of the zip) and upload it under Customize > Skills > + > Upload. `hakutaku-grill` is meant to be typed by you; claude.ai has no user-only switch, so upload it only if you want Claude to offer it.
