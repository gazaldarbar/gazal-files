/**
 * GAZAL FILES — LANGUAGE / TEXT CONFIG
 * ------------------------------------------------------------------
 * Every user-facing string lives here.
 * Malayalam wording is supplied by the owner.
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


    greeting: "ഗസൽ ദർബാർ",
    searchPlaceholder: "Search student name, ID, or phone",

    navHome: "Home",
    navStudents: "Students",
    navAttendance: "Attendance",
    navFees: "Fees",
    navMore: "More",

    statStudents: "Students",
    statClassesToday: "Courses",
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

  ml: {
    appName: "Gazal Files",

    pinEnterTitle: "Enter PIN",
    pinSetTitle: "Set a 4-digit PIN",
    pinConfirmTitle: "Confirm PIN",
    pinError: "Incorrect PIN",
    pinMismatch: "PINs did not match, try again",
    pinDelete: "Delete",

    greeting: "ഗസൽ ദർബാർ",
    searchPlaceholder: "സെർച്ച്",

    navHome: "ഹോം",
    navStudents: "സ്റ്റുഡൻ്റ്സ്",
    navAttendance: "അറ്റൻ്റൻസ്",
    navFees: "ഫീസ്",
    navMore: "More",

    statStudents: "സ്റ്റുഡൻസിൻ്റെ എണ്ണം",
    statClassesToday: "കോഴ്‌സുകൾ",
    statAttendanceToday: "ഇന്നത്തെ അറ്റൻ്റൻസ്",
    statPendingFees: "ഫീസ് ബാലൻസ്",

    actionNewStudent: " ന്യൂ അഡ്മിഷൻ",
    actionStudents: "സ്റ്റുഡൻ്റ്സ്",
    actionAttendance: "അറ്റൻ്റൻസ്",
    actionFees: "ഫീസ്",
    actionFeeBalance: "ഫീസ് ബാലൻസ്",
    actionPay: "QR CODE",

    todaysClasses: "ഇന്നത്തെ ക്ലാസുകൾ",
    noClassesToday: "ഇന്ന് ക്ലാസുകളില്ല",

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
};

const CURRENT_LANG = "ml";

/**
 * t(key) — text lookup with safe fallback to English.
 */
function t(key) {
  const lang = STRINGS[CURRENT_LANG] || {};
  return lang[key] || STRINGS.en[key] || `[${key}]`;
}
