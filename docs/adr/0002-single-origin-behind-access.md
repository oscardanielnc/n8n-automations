# 0002 — One origin on the VM behind Cloudflare Access

**Status:** Accepted · 2026-11-10 (Oscar)

## Context
Single user. n8n already sits behind Cloudflare Access (email OTP, 30 days) through the VM tunnel. The standard deploys
the web to Cloudflare Pages and the API to the VM.

## Options
1. **One container on the VM** serving the React build and `/api/v1`, one hostname in the tunnel, same Access app (chosen).
2. Pages for the web + API on another hostname: two origins, CORS, two Access policies, cookies across sites.
3. App-level login (Passport + JWT + refresh): a second login for one person, already covered by Access.

## Decision
NestJS serves the static build. Every `/api` request must carry `Cf-Access-Jwt-Assertion`; a guard verifies its
signature against the team's public keys and the audience tag. Requests without it are rejected (defense in depth if the
tunnel or Access rule is ever misconfigured).

## Consequences
No passwords or tokens in the app; no `localStorage` auth. Adds ~150 MB RAM on the VM (3.4 GB free on 2026-11-10).
