/**
 * GAZAL FILES — PIN LOCK
 * ------------------------------------------------------------------
 * - First launch on a device: user sets a 4-digit PIN (entered twice).
 * - Every later launch, and every re-lock: user must enter it to proceed.
 * - The PIN itself is never stored — only a SHA-256 hash of it, plus a
 *   random per-device salt, in localStorage. (This is device-local auth
 *   for the lock screen; it is separate from Firebase sync auth, which
 *   is added in Phase 5.)
 * - Re-locks automatically when the app is backgrounded/hidden, and after
 *   INACTIVITY_LIMIT_MS of no interaction while open.
 * ------------------------------------------------------------------
 */

const PIN_LENGTH = 4;
const INACTIVITY_LIMIT_MS = 3 * 60 * 1000; // 3 minutes — adjust in Settings later

const PinLock = (() => {
  let entry = "";
  let mode = "unlock"; // 'unlock' | 'set' | 'confirm'
  let pendingFirstPin = "";
  let failCount = 0;
  let inactivityTimer = null;

  const dotsEl = () => document.getElementById("pin-dots");
  const titleEl = () => document.getElementById("pin-title");
  const messageEl = () => document.getElementById("pin-message");

  function hasStoredPin() {
    return !!localStorage.getItem("gazal_pin_hash");
  }

  async function hashPin(pin, salt) {
    const enc = new TextEncoder().encode(salt + ":" + pin);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getOrCreateSalt() {
    let salt = localStorage.getItem("gazal_pin_salt");
    if (!salt) {
      salt = crypto.randomUUID();
      localStorage.setItem("gazal_pin_salt", salt);
    }
    return salt;
  }

  function renderDots() {
    const el = dotsEl();
    el.innerHTML = "";
    for (let i = 0; i < PIN_LENGTH; i++) {
      const dot = document.createElement("div");
      dot.className = "pin-dot" + (i < entry.length ? " filled" : "");
      el.appendChild(dot);
    }
  }

  function shakeDots(msg) {
    const el = dotsEl();
    [...el.children].forEach((d) => d.classList.add("error"));
    messageEl().textContent = msg;
    setTimeout(() => {
      [...el.children].forEach((d) => d.classList.remove("error"));
    }, 320);
  }

  function setTitle(text) {
    titleEl().textContent = text;
  }

  async function onKey(digit) {
    if (entry.length >= PIN_LENGTH) return;
    entry += digit;
    renderDots();
    if (entry.length === PIN_LENGTH) {
      await handleComplete();
    }
  }

  function onDelete() {
    entry = entry.slice(0, -1);
    renderDots();
    messageEl().textContent = "";
  }

  async function handleComplete() {
    const salt = getOrCreateSalt();

    if (mode === "set") {
      pendingFirstPin = entry;
      entry = "";
      mode = "confirm";
      setTitle(t("pinConfirmTitle"));
      renderDots();
      return;
    }

    if (mode === "confirm") {
      if (entry !== pendingFirstPin) {
        shakeDots(t("pinMismatch"));
        entry = "";
        mode = "set";
        pendingFirstPin = "";
        setTitle(t("pinSetTitle"));
        setTimeout(renderDots, 320);
        return;
      }
      const hash = await hashPin(entry, salt);
      localStorage.setItem("gazal_pin_hash", hash);
      entry = "";
      unlock();
      return;
    }

    // mode === 'unlock'
    const hash = await hashPin(entry, salt);
    const stored = localStorage.getItem("gazal_pin_hash");
    if (hash === stored) {
      failCount = 0;
      entry = "";
      unlock();
    } else {
      failCount++;
      shakeDots(t("pinError"));
      entry = "";
      setTimeout(renderDots, 320);
    }
  }

  function unlock() {
    document.getElementById("pin-screen").classList.remove("active");
    document.getElementById("app-shell").classList.add("active");
    resetInactivityTimer();
    if (typeof onUnlocked === "function") onUnlocked();
  }

  function lock() {
    entry = "";
    document.getElementById("app-shell").classList.remove("active");
    const pinScreen = document.getElementById("pin-screen");
    pinScreen.classList.add("active");
    messageEl().textContent = "";
    if (hasStoredPin()) {
      mode = "unlock";
      setTitle(t("pinEnterTitle"));
    } else {
      mode = "set";
      pendingFirstPin = "";
      setTitle(t("pinSetTitle"));
    }
    renderDots();
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(lock, INACTIVITY_LIMIT_MS);
  }

  function init() {
    document.querySelectorAll(".pin-key[data-digit]").forEach((btn) => {
      btn.addEventListener("click", () => onKey(btn.dataset.digit));
    });
    document.getElementById("pin-delete").addEventListener("click", onDelete);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) lock();
    });

    ["pointerdown", "keydown"].forEach((evt) =>
      document.addEventListener(evt, () => {
        if (document.getElementById("app-shell").classList.contains("active")) {
          resetInactivityTimer();
        }
      })
    );

    lock(); // always start locked
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PinLock.init);
