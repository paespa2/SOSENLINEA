---
name: web-security-hardening
description: >-
  Security auditing, vulnerability prevention, and defensive engineering for web applications.
  Use when reviewing code for OWASP Top 10 vulnerabilities, configuring HTTP security headers,
  preventing XSS, sanitizing file imports (CSV formula injection CWE-1236), handling JWT tokens,
  and safeguarding sensitive credentials.
---

# Web Application Security Hardening

This skill provides comprehensive defensive guidelines for keeping SOSENLINEA resilient against web vulnerabilities.

## 1. HTTP Security Headers (Vercel & Cloudflare)

Every production deployment must configure the following headers in `vercel.json` or proxy:

```json
{
  "key": "X-Content-Type-Options", "value": "nosniff"
},
{
  "key": "X-Frame-Options", "value": "SAMEORIGIN"
},
{
  "key": "X-XSS-Protection", "value": "1; mode=block"
},
{
  "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"
},
{
  "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"
}
```

## 2. CSV Formula Injection Defense (CWE-1236)

When importing or exporting tables, user-controlled spreadsheet values starting with formula control characters (`=`, `+`, `-`, `@`, `\t`, `\r`) can execute malicious commands in Microsoft Excel or Google Sheets.

### Remediation Protocol:
```typescript
export const sanitizeCsvCell = (val: string): string => {
  const trimmed = val.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return trimmed.replace(/^[=+\-@\t\r]+/, "");
  }
  return trimmed;
};
```

## 3. Credential & Secret Management

- **Client Bundle Rule**: Never store plaintext passwords, master API keys, or database connection strings in frontend files (`src/**`).
- **Environment Variables**: Use `VITE_` prefix exclusively for public configuration (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Secrets without `VITE_` must only reside in serverless functions or backend environment variables.
- **Demo Fallbacks**: Clearly mark any offline demo user objects with prominent UI notices and never reuse real production administrator passwords for local fallback mocks.

## 4. XSS & HTML Injection Prevention

- Always rely on React's automatic string escaping (`<span>{data}</span>`).
- Avoid `dangerouslySetInnerHTML`. If raw HTML rendering is ever required, pipe it through DOMPurify with strict attribute whitelists.
- Sanitize URLs in links (`href` attributes) to reject `javascript:` or `data:` URI schemes.
