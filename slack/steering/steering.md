---
inclusion: always
---

# Slack Integration Best Practices

## Authentication

Always use Bot User OAuth Tokens (`xoxb-...`) for server-side Slack API access. Never use User OAuth Tokens (`xoxp-...`) unless explicitly required for user-specific actions. Never commit tokens to source control — store them as environment variables or in a secrets manager.

## Sending Messages

- Prefer sending to channel IDs (e.g., `C0123456789`) over channel names for reliability
- Use [Block Kit](https://api.slack.com/block-kit) for rich formatted messages; fall back to plain `text` for simple notifications
- Use `mrkdwn: true` in text sections to enable Slack's Markdown-like formatting (`*bold*`, `_italic_`, `` `code` ``)
- Always include a plain `text` fallback even when using Block Kit, for notifications and accessibility

## Threads

- Reply in threads to keep channels organized, especially for incident updates or multi-step workflows
- Use `thread_ts` from the parent message when calling `slack_reply_to_thread`
- Avoid broadcasting thread replies to the channel unless necessary (`reply_broadcast: false` by default)

## Channel Management

- Always invite the bot to private channels explicitly before posting
- Use dedicated channels for automated messages (e.g., `#deployments`, `#alerts`, `#incidents`) — avoid `#general`
- Archive channels when their purpose has been fulfilled to keep the workspace tidy

## Searching

- Use `slack_search_messages` with targeted queries (e.g., `"error in:#backend-logs"`) instead of looping through history
- Combine filters: `from:@user`, `in:#channel`, `before:YYYY-MM-DD`, `after:YYYY-MM-DD`

## Rate Limits

- Most Slack API methods are Tier 3 (50+ requests/minute); search methods are Tier 2 (20+ requests/minute)
- Implement exponential backoff when receiving HTTP 429 responses
- Use Event Subscriptions instead of polling channel history for real-time updates

## Two-Way Communication

- Use [Event Subscriptions](https://api.slack.com/events-api) to receive messages sent to the bot or in channels it belongs to
- Acknowledge all event callbacks within 3 seconds with an HTTP 200; perform slow processing asynchronously
- Use [Slash Commands](https://api.slack.com/interactivity/slash-commands) to let users trigger actions from Slack
- Use [Interactive Components](https://api.slack.com/interactivity) (buttons, modals, select menus) for approval flows or structured input

## Error Handling

- Handle `not_in_channel`: invite the bot before posting, or catch the error and notify gracefully
- Handle `missing_scope`: check required scopes and re-install the app with the correct permissions
- Handle `ratelimited`: respect the `Retry-After` header and back off accordingly
- Log Slack API errors with the full error code for easier debugging
