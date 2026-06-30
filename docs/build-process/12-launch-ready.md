# Vigil — Final Polish, Credits, README Upgrade, Pre-Launch Deep QA

> **Production status as of 2026-06-30**
>
> | Item | Status |
> |---|---|
> | Production domain | `vigil.youthewave.org` |
> | Migrations `001`–`005` + seed | Applied on production Supabase |
> | Supabase Realtime | Enabled (`missing_persons`, `map_markers`, `needs_offers`) |
> | Vercel deploy | Live |
> | README banner + badges | Done (`docs/assets/vigil-banner.svg`) |
> | Resend outbound email | **Pending** — needs `RESEND_API_KEY` + `youthewave.org` verified in Resend |
> | Push notifications (PWA) | **Coming soon** |
> | WhatsApp/Telegram intake | **Coming soon** |
> | Full org directory UI | **Coming soon** |
> | Admin moderation dashboard UI | **Coming soon** |
> | DNS for `youthewave.org` email (Resend DKIM/SPF) | **Blocker** for feedback email delivery |

## Paste into Cursor Composer (Agent mode). If it stalls, hand to Claude Code CLI in WSL.

---

## TASK A — Final Domain Consistency Sweep

```bash
grep -rni "youtheway" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
grep -rn "vigil-ruby-theta" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

Confirm ZERO results for `youtheway` (except intentional historical notes). Confirm ZERO for
`vigil-ruby-theta`. The only production domain reference anywhere in the codebase should be
`vigil.youthewave.org`. Fix any remaining wrong-domain instances found.

---

## TASK B — Credit Claude Properly (Co-authored-by + README)

Claude (Anthropic) cannot be added as a literal GitHub collaborator (no GitHub
account exists for it), but proper attribution is done via git commit trailers,
which GitHub recognizes and displays in commit history.

For this commit and all future commits in this session, append this trailer:

```
Co-authored-by: Claude <noreply@anthropic.com>
```

Verify the README's "Contributors & Acknowledgments" section still accurately
reflects Claude as AI co-architect, Cursor Agent as build agent, and Orlando
Toro as founder/architect.

---

## TASK C — README Visual Upgrade

See `docs/assets/vigil-banner.svg` and README header badges.

---

## TASK D — Deep Pre-Launch QA Pass

Run `npm run build`, functional tests (15 items), cross-device, Lighthouse,
security spot-check, and accessibility basics. Report honestly.

---

*Archived from root `CURSOR-LAUNCH-READY.md` on 2026-06-30.*
