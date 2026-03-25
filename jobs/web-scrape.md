# Job: Web Scrape

Model tier: Haiku
Tools: exec (curl), browser (if JS rendering needed)

## Input

- `URL`: Target URL
- `MODE`: "static" (curl) or "rendered" (browser)
- `EXTRACT`: What to extract — "all" | "text" | "links" | "structured"

## Execution

For static:
```bash
curl -s -L "${URL}" | head -c 100000
```

For rendered: use browser tool to navigate, wait for render, extract content.

## Output

Write to the path specified in the task brief. Format:

```json
{
  "url": "URL",
  "title": "page title",
  "content": "extracted text or HTML",
  "links": ["..."],
  "timestamp": "ISO8601",
  "mode": "static|rendered"
}
```

## Eval

- Content is non-empty
- URL matches request
- No error pages (check for 404, 403, 500 patterns)
