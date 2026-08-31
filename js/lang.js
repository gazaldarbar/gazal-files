/**
 * GAZAL FILES — LANGUAGE / TEXT CONFIG
 * ------------------------------------------------------------------
 * Every user-facing string lives here, nowhere else. This is on purpose:
 * per the project spec, Malayalam wording must be supplied by the owner,
 * never auto-translated. Until that wording is provided, every key uses
 * plain English placeholder text so the app is fully usable and testable.
 *
 * TO ADD MALAYALAM LATER:
 *   1. Fill in the `ml` object below with the exact wording supplied.
 *   2. Set CURRENT_LANG = 'ml' at the bottom.
 *   3. No other file needs to change.
 *
 * Every string below marked "NEEDS MALAYALAM WORDING" is a place where
 * the owner's exact phrase is still required — nothing has been guessed.
 * ------------------------------------------------------------------
 */

const STRINGS = {
  en: {
    appName: "Gazal Files",
    pinEnterTitle: "Enter PIN",
    pinSetTitle: "Set a 4-digit PIN",
    pinConfirmTitle: "Confirm PIN",
    pinError: "Incorrect PIN",
    pinMismatch: "PINs did not match, try again",
    pinDelete: "Delete",

    greeting: "Today",
    searchPlaceholder: "Search student name, ID, or phone",

    navHome: "Home",
    navStudents: "Students",
    navAttendance: "Attendance",
    navFees: "Fees",
    navMore: "More",

    statStudents: "Students",
    statClassesToday: "Today's Classes",
    statAttendanceToday: "Today's Attendance",
    statPendingFees: "Pending Fees",

    actionNewStudent: "New Student",
    actionStudents: "Students",
    actionAttendance: "Attendance",
    actionFees: "Fees",
    actionFeeBalance: "Fee Balance",
    actionPay: "Pay",

    todaysClasses: "Today's Classes",
    noClassesToday: "No classes scheduled for today",

    syncSynced: "All data synced",
    syncWaiting: "Waiting for internet",
    syncSyncing: "Syncing…",
    syncError: "Sync error",

    moreCourses: "Courses",
    moreReports: "Reports",
    moreBackup: "Backup",
    moreRestore: "Restore",
    moreSettings: "Settings",
    moreChangePin: "Change PIN",

    comingSoon: "This section is being built in a later phase.",
  },

  // NEEDS MALAYALAM WORDING — fill in with the owner's exact phrases.
  // Keys intentionally left blank/mirrored to English until supplied,
  // so nothing here is a guessed translation.
  ml: {
    // appName: "",
    // pinEnterTitle: "",
    // ... (same keys as `en` above — populate once wording is supplied)
  },
};

const CURRENT_LANG = "en"; // switch to 'ml' once Malayalam strings are filled in

/**
 * t(key) — text lookup with safe fallback to English so the app never
 * shows a blank label while Malayalam strings are still being filled in.
 */
function t(key) {
  const lang = STRINGS[CURRENT_LANG] || {};
  return lang[key] || STRINGS.en[key] || `[${key}]`;
}
