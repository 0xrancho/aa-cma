# Job: Airtable Read

Model tier: Haiku
Tools: exec (curl)

## Input

- `BASE_ID`: Airtable base ID
- `TABLE`: Table name
- `FILTER`: Airtable filter formula (optional)
- `FIELDS`: Comma-separated field names to return (optional)

## Execution

```bash
curl -s "https://api.airtable.com/v0/${BASE_ID}/${TABLE}?filterByFormula=${FILTER}&fields[]=${FIELDS}" \
  -H "Authorization: Bearer ${MASTER_AIR_PAT}"
```

## Output

Write structured JSON to the path specified in the task brief. Format:

```json
{
  "records": [...],
  "count": N,
  "source": "airtable",
  "table": "TABLE",
  "timestamp": "ISO8601"
}
```

## Eval

- Response is valid JSON
- Record count > 0 (unless filter is expected to return empty)
- All requested fields present in response
