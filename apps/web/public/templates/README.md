# Template Thumbnails

PNG files in this directory are **generated artifacts** — do not edit manually.

Regenerate them after changing any template's HTML or CSS:

```bash
make api-thumbs
```

This runs `services/api/cmd/thumbgen`, which renders each template with sample
data and captures a screenshot via headless Chrome.

