const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minuter i millisekunder
const ACTIVITY_CHECK_INTERVAL = 1000; // Kontrollera aktivitet varje sekund
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // Visa varning 5 minuter innan timeout

class SessionManager {
  constructor() {
    this.lastActivity = Date.now();
    this.timeoutId = null;
    this.warningCallback = null;
    this.logoutCallback = null;
    this.warningShown = false;
  }

  init(warningCallback, logoutCallback) {
    this.warningCallback = warningCallback;
    this.logoutCallback = logoutCallback;
    this.startActivityMonitoring();
    this.resetTimeout();
  }

  startActivityMonitoring() {
    // Lyssna på användaraktivitet
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.handleUserActivity());
    });

    // Starta intervallkontroll
    setInterval(() => this.checkSession(), ACTIVITY_CHECK_INTERVAL);
  }

  handleUserActivity() {
    this.lastActivity = Date.now();
    this.warningShown = false;
    this.resetTimeout();
  }

  resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    }, SESSION_TIMEOUT);
  }

  checkSession() {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    
    // Visa varning om tiden närmar sig timeout
    if (!this.warningShown && 
        timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT)) {
      this.warningShown = true;
      if (this.warningCallback) {
        const remainingTime = Math.ceil((SESSION_TIMEOUT - timeSinceLastActivity) / 60000);
        this.warningCallback(remainingTime);
      }
    }

    // Logga ut om tiden har gått ut
    if (timeSinceLastActivity >= SESSION_TIMEOUT) {
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    }
  }

  cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.removeEventListener(event, () => this.handleUserActivity());
    });
  }
}

export default new SessionManager(); 