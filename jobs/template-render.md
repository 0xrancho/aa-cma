# Job: Template Render

Model tier: Haiku
Tools: exec (bash), read, write

## Input

- `TEMPLATE`: Path to HTML template
- `DATA`: Path to JSON data file
- `OUTPUT`: Path for rendered output

## Execution

1. Read the template file
2. Read the data file
3. Replace all `{{key}}` placeholders with values from data
4. Write rendered HTML to OUTPUT path
5. If `DEPLOY` is set, run: `netlify deploy --dir=$(dirname ${OUTPUT}) --prod`

## Output

- Rendered HTML at OUTPUT path
- Deploy URL if DEPLOY was set

## Eval

- Output file exists and is valid HTML
- No unreplaced `{{placeholders}}` remain
- If deployed: URL returns 200
