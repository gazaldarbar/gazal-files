/**
 * GAZAL FILES — SHARED FIREBASE PIN LOCK
 * ------------------------------------------------------------------
 * - One shared 4-digit PIN for the app.
 * - PIN hash is stored centrally in Firestore.
 * - First setup: if Firebase has no PIN, set and confirm one.
 * - Later launches: enter the shared PIN to unlock.
 * - PIN itself is never stored in plain text.
 * - Uses SHA-256 hash.
 * - Automatically locks when app is backgrounded.
 * - Automatically locks after inactivity.
 * ------------------------------------------------------------------
 */

const PIN_LENGTH = 4;

const INACTIVITY_LIMIT_MS =
  3 * 60 * 1000;


const PinLock = (() => {

  let entry = "";

  let mode =
    "unlock";

  let pendingFirstPin =
    "";

  let failCount =
    0;

  let inactivityTimer =
    null;


  /*
    INTERFACE ELEMENTS
  */

  const dotsEl =
    () =>
      document.getElementById(
        "pin-dots"
      );


  const titleEl =
    () =>
      document.getElementById(
        "pin-title"
      );


  const messageEl =
    () =>
      document.getElementById(
        "pin-message"
      );


  /*
    HASH PIN

    The same PIN always creates
    the same hash.

    This allows the PIN entered
    by the user to be compared
    with the Firebase hash.
  */

  async function hashPin(
    pin
  ) {

    const enc =
      new TextEncoder().encode(
        "gazal-darbar-shared-pin:" +
        pin
      );


    const digest =
      await crypto.subtle.digest(
        "SHA-256",
        enc
      );


    return Array
      .from(
        new Uint8Array(
          digest
        )
      )
      .map(
        (b) =>
          b
            .toString(16)
            .padStart(
              2,
              "0"
            )
      )
      .join(
        ""
      );

  }


  /*
    WAIT FOR FIREBASE FUNCTIONS

    firebase.js is loaded as
    a JavaScript module.

    This waits until the Firebase
    functions become available.
  */

  async function waitForFirebase() {

    return new Promise(
      (resolve) => {

        const checkFirebase =
          () => {

            if (
              window.getSharedPinHash &&
              window.saveSharedPinHash
            ) {

              resolve();

              return;

            }


            setTimeout(
              checkFirebase,
              100
            );

          };


        checkFirebase();

      }
    );

  }


  /*
    CHECK WHETHER FIREBASE
    ALREADY HAS A SHARED PIN
  */

  async function hasSharedPin() {

    try {

      await waitForFirebase();


      const pinHash =
        await window
          .getSharedPinHash();


      return !!pinHash;

    } catch (error) {

      console.error(
        "Failed to check shared PIN:",
        error
      );

      return false;

    }

  }


  /*
    RENDER PIN DOTS
  */

  function renderDots() {

    const el =
      dotsEl();


    el.innerHTML =
      "";


    for (
      let i = 0;
      i < PIN_LENGTH;
      i++
    ) {

      const dot =
        document.createElement(
          "div"
        );


      dot.className =
        "pin-dot" +
        (
          i < entry.length
            ? " filled"
            : ""
        );


      el.appendChild(
        dot
      );

    }

  }


  /*
    ERROR ANIMATION
  */

  function shakeDots(
    msg
  ) {

    const el =
      dotsEl();


    [
      ...el.children
    ].forEach(
      (dot) =>
        dot.classList.add(
          "error"
        )
    );


    messageEl()
      .textContent =
        msg;


    setTimeout(
      () => {

        [
          ...el.children
        ].forEach(
          (dot) =>
            dot.classList.remove(
              "error"
            )
        );

      },
      320
    );

  }


  /*
    CHANGE TITLE
  */

  function setTitle(
    text
  ) {

    titleEl()
      .textContent =
        text;

  }


  /*
    NUMBER PRESSED
  */

  async function onKey(
    digit
  ) {

    if (
      entry.length >=
      PIN_LENGTH
    ) {

      return;

    }


    entry +=
      digit;


    renderDots();


    if (
      entry.length ===
      PIN_LENGTH
    ) {

      await handleComplete();

    }

  }


  /*
    DELETE NUMBER
  */

  function onDelete() {

    entry =
      entry.slice(
        0,
        -1
      );


    renderDots();


    messageEl()
      .textContent =
        "";

  }


  /*
    HANDLE COMPLETE PIN
  */

  async function handleComplete() {

    /*
      FIRST PIN ENTRY
    */

    if (
      mode ===
      "set"
    ) {

      pendingFirstPin =
        entry;


      entry =
        "";


      mode =
        "confirm";


      setTitle(
        t(
          "pinConfirmTitle"
        )
      );


      renderDots();

      return;

    }


    /*
      CONFIRM FIRST PIN
    */

    if (
      mode ===
      "confirm"
    ) {

      if (
        entry !==
        pendingFirstPin
      ) {

        shakeDots(
          t(
            "pinMismatch"
          )
        );


        entry =
          "";


        mode =
          "set";


        pendingFirstPin =
          "";


        setTitle(
          t(
            "pinSetTitle"
          )
        );


        setTimeout(
          renderDots,
          320
        );

        return;

      }


      try {

        await waitForFirebase();


        const hash =
          await hashPin(
            entry
          );


        await window
          .saveSharedPinHash(
            hash
          );


        entry =
          "";


        pendingFirstPin =
          "";


        unlock();

      } catch (error) {

        console.error(
          "Failed to save shared PIN:",
          error
        );


        shakeDots(
          "Unable to save password."
        );


        entry =
          "";


        setTimeout(
          renderDots,
          320
        );

      }


      return;

    }


    /*
      NORMAL UNLOCK
    */

    if (
      mode ===
      "unlock"
    ) {

      try {

        await waitForFirebase();


        const enteredHash =
          await hashPin(
            entry
          );


        const storedHash =
          await window
            .getSharedPinHash();


        if (
          enteredHash ===
          storedHash
        ) {

          failCount =
            0;


          entry =
            "";


          unlock();

        } else {

          failCount++;


          shakeDots(
            t(
              "pinError"
            )
          );


          entry =
            "";


          setTimeout(
            renderDots,
            320
          );

        }

      } catch (error) {

        console.error(
          "PIN verification failed:",
          error
        );


        shakeDots(
          "Unable to verify password."
        );


        entry =
          "";


        setTimeout(
          renderDots,
          320
        );

      }

    }

  }


  /*
    UNLOCK APP
  */

  function unlock() {

    document
      .getElementById(
        "pin-screen"
      )
      .classList.remove(
        "active"
      );


    document
      .getElementById(
        "app-shell"
      )
      .classList.add(
        "active"
      );


    resetInactivityTimer();


    if (
      typeof onUnlocked ===
      "function"
    ) {

      onUnlocked();

    }

  }


  /*
    LOCK APP
  */

  async function lock() {

    entry =
      "";


    document
      .getElementById(
        "app-shell"
      )
      .classList.remove(
        "active"
      );


    const pinScreen =
      document.getElementById(
        "pin-screen"
      );


    pinScreen
      .classList.add(
        "active"
      );


    messageEl()
      .textContent =
        "";


    const pinExists =
      await hasSharedPin();


    if (
      pinExists
    ) {

      mode =
        "unlock";


      setTitle(
        t(
          "pinEnterTitle"
        )
      );

    } else {

      mode =
        "set";


      pendingFirstPin =
        "";


      setTitle(
        t(
          "pinSetTitle"
        )
      );

    }


    renderDots();

  }


  /*
    RESET INACTIVITY TIMER
  */

  function resetInactivityTimer() {

    clearTimeout(
      inactivityTimer
    );


    inactivityTimer =
      setTimeout(
        lock,
        INACTIVITY_LIMIT_MS
      );

  }


  /*
    INITIALIZE PIN SYSTEM
  */

  function init() {

    document
      .querySelectorAll(
        ".pin-key[data-digit]"
      )
      .forEach(
        (btn) => {

          btn.addEventListener(
            "click",
            () =>
              onKey(
                btn.dataset.digit
              )
          );

        }
      );


    document
      .getElementById(
        "pin-delete"
      )
      .addEventListener(
        "click",
        onDelete
      );


    document.addEventListener(
      "visibilitychange",
      () => {

        if (
          document.hidden
        ) {

          lock();

        }

      }
    );


    [
      "pointerdown",
      "keydown"
    ].forEach(
      (eventName) => {

        document.addEventListener(
          eventName,
          () => {

            if (
              document
                .getElementById(
                  "app-shell"
                )
                .classList.contains(
                  "active"
                )
            ) {

              resetInactivityTimer();

            }

          }
        );

      }
    );


    /*
      Always start locked.

      Firebase will determine
      whether to SET or UNLOCK.
    */

    lock();

  }


  return {
    init
  };

})();


document.addEventListener(
  "DOMContentLoaded",
  PinLock.init
);
