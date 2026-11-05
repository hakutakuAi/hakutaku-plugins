# Listing copy

Shared by every directory form. Assets: icon `assets/icon.png` (512 x 512) and `assets/icon-192.png`; public URLs below.

| Field | Value |
| --- | --- |
| Name | Hakutaku |
| Server URL | https://app.hakutaku.ai/api/mcp (Streamable HTTP, OAuth 2.1 with DCR and CIMD, PKCE S256) |
| Website | https://hakutaku.ai |
| Documentation | https://github.com/hakutakuAi/hakutaku-plugins#readme |
| Support | https://github.com/hakutakuAi/hakutaku-plugins/issues · haku@hakutaku.ai |
| Privacy policy | https://app.hakutaku.ai/privacy (pt-BR: https://app.hakutaku.ai/privacidade) |
| Terms of service | https://app.hakutaku.ai/terms-of-service (pt-BR: https://app.hakutaku.ai/termos-de-servico) |
| Category | Productivity / Knowledge |
| Publisher | Hakutaku Soluções em Gestão de Dados Ltda. (author: João Vitor Ribeiro de Lima) |
| Icon | https://raw.githubusercontent.com/hakutakuAi/hakutaku-plugins/main/assets/icon.png |

## Short description (≤ 100 characters)

- en: Your second brain: documents, meetings, decisions, tables, agents and connected apps.
- pt-BR: Seu segundo cérebro: documentos, reuniões, decisões, tabelas, agentes e apps conectados.

## Long description

**en**

Hakutaku is your second brain. Connect it and your assistant searches your own documents, meetings, decisions, people and tasks before it answers about your work; saves what you decide or produce so you find it later from any AI tool; answers with numbers from your own spreadsheets and app data, joining two sources when needed; reads and acts in your connected apps (mail, calendar, CRM and more), always asking before it sends, posts or deletes anything; and hands long work to your Hakutaku agents, such as deep research with sources. Everything runs as you, with your Hakutaku permissions, and what is saved stays private to you unless you share it.

**pt-BR**

O Hakutaku é o seu segundo cérebro. Conecte e o seu assistente busca nos seus documentos, reuniões, decisões, pessoas e tarefas antes de responder sobre o seu trabalho; salva o que você decide ou produz para você encontrar depois em qualquer ferramenta de IA; responde com números das suas planilhas e dados de apps, cruzando duas fontes quando precisa; lê e age nos seus apps conectados (e-mail, agenda, CRM e outros), sempre pedindo antes de enviar, publicar ou apagar algo; e passa trabalhos longos para os seus agentes Hakutaku, como pesquisa aprofundada com fontes. Tudo roda como você, com as suas permissões, e o que é salvo fica privado até você compartilhar.

## Example prompts

1. What did we decide about the warehouse scanner database, and why?
2. Using my orders export and my customers table, what did the South region buy in October?
3. Save this decision: we move invoice retries to a queue, max 6 attempts.
4. Which apps and document sources are connected to my brain?
5. Research the main cold-chain monitoring vendors in Brazil, with sources.

## Data handling (for review forms)

- Data accessed: only what the signed-in member may read in their Hakutaku organization (their documents, meetings, graph facts, tasks, memories, connected-app data they connected).
- Data written: documents, memories and tasks the member asks to keep, private by default; outward actions (mail, messages, app writes, deletions, spending) only after the member confirms.
- No data is used to train models. Processing and retention follow the privacy policy above (LGPD).
- Authentication: OAuth 2.1; tokens scoped `mcp:read`, `mcp:act`, `mcp:write`; revocable in Hakutaku Settings.
