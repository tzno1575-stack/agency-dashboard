# Aql Dashboard — Troubleshooting Guide

Last updated: 2026-06-07

This guide covers every known issue, its symptom, root cause, manual fix, and the **exact prompt** to give your Hermes agent to fix it automatically.

---

## Contents

1. [Blank White Screen](#1-blank-white-screen)
2. [Hermes Not Connecting to Dashboard](#2-hermes-not-connecting)
3. [API Endpoints Returning Errors](#3-api-endpoints-returning-errors)
4. [Help Tips Not Showing](#4-help-tips-not-showing)
5. [Setup Wizard Config Not Generating](#5-setup-wizard-config-not-generating)
6. [Mobile Layout Broken](#6-mobile-layout-broken)
7. [Cron Jobs Failing](#7-cron-jobs-failing)
8. [Voice / STT Not Working](#8-voice--stt-not-working)
9. [Dashboard Showing "Demo Mode" Data](#9-dashboard-showing-demo-mode-data)
10. [Vercel Deployment Issues](#10-vercel-deployment-issues)

---

## 1. Blank White Screen

### Symptom
Dashboard URL loads, browser tab shows correct title ("Aql Digital — Agency OS"), but the page is completely blank white.

### Root Cause
- **Stale browser cache** — Chrome holds onto a broken JavaScript bundle from a previous deploy
- **Hydration mismatch** — The React client-side render doesn't match the server-rendered HTML
- **localStorage corruption** — Bad data in `aqd_*` localStorage keys crashes the app on load

### Manual Fix
```
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. If still blank, clear site data:
   - Chrome DevTools (F12) → Application → Storage → Clear site data
   - Or: Settings → Privacy → Clear browsing data → Cached images and files
3. If still blank, try incognito/private window
4. Last resort: open DevTools Console (F12) and check for red error messages
```

### Tell Your Hermes Agent
> "My Aql Dashboard at [URL] is showing a blank white screen. Check the browser console for JavaScript errors, clear the site data, and verify the deployment is healthy. Hard refresh after clearing cache."

---

## 2. Hermes Not Connecting to Dashboard

### Symptom
- Hermes is installed and running (`hermes status` shows green)
- But dashboard AutoPilot shows Hermes as "offline"
- Messages board shows no connection
- Telegram bot doesn't respond

### Root Cause
- **Upstash Redis credentials wrong or missing** in `~/.hermes/.env`
- **Redis URL format incorrect** — must include `https://`
- **Firewall blocking Redis** port 6379/6380 (rare on local, common on VPS)
- **Bridge script not running** — `bridge_upstash.py` cron job failed or not created

### Manual Fix
```
1. Verify Redis credentials:
   cat ~/.hermes/.env | grep UPSTASH
   # Should show UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN

2. Test Redis connection:
   curl -s "YOUR_UPSTASH_URL/ping" -H "Authorization: Bearer YOUR_TOKEN"
   # Should return {"ping":"PONG"}

3. Check bridge script is running:
   hermes cron list | grep bridge
   # Should show bridge_upstash running every 60s

4. If missing, create the bridge cron job:
   hermes cron create "every 60s" \
     --name "dashboard-bridge" \
     --prompt "Run bridge_upstash.py to sync chat between Hermes and dashboard Redis"

5. Restart Hermes gateway:
   hermes gateway restart
```

### Tell Your Hermes Agent
> "My Hermes isn't connecting to the Aql Dashboard. Check UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in ~/.hermes/.env, verify the bridge_upstash cron job is running every 60 seconds, test the Redis connection with curl, and restart the gateway. The dashboard URL is [your-url]."

---

## 3. API Endpoints Returning Errors

### Symptom
- Dashboard boards show no data (empty tables, "No items" messages)
- Browser DevTools Network tab shows 500 or 404 on `/api/*` endpoints
- Settings → System Health shows red for API endpoints

### Root Cause
- **Vercel environment variables missing** — the dashboard needs Upstash credentials in Vercel env
- **Upstash Redis unreachable** — free tier limit reached (10K commands/day) or instance deleted
- **API route crashed** — unhandled exception in the route handler

### Manual Fix
```
1. Check Vercel env vars:
   vercel env ls
   # Needs: UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN

2. If missing, add them:
   vercel env add UPSTASH_REDIS_URL
   vercel env add UPSTASH_REDIS_TOKEN

3. Redeploy:
   vercel --prod

4. Test endpoints:
   curl https://your-dashboard.vercel.app/api/health
   # Should return {"status":"healthy"}

5. Check Upstash usage:
   # Log into console.upstash.com → your database → Metrics
   # If at 10K/day limit, wait until reset or upgrade
```

### Tell Your Hermes Agent
> "My Aql Dashboard API endpoints are failing. Check Vercel environment variables for UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN, verify Upstash Redis is reachable and not at the free tier limit, redeploy after fixing env vars, and test /api/health."

---

## 4. Help Tips Not Showing

### Symptom
- Dashboard loads but no tips bar below the header
- "Tips" button in header is gray (not amber)
- Tips were visible before but disappeared

### Root Cause
- **Tips toggled off** — the "Tips On" button was clicked
- **localStorage value `aqd_help_tips`** is set to `"false"`
- **All tips dismissed** for the current board (X button clicked on every tip)

### Manual Fix
```
1. Check toggle state: click the "Tips" (gray) button in the header
   → Should turn amber and say "Tips On"

2. If toggle doesn't work, check localStorage:
   - Chrome DevTools (F12) → Application → Local Storage → your-dashboard-url
   - Find aqd_help_tips and change value from "false" to "true"
   - Refresh the page

3. If tips still don't show for a specific board:
   - Switch to a different board (tips are per-board)
   - Dismissed tips are stored in component state (clears on refresh)
   - Hard refresh to reset all per-board dismissals
```

### Tell Your Hermes Agent
> "Help tips have disappeared from my Aql Dashboard. Check if the HelpTips toggle is off, verify localStorage aqd_help_tips is set to 'true', and do a hard refresh to reset per-board tip dismissals."

---

## 5. Setup Wizard Config Not Generating

### Symptom
- Setup board Step 3: clicked "Generate My Config Files" but nothing appears
- API call to `/api/setup` returns 500 or no response
- Downloaded config files are empty or missing content

### Root Cause
- **API route error** — the `/api/setup` POST handler crashed
- **Missing request body** — the wizard didn't pass API keys to the endpoint
- **Vercel function timeout** — config generation is fast but network issues can cause timeouts

### Manual Fix
```
1. Test the API directly:
   curl -X POST https://your-dashboard.vercel.app/api/setup \
     -H "Content-Type: application/json" \
     -d '{"installType":"local"}'
   # Should return JSON with files.config.yaml and files[".env"]

2. If API fails, redeploy:
   cd ~/your-dashboard-repo
   vercel --prod

3. Manual config generation (fallback):
   # Create these files yourself:
   # - config.yaml (copy from Setup board Step 3 preview)
   # - .env (copy from Setup board Step 3 preview)
   # Place both in ~/.hermes/
```

### Tell Your Hermes Agent
> "The Setup Wizard in my Aql Dashboard isn't generating config files. Test POST /api/setup with curl, check Vercel function logs for errors, and redeploy if needed. If the API is down, help me generate config.yaml and .env manually."

---

## 6. Mobile Layout Broken

### Symptom
- Bottom navigation bar has missing or wrong buttons
- Content overflows off screen horizontally
- No safe area padding at bottom (content hidden behind iOS home indicator)
- "Add to Home Screen" doesn't work or shows wrong icon/name

### Root Cause
- **BottomNav component maps to wrong board IDs** — nav buttons don't switch boards
- **CSS missing `env(safe-area-inset-bottom)`** — content hidden on notched devices
- **Service worker not registered** — PWA install fails
- **Theme color meta tag missing** — status bar doesn't match app

### Manual Fix
```
1. Verify BottomNav has 5 working buttons:
   - Home → briefings board
   - Tasks → dashboard board (Kanban)
   - Content → content board (Content Studio)
   - Chat → opens chat panel
   - Settings → settings board

2. Check PWA compliance:
   - Chrome DevTools → Application → Manifest
   - Should show name "Aql Digital", theme_color "#0a0e17"
   - Service Workers tab should show active worker

3. If issues persist, redeploy latest version:
   cd ~/your-dashboard-repo
   git pull origin main
   vercel --prod
```

### Tell Your Hermes Agent
> "My Aql Dashboard mobile layout is broken. Check that the BottomNav component has 5 working buttons with correct board IDs, verify globals.css has env(safe-area-inset-bottom), confirm the service worker is registered, and test the PWA manifest. Redeploy with fixes."

---

## 7. Cron Jobs Failing

### Symptom
- AutoPilot board shows red/down for one or more cron jobs
- Scheduled tasks (prayer reminders, social posts, backups) not running
- Hermes logs show cron errors

### Root Cause
- **Script path changed** — the script file was moved or renamed
- **Model not found** — the cron job references an LLM model that's not installed
- **API key expired** — the script uses an API (Firecrawl, OpenRouter) with an invalid key
- **Dependency missing** — Python package required by the script not installed

### Manual Fix
```
1. List all cron jobs:
   hermes cron list

2. Check job details:
   hermes cron edit JOB_ID
   # Verify: schedule, prompt, script path, model

3. Common fixes:
   # Model issue:
   hermes cron edit JOB_ID --model "deepseek-chat"

   # Script path issue:
   hermes cron edit JOB_ID --script "/correct/path/to/script.py"

   # Run once to test:
   hermes cron run JOB_ID

4. Check logs:
   tail -50 ~/.hermes/logs/gateway.log | grep -i "cron.*error"
```

### Tell Your Hermes Agent
> "Some cron jobs in my Aql Dashboard AutoPilot are failing. Run 'hermes cron list' to identify failed jobs, check each job's schedule/prompt/script/model, fix any broken references, and test with 'hermes cron run'. Check gateway logs for specific error messages."

---

## 8. Voice / STT Not Working

### Symptom
- Voice messages to Telegram bot are not transcribed
- Hermes responds with "I couldn't understand that audio"
- `/voice on` command doesn't enable voice mode

### Root Cause
- **faster-whisper not installed** — STT provider is set to `local` but package missing
- **STT provider misconfigured** — config.yaml points to a provider with no API key
- **Audio format unsupported** — Telegram sends OGG but STT expects WAV/MP3

### Manual Fix
```
1. Install faster-whisper (local, free):
   pip install faster-whisper

2. Check STT config:
   hermes config edit
   # Verify stt.enabled: true, stt.provider: local

3. Alternative: use Groq (free tier):
   hermes config set stt.provider groq
   # Add GROQ_API_KEY to ~/.hermes/.env

4. Test transcription:
   hermes chat -q "test" --voice
   # Or send a voice message via Telegram

5. Restart gateway:
   hermes gateway restart
```

### Tell Your Hermes Agent
> "Voice transcription isn't working in Hermes. Check STT config (stt.enabled and stt.provider), install faster-whisper if using local provider, or switch to Groq with GROQ_API_KEY. Restart the gateway after changes."

---

## 9. Dashboard Showing "Demo Mode" Data

### Symptom
- All boards show sample data (Maurice Andrews, Tesla Rides, etc.)
- Amber "Demo Mode" badge in sidebar
- API endpoints return sample data instead of real data
- No Redis connection

### Root Cause
- **Redis not connected** — the dashboard can't reach Upstash, falls back to sample data
- **This is NORMAL for new installations** — real data comes when Hermes connects
- **Upstash credentials not set** in Vercel environment variables

### Manual Fix
```
1. This is expected behavior for a fresh install.
   The dashboard uses a fallback chain: Redis → sample data → empty array.

2. To connect real data:
   a. Complete the Hermes Setup wizard (sidebar → Hermes Setup)
   b. Ensure Upstash Redis credentials are in Vercel env vars
   c. Start the bridge_upstash cron job in Hermes
   d. Wait 60 seconds for first sync

3. Verify connection:
   curl https://your-dashboard.vercel.app/api/health
   # Should show "redis": "connected"

4. The demo badge disappears automatically when Redis connects
```

### Tell Your Hermes Agent
> "My Aql Dashboard is showing demo data. I need to connect it to real data. Walk me through the Hermes Setup wizard, ensure Upstash credentials are in Vercel, start the bridge cron job, and verify /api/health shows Redis as 'connected'."

---

## 10. Vercel Deployment Issues

### Symptom
- `vercel --prod` succeeds but dashboard still shows old version
- Build fails with TypeScript or module errors
- "Deployment completed" but URL returns 404

### Root Cause
- **Vercel alias not updated** — deployment succeeded but not aliased to production domain
- **Build cache stale** — Vercel used cached build output with old code
- **Missing environment variables** — build-time env vars not set in Vercel project
- **Branch not pushed** — deploying from local when remote is behind

### Manual Fix
```
1. Force fresh build (no cache):
   vercel --prod --force

2. Check deployment status:
   vercel ls
   # Verify latest deployment is aliased to production

3. Check build logs:
   vercel logs [deployment-url]

4. Verify git is in sync:
   git status
   git push origin main

5. Manual alias (if needed):
   vercel alias set [deployment-url] your-domain.vercel.app

6. Clear Vercel build cache:
   vercel env rm NEXT_BUILD_CACHE_KEY  # if set
   vercel --prod
```

### Tell Your Hermes Agent
> "My Aql Dashboard deployment to Vercel isn't updating. Force a fresh deploy with --force, check deployment logs for build errors, verify git remote is in sync, and ensure the deployment is aliased to the production URL."

---

## Quick Reference: Error → Fix Map

| Symptom | Most Likely Fix | Severity |
|---------|----------------|----------|
| Blank white screen | Hard refresh (Cmd+Shift+R) | 🔴 Critical |
| Hermes offline in dashboard | Check Upstash env vars + bridge cron | 🔴 Critical |
| API returning 500 | Vercel env vars missing Upstash | 🔴 Critical |
| Tips toggle missing | Hard refresh to clear React state | 🟡 Minor |
| Sample data showing | Normal — connect Redis for real data | 🟢 Expected |
| Mobile nav broken | Redeploy latest version | 🟡 Minor |
| Cron jobs red in AutoPilot | `hermes cron edit` to fix model/script | 🟡 Minor |
| Voice not transcribing | `pip install faster-whisper` | 🟡 Minor |
| Setup config not generating | Test `/api/setup` with curl | 🟡 Minor |
| Deploy not updating | `vercel --prod --force` | 🟡 Minor |

---

## Getting Help

1. **Check this guide first** — 9 out of 10 issues are covered above
2. **Ask your Hermes agent** using the prompts in each section
3. **Check AutoPilot board** — shows live status of all components
4. **Check Settings → System Health** — shows API, Redis, and gateway status
5. **Still stuck?** The dashboard code is at `github.com/tzno1575-stack/agency-dashboard` — file an issue

---

*"Whoever fears Allah, He will make a way out for him." — At-Talaq 65:2*
