// <cookie-banner> — ICO-compliant bottom-sheet consent banner + Google Consent Mode v2.
(function () {
  if (customElements.get('cookie-banner')) return;
  const KEY = 'mms-consent-v1';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  // Consent Mode v2 defaults: everything non-essential denied before choice.
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  function applyConsent(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    window.dataLayer.push({ event: 'mms_consent_updated', consent: c });
  }
  const stored = (() => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } })();
  if (stored) applyConsent(stored);

  class CookieBanner extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
      this.prefs = false;
      this.render(!stored);
      window.__openCookieSettings = () => this.render(true);
    }
    save(c) {
      try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
      applyConsent(c);
      this.render(false);
    }
    render(open) {
      const btn = 'flex:1; min-width:130px; padding:13px 18px; border-radius:6px; font:700 15px \'Plus Jakarta Sans\',sans-serif; cursor:pointer;';
      const cur = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
      this.shadowRoot.innerHTML = !open ? '' : `
        <div role="dialog" aria-label="Cookie consent" style="position:fixed; left:0; right:0; bottom:0; z-index:1000; background:#FFFFFF; border-top:1px solid #E4E7EC; box-shadow:0 -4px 24px rgba(26,31,38,0.08); font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
          <div style="max-width:1180px; margin:0 auto; padding:20px 24px; display:flex; flex-direction:column; gap:14px;">
            <p style="margin:0; font-size:14px; line-height:1.6; color:#3A414C;">We use cookies to run this site and, with your consent, to measure how it is used and to improve our marketing. Necessary cookies are always on. You can change your choice at any time via "Cookie settings" in the footer. <a href="legal-cookie-policy.dc.html" style="color:#1E4FD8;">Cookie policy</a></p>
            ${this.prefs ? `
            <div style="display:flex; flex-direction:column; gap:10px; border:1px solid #E4E7EC; border-radius:8px; padding:16px;">
              ${[['necessary', 'Necessary', 'Required for the site and enquiry form to work.', true],
                 ['analytics', 'Analytics', 'Helps us understand how the site is used.', false],
                 ['marketing', 'Marketing', 'Used to measure and improve our advertising.', false]]
                .map(([id, label, desc, locked]) => `
                <label style="display:flex; gap:12px; align-items:flex-start; font-size:14px; color:#3A414C; cursor:${locked ? 'default' : 'pointer'};">
                  <input type="checkbox" data-c="${id}" ${locked ? 'checked disabled' : (cur[id] ? 'checked' : '')} style="margin-top:2px; width:16px; height:16px;">
                  <span><strong style="color:#1A1F26;">${label}</strong>${locked ? ' (always on)' : ''}<br>${desc}</span>
                </label>`).join('')}
            </div>` : ''}
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <button id="acceptAll" style="${btn} background:#1E4FD8; color:#FFFFFF; border:1.5px solid #1E4FD8;">Accept all</button>
              <button id="rejectAll" style="${btn} background:#1E4FD8; color:#FFFFFF; border:1.5px solid #1E4FD8;">Reject all</button>
              ${this.prefs
                ? `<button id="savePrefs" style="${btn} background:#FFFFFF; color:#1A1F26; border:1.5px solid #1A1F26;">Save preferences</button>`
                : `<button id="managePrefs" style="${btn} background:#FFFFFF; color:#1A1F26; border:1.5px solid #1A1F26;">Manage preferences</button>`}
            </div>
          </div>
        </div>`;
      if (!open) return;
      const $ = (s) => this.shadowRoot.querySelector(s);
      $('#acceptAll').onclick = () => this.save({ analytics: true, marketing: true });
      $('#rejectAll').onclick = () => this.save({ analytics: false, marketing: false });
      if (this.prefs) {
        $('#savePrefs').onclick = () => this.save({
          analytics: $('[data-c="analytics"]').checked,
          marketing: $('[data-c="marketing"]').checked
        });
      } else {
        $('#managePrefs').onclick = () => { this.prefs = true; this.render(true); };
      }
    }
  }
  customElements.define('cookie-banner', CookieBanner);
})();
