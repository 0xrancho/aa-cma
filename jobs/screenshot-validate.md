# Job: Screenshot Validate

Model tier: Haiku
Tools: browser

## Input

- `URL`: Page to screenshot
- `EXPECTED`: Description of what the page should look like
- `BREAKPOINTS`: Array of widths (default: [375, 768, 1440])

## Execution

1. For each breakpoint, navigate to URL and take screenshot
2. Save screenshots to the output path
3. Evaluate each screenshot against EXPECTED description

## Output

Write to the path specified in the task brief:

```json
{
  "url": "URL",
  "screenshots": [
    { "width": 375, "path": "screenshot-375.png", "pass": true },
    { "width": 768, "path": "screenshot-768.png", "pass": true },
    { "width": 1440, "path": "screenshot-1440.png", "pass": false, "note": "..." }
  ],
  "timestamp": "ISO8601"
}
```

## Eval

- All screenshots captured successfully
- Visual check against EXPECTED (report deviations, don't auto-fail)
