# SOSENLINEA Engineering & Design Rules

## Visual & UX Standards
1. **Zero-Broken Layouts**: All tables, forms, and cards must render cleanly at both 80% zoom (wide view) and 125%-150% zoom (narrow view).
2. **Container Queries**: Use `@container table-wrapper` for table docking rather than rigid global media queries.
3. **No Placeholders in Production**: All inputs must feature clean, professional, enterprise-grade placeholder text. Never display personal or developer usernames as example text.
4. **Accessible Colors**: Maintain high contrast (WCAG AA compliance) and never use color as the sole indicator of status.

## Security & Reliability Standards
1. **Safe CSV Imports**: Always sanitize spreadsheet inputs against formula injection (CWE-1236).
2. **Header Enforcement**: Ensure all production responses include essential HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options: nosniff`, etc.).
3. **Zero Data Loss**: When transforming or migrating data, unmapped fields must be preserved in operational notes or metadata.
