(() => {
  // <stdin>
  var CookieConsent = class _CookieConsent {
    static COOKIE_NAME = "cookie_consent";
    static COOKIE_DAYS = 365;
    state = null;
    banner = null;
    settingsPanel = null;
    constructor() {
      this.banner = document.getElementById("cookie-consent-banner");
      this.settingsPanel = document.getElementById("cookie-settings-panel");
      this.state = this.loadState();
      if (!this.state && this.banner) {
        this.showBanner();
      }
      this.bindEvents();
      this.dispatchConsentEvent();
    }
    loadState() {
      const cookie = document.cookie.split("; ").find((row) => row.startsWith(_CookieConsent.COOKIE_NAME + "="));
      if (!cookie) return null;
      try {
        return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
      } catch {
        return null;
      }
    }
    saveState() {
      if (!this.state) return;
      const expires = /* @__PURE__ */ new Date();
      expires.setDate(expires.getDate() + _CookieConsent.COOKIE_DAYS);
      document.cookie = `${_CookieConsent.COOKIE_NAME}=${encodeURIComponent(JSON.stringify(this.state))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
    showBanner() {
      if (this.banner) {
        this.banner.removeAttribute("aria-hidden");
      }
    }
    hideBanner() {
      if (this.banner) {
        const activeElement = document.activeElement;
        if (activeElement && this.banner.contains(activeElement)) {
          activeElement.blur();
        }
        this.banner.setAttribute("aria-hidden", "true");
      }
      this.hideSettings();
    }
    showSettings() {
      if (this.settingsPanel) {
        this.settingsPanel.removeAttribute("aria-hidden");
        const checkboxes = this.settingsPanel.querySelectorAll("input[data-cookie-category]");
        checkboxes.forEach((cb) => {
          const input = cb;
          const category = input.dataset.cookieCategory;
          if (category && this.state && typeof this.state[category] === "boolean") {
            input.checked = this.state[category];
          } else {
            input.checked = false;
          }
        });
      }
    }
    hideSettings() {
      if (this.settingsPanel) {
        const activeElement = document.activeElement;
        if (activeElement && this.settingsPanel.contains(activeElement)) {
          activeElement.blur();
        }
        this.settingsPanel.setAttribute("aria-hidden", "true");
      }
    }
    bindEvents() {
      document.addEventListener("click", (e) => {
        const target = e.target;
        const action = target.dataset.cookieAction;
        if (!action) return;
        switch (action) {
          case "accept":
            this.acceptAll();
            break;
          case "deny":
            this.denyAll();
            break;
          case "settings":
            this.showSettings();
            break;
          case "save":
            this.saveSettings();
            break;
          case "cancel":
            this.hideSettings();
            break;
          case "reopen":
            this.showBanner();
            break;
        }
      });
    }
    acceptAll() {
      this.state = {
        necessary: true,
        analytics: true,
        functional: true,
        timestamp: Date.now()
      };
      this.saveState();
      this.hideBanner();
      this.dispatchConsentEvent();
    }
    denyAll() {
      this.state = {
        necessary: true,
        analytics: false,
        functional: false,
        timestamp: Date.now()
      };
      this.saveState();
      this.hideBanner();
      this.dispatchConsentEvent();
    }
    saveSettings() {
      const checkboxes = document.querySelectorAll("input[data-cookie-category]");
      this.state = {
        necessary: true,
        analytics: false,
        functional: false,
        timestamp: Date.now()
      };
      checkboxes.forEach((cb) => {
        const input = cb;
        const category = input.dataset.cookieCategory;
        if (category && category in this.state) {
          this.state[category] = input.checked;
        }
      });
      this.saveState();
      this.hideBanner();
      this.dispatchConsentEvent();
    }
    dispatchConsentEvent() {
      const event = new CustomEvent("onCookieConsentChange", {
        detail: this.state
      });
      window.dispatchEvent(event);
      if (this.state) {
        document.documentElement.dataset.consentAnalytics = String(this.state.analytics);
        document.documentElement.dataset.consentFunctional = String(this.state.functional);
      }
    }
    // Public API
    hasConsent(category) {
      if (!this.state) return false;
      return this.state[category] ?? false;
    }
    getState() {
      return this.state;
    }
    reopenBanner() {
      this.showBanner();
    }
  };
  var stdin_default = CookieConsent;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.cookieConsent = new CookieConsent();
    });
  } else {
    window.cookieConsent = new CookieConsent();
  }
})();
