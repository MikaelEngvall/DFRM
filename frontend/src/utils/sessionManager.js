const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minuter för admin
const USER_SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 timmar för vanliga användare
const ACTIVITY_CHECK_INTERVAL = 1000; // Kontrollera aktivitet varje sekund
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // Visa varning 5 minuter innan timeout

class SessionManager {
  constructor() {
    this.lastActivity = Date.now();
    this.timeoutId = null;
    this.warningCallback = null;
    this.logoutCallback = null;
    this.warningShown = false;
    this.userRole = null;
  }

  init(warningCallback, logoutCallback, userRole = 'ADMIN') {
    this.warningCallback = warningCallback;
    this.logoutCallback = logoutCallback;
    this.userRole = userRole;
    this.startActivityMonitoring();
    this.resetTimeout();
  }

  getSessionTimeout() {
    return this.userRole === 'USER' ? USER_SESSION_TIMEOUT : ADMIN_SESSION_TIMEOUT;
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
    }, this.getSessionTimeout());
  }

  checkSession() {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    const sessionTimeout = this.getSessionTimeout();
    
    // Visa varning om tiden närmar sig timeout
    if (!this.warningShown && 
        timeSinceLastActivity > (sessionTimeout - WARNING_BEFORE_TIMEOUT)) {
      this.warningShown = true;
      if (this.warningCallback) {
        const remainingTime = Math.ceil((sessionTimeout - timeSinceLastActivity) / 60000);
        this.warningCallback(remainingTime);
      }
    }

    // Logga ut om tiden har gått ut
    if (timeSinceLastActivity >= sessionTimeout) {
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

const sessionManagerInstance = new SessionManager();

export default sessionManagerInstance; 