---
inclusion: always
---

# Discord Integration Best Practices

## Authentication

Always use Bot Tokens for server-side Discord API access. Never commit tokens to source control — store them as environment variables or in a secrets manager. Rotate tokens immediately if they are ever exposed.

## Sending Messages

- Prefer sending to channel IDs over channel names for reliability when IDs are available
- Use [Discord Markdown](https://support.discord.com/hc/en-us/articles/210298617) for formatting: `**bold**`, `*italic*`, `` `code` ``, ` ```code blocks``` `
- Keep automated messages concise; include context (environment, version, timestamp) in notifications
- Avoid mentioning `@everyone` or `@here` from bots — use role or user mentions only when action is required

## Threads and Forum Posts

- Use forum channels for structured, ongoing discussions (e.g., feature requests, incident post-mortems)
- Reply to existing forum posts with `discord_reply_to_forum` to keep conversations organized
- Clean up forum posts when their purpose has been fulfilled using `discord_delete_forum_post`

## Channel Management

- Always ensure the bot has **View Channel** and **Send Messages** permissions before posting
- Use dedicated channels for automated messages (e.g., `#deployments`, `#alerts`, `#incidents`) — avoid `#general`
- Delete channels when their purpose has been fulfilled to keep the server tidy

## Searching

- Use `discord_search_messages` with targeted queries to find relevant messages without iterating through full history
- Combine with `discord_read_messages` for recent context before sending follow-up messages

## Rate Limits

- Discord enforces per-route rate limits; most message endpoints allow ~5 requests per 5 seconds per channel
- Implement exponential backoff when receiving HTTP 429 responses; respect the `retry_after` field
- Avoid polling channel history in tight loops — prefer event-driven or webhook-based patterns for real-time updates

## Two-Way Communication

- Enable **Message Content Intent** in the Discord Developer Portal to read message content
- Enable **Server Members Intent** if you need to list or inspect server members
- Use slash commands or message prefix patterns to handle bot commands
- Use ephemeral replies for sensitive bot responses (only visible to the invoking user)

## Webhooks

- Use webhooks for one-way automated notifications when interactive bot features are not needed — they require no bot presence in the channel
- Secure webhook URLs as you would any secret; anyone with the URL can post to the channel
- Delete webhooks with `discord_delete_webhook` when they are no longer needed

## Error Handling

- Handle `Missing Permissions`: verify bot permissions in the channel and re-invite with the correct OAuth2 scopes if needed
- Handle `Unknown Channel`: use `discord_get_server_info` to list valid channels and confirm IDs
- Handle `TOKEN_INVALID`: reset the token in the Developer Portal and update configuration
- Handle `ratelimited`: respect the `retry_after` value and back off accordingly
- Log Discord API errors with the full error code for easier debugging
