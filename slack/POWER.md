---
name: "slack"
displayName: "Slack Communication"
description: "Integrate two-way Slack communication into your workflows - send and read messages, manage channels, search conversations, and connect with your Slack App for real-time org collaboration"
keywords: ["slack", "messaging", "channels", "notifications", "communication", "collaboration", "bots", "workspace"]
author: "Slack"
---

# Onboarding

Before proceeding, validate that the user has completed the following steps before using this power.

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App**
2. Choose **From scratch**, give it a name, and select your workspace
3. Under **OAuth & Permissions**, add the necessary Bot Token Scopes (see [Configuration](#configuration) below)
4. Click **Install to Workspace** and authorize the app
5. Copy the **Bot User OAuth Token** (starts with `xoxb-`) — you will need this to authenticate

## Step 2: Connect the MCP Server

Authenticate through Kiro Powers UI when installing this power, using the Bot User OAuth Token obtained in Step 1.

# Overview

Integrate real-time, two-way Slack communication into your AI-assisted workflows. This power connects to your Slack workspace via a Slack App, enabling you to send messages, read channel history, search conversations, manage channels, and respond to events programmatically.

Use this power to send automated notifications when deployments complete, surface errors from your observability stack directly into Slack, build interactive bots, or query conversation history for context during debugging.

**Key capabilities:**

- **Send Messages**: Post messages to channels or users, with Markdown formatting and Block Kit attachments
- **Read Messages**: Retrieve channel history and thread replies for context
- **Search**: Full-text search across messages, files, and channels in your workspace
- **Channel Management**: List, create, archive, and manage channels and members
- **User Lookup**: Resolve user IDs, display names, and profile information
- **Reactions**: Add emoji reactions to messages
- **Two-Way Communication**: Listen for and respond to messages through your Slack App bot

**Authentication**: Requires a Slack Bot User OAuth Token (`xoxb-...`) from a Slack App installed in your workspace.

## Available MCP Servers

### slack

**Connection:** SSE endpoint at `https://mcp.slack.com/sse`
**Authorization:** Use OAuth to connect to the Slack MCP server

**Key tools:**

- `slack_post_message` – Send a message to a channel or user
- `slack_reply_to_thread` – Reply to a message thread
- `slack_get_channel_history` – Retrieve recent messages from a channel
- `slack_get_thread_replies` – Get all replies in a message thread
- `slack_search_messages` – Full-text search across workspace messages
- `slack_list_channels` – List public channels in the workspace
- `slack_create_channel` – Create a new channel
- `slack_invite_to_channel` – Add users to a channel
- `slack_get_users` – List workspace members
- `slack_get_user_profile` – Get a user's profile details
- `slack_add_reaction` – React to a message with an emoji

## Common Workflows

### Workflow 1: Send a Deployment Notification

```javascript
// Post a formatted message to a channel when a deployment finishes
slack_post_message({
  channel: "#deployments",
  text: ":rocket: *Production deployment complete*\nVersion `v2.4.1` deployed successfully.",
})
```

### Workflow 2: Surface an Error Alert

```javascript
// Search for recent error messages and forward them to an alerts channel
const results = slack_search_messages({
  query: "error in:#backend-logs",
  count: 5,
})

slack_post_message({
  channel: "#on-call",
  text: `Found ${results.messages.total} recent errors:\n${results.messages.matches.map(m => `• ${m.text}`).join("\n")}`,
})
```

### Workflow 3: Read Channel History for Context

```javascript
// Retrieve the last 20 messages from a channel for context
const history = slack_get_channel_history({
  channel: "C0123456789", // Channel ID
  limit: 20,
})

// Process history.messages for relevant context
```

### Workflow 4: Reply in a Thread

```javascript
// Reply to an existing message thread
slack_reply_to_thread({
  channel: "C0123456789",
  thread_ts: "1234567890.123456", // Timestamp of the parent message
  text: "I've investigated the issue — the root cause was a misconfigured env variable.",
})
```

### Workflow 5: Create a Channel and Invite Users

```javascript
// Create a new incident channel and add relevant team members
const channel = slack_create_channel({ name: "incident-2024-09-15" })

slack_invite_to_channel({
  channel: channel.id,
  users: ["U0123ALICE", "U0456BOBBY"],
})

slack_post_message({
  channel: channel.id,
  text: ":rotating_light: Incident channel created. Please triage the issue.",
})
```

## Best Practices

### Message Formatting

- Use [Block Kit](https://api.slack.com/block-kit) for rich, interactive messages (buttons, dropdowns, sections)
- Use `mrkdwn` formatting (`*bold*`, `_italic_`, `` `code` ``, `>blockquote`) in text fields
- Keep messages concise; use threads for follow-up details
- Always include context (environment, version, timestamp) in automated notifications

### Channel Strategy

- Use dedicated channels for automated notifications (e.g., `#deployments`, `#alerts`, `#incidents`)
- Avoid posting to `#general` from bots — prefer purpose-specific channels
- Archive channels when incidents or projects are resolved

### Rate Limits

- Slack enforces [Tier-based rate limits](https://api.slack.com/docs/rate-limits); most methods allow 1 request/second
- Use `slack_search_messages` instead of looping through history for large-scale lookups
- Batch user lookups with `slack_get_users` instead of individual `slack_get_user_profile` calls

### Tokens and Security

- **Never commit** Bot User OAuth Tokens to source control
- Store tokens in environment variables or your secrets manager
- Grant only the minimum required OAuth scopes
- Rotate tokens immediately if they are ever exposed

### Two-Way Communication

- Use [Slack Event Subscriptions](https://api.slack.com/events-api) in your Slack App to receive incoming messages and react to them
- Use [Slash Commands](https://api.slack.com/interactivity/slash-commands) to trigger actions from within Slack
- Use [Interactive Components](https://api.slack.com/interactivity) (buttons, modals) for approval workflows or user confirmations

## Configuration

**Authentication Required**: Slack Bot User OAuth Token (`xoxb-...`)

**Required Bot Token Scopes** (add under *OAuth & Permissions* in your app settings):

| Scope | Purpose |
|---|---|
| `channels:history` | Read messages in public channels |
| `channels:read` | List public channels |
| `channels:write` | Create and archive channels |
| `chat:write` | Send messages as the bot |
| `groups:history` | Read messages in private channels |
| `groups:read` | List private channels the bot is in |
| `im:history` | Read direct message history |
| `im:write` | Send direct messages |
| `reactions:write` | Add emoji reactions |
| `search:read` | Search messages and files |
| `users:read` | Look up user profiles |

**Setup Steps:**

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Add the required Bot Token Scopes listed above
3. Install the app to your workspace
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Configure the token in Kiro Powers UI when installing this power

**MCP Configuration:**

```json
{
  "mcpServers": {
    "slack": {
      "url": "https://mcp.slack.com/sse"
    }
  }
}
```

## Troubleshooting

### Error: "not_authed" or "invalid_auth"

**Cause:** Missing or invalid Bot User OAuth Token
**Solution:**

1. Verify the token starts with `xoxb-`
2. Reinstall the Slack App to your workspace to regenerate the token
3. Ensure the token is correctly configured in the MCP server settings

### Error: "missing_scope"

**Cause:** The bot token lacks the required OAuth scope for the requested action
**Solution:**

1. Go to your app at [api.slack.com/apps](https://api.slack.com/apps)
2. Under **OAuth & Permissions**, add the missing scope (see table above)
3. Reinstall the app to your workspace to apply the new scope

### Error: "channel_not_found"

**Cause:** The channel ID or name is invalid, or the bot is not a member
**Solution:**

1. Use `slack_list_channels` to retrieve valid channel IDs
2. Invite the bot to the channel: `/invite @your-bot-name` in Slack
3. For private channels, ensure the bot has been explicitly invited

### Error: "not_in_channel"

**Cause:** The bot is trying to post to a channel it has not been added to
**Solution:**

1. Invite the bot to the channel using `slack_invite_to_channel` or `/invite @your-bot-name`
2. For public channels, the bot can join automatically if `channels:join` scope is granted

### Messages not received (two-way communication)

**Cause:** Event Subscriptions are not configured in the Slack App
**Solution:**

1. In your app settings, go to **Event Subscriptions** and enable events
2. Subscribe to `message.channels`, `message.groups`, or `message.im` as needed
3. Set your request URL to your bot's publicly accessible endpoint
4. Verify the endpoint responds with the Slack challenge token during verification

### Rate limit errors (HTTP 429)

**Cause:** Too many API requests in a short period
**Solution:**

1. Implement exponential backoff and retry logic
2. Reduce polling frequency; prefer Event Subscriptions over repeated history fetches
3. Review [Slack rate limit tiers](https://api.slack.com/docs/rate-limits) for method-specific limits

## Resources

- [Slack API Documentation](https://api.slack.com/)
- [Block Kit Builder](https://app.slack.com/block-kit-builder)
- [OAuth Scopes Reference](https://api.slack.com/scopes)
- [Event Subscriptions](https://api.slack.com/events-api)
- [Slash Commands](https://api.slack.com/interactivity/slash-commands)
- [Interactive Components](https://api.slack.com/interactivity)
- [Rate Limits](https://api.slack.com/docs/rate-limits)
- [Slack MCP Server](https://mcp.slack.com)

---

**License:** Proprietary
