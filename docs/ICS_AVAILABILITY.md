# ICS Availability Setup

The public `/availability` page and Contact tab call `/api/availability`.
The API reads configured ICS calendars on the server, converts calendar events into busy blocks,
and returns only free public slots. Event titles, locations, attendees, calendar names, raw file
contents, and secret feed URLs are never returned by the API.

ICS is the recommended low-friction path because it avoids provider OAuth approval flows.
The tradeoff is that provider feeds can lag, and some organizations disable calendar publishing.

## Secret ICS URLs

Use JSON arrays so URLs do not need custom escaping:

```bash
AVAILABILITY_ICS_URLS_JSON='["https://example.com/calendar.ics"]'
```

`webcal://` and `webcals://` subscription links are also accepted. The server converts them to
`https://` before fetching the ICS content.

Secret ICS URLs act like passwords. Store them only in `.env.local` or deployment secrets.
If a URL leaks, regenerate or unpublish the calendar link in the provider.

## Local ICS Files

Manual exports can be placed under:

```text
private/availability/
```

Then configure them with paths relative to the project root:

```bash
AVAILABILITY_ICS_FILE_PATHS_JSON='["private/availability/work.ics","private/availability/personal.ics"]'
```

Files under `private/availability/` are ignored by git and must not be committed.

## Optional Limits

```bash
AVAILABILITY_ICS_TIMEOUT_MS=7000
AVAILABILITY_ICS_MAX_BYTES=2000000
```

## Provider Notes

Google: use the secret calendar address in iCal format when available.

iCloud: use a public/share calendar link only when that sharing model is acceptable. iCloud often
copies these links with a `webcal://` prefix; paste that URL as-is.

Microsoft: use a published or subscribed calendar link only if organization policy allows it.
OAuth/Graph integration is intentionally not part of this setup.

## Local Testing

1. Add one or more ICS URL or file sources to `.env.local`.
2. Run `bun run dev`.
3. Open `/api/availability?weekOffset=0`.
4. Open `/api/availability?weekOffset=1`.
5. Open `/availability`.
6. Add a test event, refresh the feed or replace the local `.ics` file, and confirm the matching
   slot disappears.

Test URL-only sources, file-only sources, and mixed URL + file sources when possible. Also verify
recurring meetings, cancelled events, transparent/free events, all-day busy events, and partial
meetings around lunch/gym.

## Limitations

ICS feeds may have sync delays. Providers may restrict calendar publishing. Secret URLs grant
calendar access to anyone who has the URL. Event details are parsed server-side to calculate
busy time, but the public response returns only free availability slots.
