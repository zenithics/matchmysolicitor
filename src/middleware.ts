import { NextRequest, NextResponse } from 'next/server'

// ── Rate Limiting (in-memory per instance) ─────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function isRateLimited(key: string, maxRequests: number, windowSeconds: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return false
  }

  if (entry.count >= maxRequests) {
    return true
  }

  entry.count++
  return false
}

if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetAt) rateLimitStore.delete(key)
    }
  }
  setInterval(cleanup, 5 * 60 * 1000)
}

// ───────────────────────────────────────────────────────────────────────

const PERMALINK_CACHE_SECONDS = 60
let permalinkCache: { data: any; fetchedAt: number } | null = null

async function getPermalinkSettings(baseUrl: string) {
  const now = Date.now()
  if (permalinkCache && now - permalinkCache.fetchedAt < PERMALINK_CACHE_SECONDS * 1000) {
    return permalinkCache.data
  }
  try {
    const res = await fetch(`${baseUrl}/api/globals/permalink-settings`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    const data = await res.json()
    permalinkCache = { data, fetchedAt: now }
    return data
  } catch {
    return permalinkCache?.data ?? null
  }
}

const MAINTENANCE_CACHE_SECONDS = 60
let maintenanceCache: { data: any; fetchedAt: number } | null = null

async function getMaintenanceSettings(baseUrl: string): Promise<any> {
  const now = Date.now()
  if (maintenanceCache && now - maintenanceCache.fetchedAt < MAINTENANCE_CACHE_SECONDS * 1000) {
    return maintenanceCache.data
  }

  try {
    const res = await fetch(`${baseUrl}/api/globals/maintenance-mode`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    })

    if (!res.ok) return null
    const data = await res.json()
    maintenanceCache = { data, fetchedAt: now }
    return data
  } catch {
    return maintenanceCache?.data ?? null
  }
}

function buildMaintenancePage(settings: any, baseUrl: string): string {
  const heading = settings.heading || "We'll be back soon"
  const countdownTarget = settings.showCountdown && settings.countdownTarget
    ? settings.countdownTarget
    : null
  const contactEmail = settings.contactEmail || ''
  const hasPassword = !!settings.password
  const bgImage = settings.backgroundImage?.url || ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#1a1a2e;${bgImage ? `background-image:url('${bgImage}');background-size:cover;background-position:center;` : ''}}
    .overlay{position:fixed;inset:0;background:rgba(253,248,251,0.92)}
    .card{position:relative;z-index:1;max-width:480px;width:100%;margin:2rem;text-align:center;padding:2.5rem;background:#fff;border-radius:1.5rem;box-shadow:0 8px 40px rgba(232,23,122,0.1);border:1px solid rgba(232,23,122,0.1)}
    .logo{margin-bottom:1.5rem;font-size:1.2rem;font-weight:700;color:#E8177A}
    h1{font-size:1.75rem;font-weight:700;margin-bottom:0.75rem;color:#1a1a2e}
    p{color:#666;line-height:1.6;margin-bottom:1rem}
    .countdown{display:flex;gap:1rem;justify-content:center;margin:1.5rem 0}
    .countdown-unit{text-align:center}
    .countdown-value{font-size:2rem;font-weight:700;color:#E8177A;display:block;min-width:3rem;background:#f8fafc;border-radius:0.5rem;padding:0.25rem}
    .countdown-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-top:0.25rem;display:block}
    .contact{margin-top:1rem;font-size:0.875rem;color:#999}
    .contact a{color:#E8177A;text-decoration:none}
    .password-form{margin-top:1.5rem;display:flex;gap:0.5rem}
    .password-form input{flex:1;padding:0.625rem 1rem;border:1px solid #e5e7eb;border-radius:999px;font-size:0.875rem;outline:none}
    .password-form input:focus{border-color:#E8177A}
    .password-form button{padding:0.625rem 1.25rem;background:#E8177A;color:#fff;border:none;border-radius:999px;font-size:0.875rem;font-weight:600;cursor:pointer}
    .error{color:#ef4444;font-size:0.8rem;margin-top:0.5rem}
  </style>
</head>
<body>
  ${bgImage ? '<div class="overlay"></div>' : ''}
  <div class="card">
    <div class="logo">🌸</div>
    <h1>${heading}</h1>
    <p>We're making some improvements. Check back shortly.</p>
    ${countdownTarget ? `
    <div class="countdown" id="countdown"></div>
    <script>
      function update(){
        const target=new Date('${countdownTarget}').getTime();
        const now=Date.now();
        const diff=Math.max(0,target-now);
        const d=Math.floor(diff/86400000);
        const h=Math.floor((diff%86400000)/3600000);
        const m=Math.floor((diff%3600000)/60000);
        const s=Math.floor((diff%60000)/1000);
        document.getElementById('countdown').innerHTML=
          '<div class="countdown-unit"><span class="countdown-value">'+String(d).padStart(2,'0')+'</span><span class="countdown-label">days</span></div>'+
          '<div class="countdown-unit"><span class="countdown-value">'+String(h).padStart(2,'0')+'</span><span class="countdown-label">hours</span></div>'+
          '<div class="countdown-unit"><span class="countdown-value">'+String(m).padStart(2,'0')+'</span><span class="countdown-label">min</span></div>'+
          '<div class="countdown-unit"><span class="countdown-value">'+String(s).padStart(2,'0')+'</span><span class="countdown-label">sec</span></div>';
        if(diff>0)setTimeout(update,1000);
      }
      update();
    </script>` : ''}
    ${contactEmail ? `<p class="contact">Questions? <a href="mailto:${contactEmail}">${contactEmail}</a></p>` : ''}
    ${hasPassword ? `
    <form class="password-form" id="bypassForm" onsubmit="tryBypass(event)">
      <input type="password" id="bypassPw" placeholder="Password to preview site" />
      <button type="submit">Enter</button>
    </form>
    <div class="error" id="bypassErr"></div>
    <script>
      async function tryBypass(e){
        e.preventDefault();
        const pw=document.getElementById('bypassPw').value;
        const res=await fetch('/api/maintenance-bypass',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});
        const data=await res.json();
        if(data.ok){document.cookie='maintenance_bypass=1;path=/;max-age=86400';window.location.reload()}
        else{document.getElementById('bypassErr').textContent='Incorrect password'}
      }
    </script>` : ''}
  </div>
</body>
</html>`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const baseUrl = request.nextUrl.origin

  // ── Rate Limiting ─────────────────────────────────────────────────────
  const clientIpForRateLimit =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (request.method === 'POST') {
    if (pathname === '/api/users/login') {
      if (isRateLimited(`login:${clientIpForRateLimit}`, 5, 900)) {
        return NextResponse.json(
          { error: 'Too many login attempts. Please try again in 15 minutes.' },
          { status: 429 },
        )
      }
    }

    if (pathname === '/api/register') {
      if (isRateLimited(`register:${clientIpForRateLimit}`, 3, 3600)) {
        return NextResponse.json(
          { error: 'Too many registration attempts. Please try again later.' },
          { status: 429 },
        )
      }
    }

    if (pathname === '/api/checkout') {
      if (isRateLimited(`checkout:${clientIpForRateLimit}`, 10, 600)) {
        return NextResponse.json(
          { error: 'Too many checkout attempts. Please try again later.' },
          { status: 429 },
        )
      }
    }

    if (pathname === '/api/users/forgot-password') {
      if (isRateLimited(`forgot:${clientIpForRateLimit}`, 3, 3600)) {
        return NextResponse.json(
          { error: 'Too many password reset requests. Please try again later.' },
          { status: 429 },
        )
      }
    }

    if (pathname === '/api/2fa/challenge') {
      if (isRateLimited(`2fa:${clientIpForRateLimit}`, 5, 300)) {
        return NextResponse.json(
          { error: 'Too many 2FA attempts. Please try again in 5 minutes.' },
          { status: 429 },
        )
      }
    }

    if (pathname === '/api/validate-discount') {
      if (isRateLimited(`discount:${clientIpForRateLimit}`, 10, 60)) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          { status: 429 },
        )
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  // Clear the 2FA session cookie when the user logs out
  if (pathname === '/api/users/logout') {
    const response = NextResponse.next()
    response.cookies.delete('payload-2fa')
    return response
  }

  // Always allow admin and API routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // ── Permalink Rewriting ──────────────────────────────────────────────
  const permalinks = await getPermalinkSettings(baseUrl)
  if (permalinks) {
    const prefixMap: Record<string, string> = {
      posts: permalinks.postsPrefix || 'posts',
      shop: permalinks.shopPrefix || 'shop',
      events: permalinks.eventsPrefix || 'events',
      policies: permalinks.policiesPrefix || 'policies',
    }

    for (const [canonical, custom] of Object.entries(prefixMap)) {
      if (canonical === custom) continue

      // Rewrite custom prefix → canonical file-system route
      if (pathname === `/${custom}` || pathname.startsWith(`/${custom}/`)) {
        const rest = pathname.slice(`/${custom}`.length)
        const url = request.nextUrl.clone()
        url.pathname = `/${canonical}${rest}`
        return NextResponse.rewrite(url)
      }

      // 301 redirect canonical prefix → custom prefix (avoid duplicate content)
      if (permalinks.enableRedirects !== false) {
        if (pathname === `/${canonical}` || pathname.startsWith(`/${canonical}/`)) {
          const rest = pathname.slice(`/${canonical}`.length)
          const url = request.nextUrl.clone()
          url.pathname = `/${custom}${rest}`
          return NextResponse.redirect(url, 301)
        }
      }
    }
  }
  // ────────────────────────────────────────────────────────────────────

  // Check maintenance bypass cookie
  const bypassCookie = request.cookies.get('maintenance_bypass')
  if (bypassCookie?.value === '1') {
    return NextResponse.next()
  }

  const settings = await getMaintenanceSettings(baseUrl)

  if (!settings?.enabled) {
    return NextResponse.next()
  }

  // Check allowed IPs
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''

  if (settings.allowedIPs) {
    const allowedIPs = String(settings.allowedIPs)
      .split('\n')
      .map((ip: string) => ip.trim())
      .filter(Boolean)

    if (allowedIPs.includes(clientIp)) {
      return NextResponse.next()
    }
  }

  const html = buildMaintenancePage(settings, baseUrl)

  return new NextResponse(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600',
      'Cache-Control': 'no-store',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
