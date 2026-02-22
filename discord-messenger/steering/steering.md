---
inclusion: always
---

# Discord Integration Best Practices

## Authentication

Always use Bot Tokens (format: `Bot <token>`) for Discord API access. Never commit tokens to source control — store them as environment variables or in a secrets manager. Rotate tokens immediately if exposed. Grant only the minimum required bot permissions following the principle of least privilege.

## Sending Messages

- Prefer sending to channel IDs (e.g., `1234567890123456789`) over channel names for reliability
- Use Discord markdown formatting (`**bold**`, `*italic*`, `` `code` ``, ` ```code blocks``` `) for text styling
- Use embeds for rich formatted content with titles, descriptions, fields, colors, and images
- Keep message content under 2000 characters; use embeds or multiple messages for longer content

## Threads

- Reply in threads to keep channels organized, especially for incident updates or multi-step workflows
- Use `discord_create_thread` to start a new thread from a message for focused discussions
- Use `discord_reply_to_thread` with the thread ID to continue conversations
- Set appropriate `auto_archive_duration` to manage thread lifecycle

## Channel Management

- Always ensure the bot has access to channels before posting (invite bot to private channels explicitly)
- Use dedicated channels for automated messages (e.g., `#deployments`, `#alerts`, `#incidents`) — avoid `#general`
- Use channel types appropriately: text channels for discussions, announcement channels for one-way broadcasts
- Archive or delete channels when their purpose has been fulfilled to keep the server organized

## Searching

- Use `discord_search_messages` with targeted queries instead of iterating through channel history for large-scale lookups
- Combine filters: `channel_id`, `author_id`, and `limit` to narrow results efficiently
- Search is more efficient than pagination for finding specific messages across multiple channels

## Rate Limits

- Discord API uses per-route rate limits; most endpoints allow 5 requests per 5 seconds
- Implement exponential backoff when receiving HTTP 429 responses with `Retry-After` header
- Use Discord Gateway events instead of polling channel history for real-time updates
- Batch operations when possible to reduce API calls

## Two-Way Communication

- Use [Discord Gateway](https://discord.com/developers/docs/topics/gateway) WebSocket connection to receive messages and events in real-time
- Acknowledge all interactions within 3 seconds; use deferred responses for slow processing
- Use [Slash Commands](https://discord.com/developers/docs/interactions/application-commands) to let users trigger actions from Discord
- Use [Interaction Components](https://discord.com/developers/docs/interactions/message-components) (buttons, select menus, modals) for approval flows or structured input

## Error Handling

- Handle `Missing Permissions`: ensure bot has required permissions in the channel or guild, update bot role permissions
- Handle `Unknown Channel`: verify channel ID exists and bot has access, catch error and notify gracefully
- Handle `Unknown User`: verify user ID exists in the guild before operations
- Handle `Rate Limited`: respect the `Retry-After` header and implement exponential backoff
- Log Discord API errors with the full error code and details for easier debugging
