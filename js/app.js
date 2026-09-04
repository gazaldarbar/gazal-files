/**
 * GAZAL FILES — APP SHELL / HOME
 * ------------------------------------------------------------------
 * Phase 1 scope: navigation shell + Home dashboard with placeholder
 * data. Students/Attendance/Fees/More become real in later phases —
 * for now they show a simple "coming soon" panel so navigation can
 * be tested end-to-end.
 * ------------------------------------------------------------------
 */

function onUnlocked() {
  renderHome();
  renderNav();
  renderSyncStatus();
  setupAddStudentFeature();
}

function renderHome() {
  document.getElementById("greeting").textContent = t("greeting");
  document.getElementById("search-input").placeholder = t("searchPlaceholder");
  

  // Placeholder stats — wired to real data in Phase 2/3/4.
  /*
  HOME DASHBOARD —
  LOAD TOTAL STUDENTS
*/

(async () => {

  try {

    let students = [];

    if (
      window.getStudentsFromFirestore
    ) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

    document.getElementById(
      "stat-students"
    ).textContent =
      students.length;

  } catch (error) {

    console.error(
      "Failed to load dashboard students:",
      error
    );

    document.getElementById(
      "stat-students"
    ).textContent = "—";

  }

})();
  document.getElementById("stat-classes").textContent =
  GAZAL_COURSES.length;
  /*
  HOME DASHBOARD —
  LOAD TODAY'S ATTENDANCE
*/

(async () => {

  try {

    let attendanceRecords = [];

    if (
      window.getAttendanceFromFirestore
    ) {

      attendanceRecords =
        await window.getAttendanceFromFirestore();

    } else {

      attendanceRecords = JSON.parse(
        localStorage.getItem(
          "gazal_attendance"
        ) || "[]"
      );

    }


    /*
      Get today's date in the same
      YYYY-MM-DD format used by attendance.
    */

    const today =
      new Date()
        .toISOString()
        .split("T")[0];


    /*
      Find today's attendance records.
    */

    const todaysRecords =
      attendanceRecords.filter(
        (record) =>
          record.date === today
      );


    let presentCount = 0;

    let markedCount = 0;


    todaysRecords.forEach(
      (record) => {

        record.students.forEach(
          (attendanceStudent) => {

            if (
              attendanceStudent.status ===
              "present"
            ) {

              presentCount++;

            }


            if (
              attendanceStudent.status ===
                "present" ||
              attendanceStudent.status ===
                "absent"
            ) {

              markedCount++;

            }

          }
        );

      }
    );


    /*
      Calculate attendance percentage.
    */

    const attendancePercentage =
      markedCount > 0
        ? Math.round(
            (presentCount / markedCount) * 100
          )
        : 0;


    /*
      Display:
      18 (90%)
    */

    document.getElementById(
      "stat-attendance"
    ).textContent =
      markedCount > 0
        ? `${presentCount} (${attendancePercentage}%)`
        : "—";

  } catch (error) {

    console.error(
      "Failed to load today's attendance:",
      error
    );

    document.getElementById(
      "stat-attendance"
    ).textContent = "—";

  }

})();
  document.getElementById("stat-fees").textContent = "—";

  setActionButton("btn-new-student", "plus", t("actionNewStudent"));
  setActionButton("btn-fee-balance", "fees", t("actionFeeBalance"));
  setActionButton("btn-pay", "pay", t("actionPay"));

  document.getElementById("todays-classes-title").textContent = t("todaysClasses");
  document.getElementById("todays-classes-empty").textContent = t("noClassesToday");
  setupStudentSearch();
}

function setActionButton(id, iconName, label) {
  const btn = document.getElementById(id);
  btn.querySelector(".icon-badge").innerHTML = icon(iconName);
  btn.querySelector(".label").textContent = label;
}

function renderSyncStatus() {
  const dot = document.getElementById("sync-dot");
  const label = document.getElementById("sync-label");
  // Phase 1: no backend yet, so this is a static placeholder.
  // Phase 5 wires this to real Firestore pending-write state.
  dot.className = "sync-dot waiting";
  label.textContent = t("syncWaiting") + " (offline mode — cloud sync not yet connected)";
}

const NAV_ITEMS = [
  { key: "home", icon: "home", labelKey: "navHome" },
  { key: "students", icon: "students", labelKey: "navStudents" },
  { key: "attendance", icon: "attendance", labelKey: "navAttendance" },
  { key: "fees", icon: "fees", labelKey: "navFees" },
  { key: "more", icon: "more", labelKey: "navMore" },
];

function renderNav() {
  const nav = document.getElementById("bottom-nav");
  nav.innerHTML = "";
  NAV_ITEMS.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.className = "nav-item" + (i === 0 ? " active" : "");
    btn.innerHTML = `<span class="nav-icon-wrap">${icon(item.icon)}</span><span>${t(item.labelKey)}</span>`;
    btn.addEventListener("click", () => selectTab(item.key, btn));
    nav.appendChild(btn);
  });
}

function selectTab(key, btnEl) {
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));

  btnEl.classList.add("active");
  document.getElementById("fees-panel").style.display = "none";

  // ================================================================
  // HIDE ALL MAIN PANELS FIRST
  // This prevents multiple sections appearing on screen together.
  // ================================================================
  const panels = [
  "home-panel",
  "students-panel",
  "add-student-panel",
  "attendance-panel",
  "fees-panel",
  "more-panel",
  "change-password-panel",
  "notes-panel",
  "institute-profile-panel",
  "placeholder-panel"
];

  panels.forEach((id) => {
    const panel = document.getElementById(id);

    if (panel) {
      panel.style.display = "none";
    }
  });

  hideStudentAttendancePanel();


  
  // ================================================================
  // HOME
  // ================================================================
  if (key === "home") {
    document.getElementById("home-panel").style.display = "block";
    return;
  }

  // ================================================================
  // STUDENTS
  // ================================================================
  if (key === "students") {
    document.getElementById("students-panel").style.display = "block";

    renderStudentsCourseList();
    return;
  }

  // ================================================================
  // ATTENDANCE
  // ================================================================
  if (key === "attendance") {
    document.getElementById("attendance-panel").style.display = "block";
    return;
  }

  if (key === "fees") {
  document.getElementById("home-panel").style.display = "none";
  document.getElementById("students-panel").style.display = "none";
  document.getElementById("attendance-panel").style.display = "none";
  document.getElementById("add-student-panel").style.display = "none";
  document.getElementById("placeholder-panel").style.display = "none";

  document.getElementById("fees-panel").style.display = "block";
    renderFeesStudents();

  return;
  }

// ================================================================
// MORE
// ================================================================
if (key === "more") {

  document.getElementById(
    "more-panel"
  ).style.display =
    "block";

  return;

}
  
  // ================================================================
  // OTHER SECTIONS — PLACEHOLDER
  // ================================================================
  const panel = document.getElementById("placeholder-panel");

  panel.style.display = "block";

  panel.querySelector(".section-title").textContent = t(
    NAV_ITEMS.find((n) => n.key === key).labelKey
  );

  panel.querySelector(".placeholder-note").textContent = t("comingSoon");
}
/* ==========================================================================
   ADD STUDENT FEATURE START
   Reversible: remove this entire block to remove Add Student navigation.
   ========================================================================== */

function setupAddStudentFeature() {
  const addButton = document.getElementById("btn-new-student");
  const cancelButton = document.getElementById("btn-cancel-student");
  const form = document.getElementById("add-student-form");

  if (addButton) {

  addButton.addEventListener(
    "click",
    () => {

      resetStudentPhoto();

      openAddStudentForm();

    }
  );

}


if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    () => {

      resetStudentPhoto();

      closeAddStudentForm();

    }
  );

}

  if (form) {
    form.addEventListener("submit", handleStudentFormSubmit);
  }

  /* ================================================================
   HOME — TODAY'S ATTENDANCE BUTTON
   ================================================================ */

const todayAttendanceButton =
  document.getElementById(
    "btn-today-attendance"
  );

if (todayAttendanceButton) {

  todayAttendanceButton.addEventListener(
    "click",
    () => {
      openTodayAttendancePopup();
    }
  );

}

/* ================================================================
   HOME — TOTAL COURSES BUTTON
   ================================================================ */

const totalCoursesButton =
  document.getElementById(
    "btn-total-courses"
  );

if (totalCoursesButton) {

  totalCoursesButton.addEventListener(
    "click",
    () => {
      openTotalCoursesPopup();
    }
  );

}
  
  loadCourseOptions();
  setAttendanceDateDefault();

  const attendanceCourse =
  document.getElementById("attendance-course");

if (attendanceCourse) {
  attendanceCourse.addEventListener(
    "change",
    renderAttendanceStudents
  );
}
  setupAttendanceModalControls();
  setupFingerprintAttendanceControls();
  setupAttendanceHistoryControls();
  setupAttendanceRecordDetailsControls();
  setupQrPopup();
  
}

function openAddStudentForm() {
  
  document.getElementById("home-panel").style.display = "none";
  document.getElementById("placeholder-panel").style.display = "none";
  document.getElementById("add-student-panel").style.display = "block";

  document
    .querySelectorAll(".nav-item")
    .forEach((button) => button.classList.remove("active"));

  document.getElementById("main-content").scrollTop = 0;
}

function closeAddStudentForm() {
  // Hide the form.
  document.getElementById("add-student-panel").style.display = "none";

  // Clear any typed or edited information.
  const form = document.getElementById("add-student-form");

  if (form) {
    form.reset();
  }

  

  // Exit Edit mode.
  editingStudentId = null;

  // Restore normal Add Student title.
  const formTitle = document.querySelector(
    "#add-student-panel .form-header h2"
  );

  if (formTitle) {
    formTitle.textContent = "Add Student";
  }

  // Keep the button label consistent.
  const saveButton = document.getElementById("btn-save-student");

  if (saveButton) {
    saveButton.textContent = "Save";
  }

  // Return to Home.
  document.getElementById("home-panel").style.display = "block";

  const homeNavButton = document.querySelector(".nav-item");

  if (homeNavButton) {
    document
      .querySelectorAll(".nav-item")
      .forEach((button) => button.classList.remove("active"));

    homeNavButton.classList.add("active");
  }
}

/* ================================================================
   STUDENTS — BACK NAVIGATION
   ================================================================ */

const studentsBackButton =
  document.getElementById(
    "students-back-button"
  );

if (studentsBackButton) {

  studentsBackButton.addEventListener(
    "click",
    () => {

      if (
        studentsView ===
        "student-details"
      ) {

        renderStudentsByCourse(
          selectedStudentsCourse
        );

        return;

      }


      if (
        studentsView ===
        "course-students"
      ) {

        renderStudentsCourseList();

        return;

      }

    }
  );

}

/* ================================================================
   STUDENT ATTENDANCE — BACK NAVIGATION
   ================================================================ */

const studentAttendanceBackButton =
  document.getElementById(
    "student-attendance-back"
  );

if (studentAttendanceBackButton) {

  studentAttendanceBackButton.addEventListener(
    "click",
    () => {

      const attendancePanel =
        document.getElementById(
          "student-attendance-panel"
        );

      const studentsPanel =
        document.getElementById(
          "students-panel"
        );


      attendancePanel.style.display =
        "none";

      studentsPanel.style.display =
        "block";


      /*
        Return to the same student's
        full details card.
      */

      if (selectedStudentId) {

        renderStudentFullDetails(
          selectedStudentId
        );

      }

    }
  );

}

/* ================================================================
   MORE — CHANGE PASSWORD NAVIGATION
   ================================================================ */

const changePasswordButton =
  document.getElementById(
    "change-password-button"
  );


const changePasswordPanel =
  document.getElementById(
    "change-password-panel"
  );


const morePanel =
  document.getElementById(
    "more-panel"
  );


const changePasswordBack =
  document.getElementById(
    "change-password-back"
  );


if (
  changePasswordButton &&
  changePasswordPanel &&
  morePanel
) {

  changePasswordButton.addEventListener(
    "click",
    () => {

      morePanel.style.display =
        "none";

      changePasswordPanel.style.display =
        "block";

    }
  );

}


if (
  changePasswordBack &&
  changePasswordPanel &&
  morePanel
) {

  changePasswordBack.addEventListener(
    "click",
    () => {

      changePasswordPanel.style.display =
        "none";

      morePanel.style.display =
        "block";

    }
  );

}

/* ================================================================
   MORE — NOTES NAVIGATION
   ================================================================ */

const notesButton =
  document.getElementById(
    "notes-button"
  );


const notesPanel =
  document.getElementById(
    "notes-panel"
  );


const notesBack =
  document.getElementById(
    "notes-back"
  );


if (
  notesButton &&
  notesPanel &&
  morePanel
) {

  notesButton.addEventListener(
    "click",
    () => {

      morePanel.style.display =
        "none";

      notesPanel.style.display =
        "block";

    }
  );

}


if (
  notesBack &&
  notesPanel &&
  morePanel
) {

  notesBack.addEventListener(
    "click",
    () => {

      notesPanel.style.display =
        "none";

      morePanel.style.display =
        "block";

    }
  );

}



/* ================================================================
   NOTES — FIRESTORE + LOCAL BACKUP
   ================================================================ */


/* ------------------------------------------------
   ELEMENTS
   ------------------------------------------------ */

const notesInput =
  document.getElementById(
    "notes-input"
  );


const saveNoteButton =
  document.getElementById(
    "save-note-button"
  );


const notesList =
  document.getElementById(
    "notes-list"
  );


/* ------------------------------------------------
   GET LOCAL NOTES
   ------------------------------------------------ */

function getNotes() {

  return JSON.parse(
    localStorage.getItem(
      "gazal_notes"
    ) || "[]"
  );

}


/* ------------------------------------------------
   SAVE LOCAL NOTES
   ------------------------------------------------ */

function saveNotes(
  notes
) {

  localStorage.setItem(
    "gazal_notes",
    JSON.stringify(
      notes
    )
  );

}


/* ------------------------------------------------
   FORMAT DATE
   ------------------------------------------------ */

function formatNoteDate(
  dateString
) {

  const date =
    new Date(
      dateString
    );


  return date.toLocaleString(
    "en-IN",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short"
    }
  );

}


/* ------------------------------------------------
   ESCAPE HTML
   ------------------------------------------------ */

function escapeNoteHtml(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


/* ------------------------------------------------
   RENDER NOTES
   ------------------------------------------------ */

function renderNotes() {

  if (
    !notesList
  ) {

    return;

  }


  const notes =
    getNotes();


  /*
    EMPTY STATE
  */

  if (
    notes.length === 0
  ) {

    notesList.innerHTML =
      `
        <div class="notes-empty">

          No notes yet.
          <br>

          Write your first office note above.

        </div>
      `;

    return;

  }


  /*
    NEWEST NOTE FIRST
  */

  notes.sort(
    (a, b) =>
      new Date(
        b.createdAt
      ) -
      new Date(
        a.createdAt
      )
  );


  /*
    SHOW NOTES
  */

  notesList.innerHTML =
    notes
      .map(
        (note) =>
          `
            <div
              class="note-card"
              data-note-id="${note.id}"
            >

              <button
                type="button"
                class="note-delete-button"
                data-note-id="${note.id}"
                aria-label="Delete note"
              >
                🗑
              </button>


              <div
                class="note-card-text"
              >
                ${escapeNoteHtml(
                  note.text
                )}
              </div>


              <div
                class="note-card-date"
              >
                ${formatNoteDate(
                  note.createdAt
                )}
              </div>

            </div>
          `
      )
      .join(
        ""
      );


  setupNoteDeleteButtons();

}


/* ------------------------------------------------
   LOAD NOTES FROM FIRESTORE
   ------------------------------------------------ */

/* ------------------------------------------------
   LOAD NOTES FROM FIRESTORE
   ------------------------------------------------ */

async function loadNotesFromCloud() {

  /*
    WAIT UNTIL FIREBASE NOTES
    FUNCTION BECOMES AVAILABLE
  */

  await new Promise(
    (resolve) => {

      const checkFirebase =
        () => {

          if (
            window.getNotesFromFirestore
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


  try {

    const cloudNotes =
      await window
        .getNotesFromFirestore();


    console.log(
      "NOTES LOADED FROM FIRESTORE:",
      cloudNotes
    );


    if (
      !Array.isArray(
        cloudNotes
      )
    ) {

      return;

    }


    /*
      SAVE CLOUD NOTES
      TO LOCAL STORAGE
    */

    saveNotes(
      cloudNotes
    );


    /*
      DISPLAY NOTES
    */

    renderNotes();


  } catch (error) {

    console.error(
      "Failed to load notes from Firestore:",
      error
    );


    /*
      LOCAL NOTES STILL WORK
    */

    renderNotes();

  }

}


/* ------------------------------------------------
   SAVE NEW NOTE
   ------------------------------------------------ */

if (
  saveNoteButton &&
  notesInput
) {

  saveNoteButton.addEventListener(
    "click",
    async () => {

      const text =
        notesInput.value.trim();


      /*
        PREVENT EMPTY NOTE
      */

      if (
        !text
      ) {

        alert(
          "Please write a note first."
        );

        return;

      }


      const newNote = {

        id:
          "note_" +
          Date.now(),

        text:
          text,

        createdAt:
          new Date()
            .toISOString()

      };


      try {

        /*
          PREVENT DOUBLE CLICK
        */

        saveNoteButton.disabled =
          true;


        /*
          SAVE TO FIRESTORE
        */

        if (
          window.saveNoteToFirestore
        ) {

          await window
            .saveNoteToFirestore(
              newNote
            );

        }


        /*
          UPDATE LOCAL BACKUP
        */

        const notes =
          getNotes();


        notes.unshift(
          newNote
        );


        saveNotes(
          notes
        );


        /*
          CLEAR INPUT
        */

        notesInput.value =
          "";


        /*
          UPDATE SCREEN
        */

        renderNotes();


      } catch (error) {

        console.error(
          "Failed to save note:",
          error
        );


        alert(
          "Unable to save note."
        );


      } finally {

        saveNoteButton.disabled =
          false;

      }

    }
  );

}


/* ------------------------------------------------
   DELETE BUTTONS
   ------------------------------------------------ */

function setupNoteDeleteButtons() {

  document
    .querySelectorAll(
      ".note-delete-button"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            const noteId =
              button.dataset.noteId;


            const confirmed =
              confirm(
                "Delete this note?"
              );


            if (
              !confirmed
            ) {

              return;

            }


            try {

              /*
                DELETE FROM FIRESTORE
              */

              if (
                window.deleteNoteFromFirestore
              ) {

                await window
                  .deleteNoteFromFirestore(
                    noteId
                  );

              }


              /*
                DELETE FROM LOCAL BACKUP
              */

              const notes =
                getNotes();


              const updatedNotes =
                notes.filter(
                  (note) =>
                    note.id !==
                    noteId
                );


              saveNotes(
                updatedNotes
              );


              renderNotes();


            } catch (error) {

              console.error(
                "Failed to delete note:",
                error
              );


              alert(
                "Unable to delete note."
              );

            }

          }
        );

      }
    );

}


/* ------------------------------------------------
   INITIAL RENDER
   ------------------------------------------------ */

renderNotes();


/* ------------------------------------------------
   LOAD CLOUD NOTES
   ------------------------------------------------ */

loadNotesFromCloud();

/* ================================================================
   CHANGE PASSWORD FUNCTIONALITY
   ================================================================ */

const changePasswordCurrent =
  document.getElementById(
    "change-password-current"
  );


const changePasswordNew =
  document.getElementById(
    "change-password-new"
  );


const changePasswordConfirm =
  document.getElementById(
    "change-password-confirm"
  );


const saveNewPasswordButton =
  document.getElementById(
    "save-new-password-button"
  );


async function hashSharedPassword(
  password
) {

  const encoder =
    new TextEncoder();


  const data =
  encoder.encode(
    "gazal-darbar-shared-pin:" +
    password
  );


  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );


  return Array
    .from(
      new Uint8Array(
        hashBuffer
      )
    )
    .map(
      (byte) =>
        byte
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


/* ================================================================
   UPDATE PASSWORD
   ================================================================ */

if (
  saveNewPasswordButton &&
  changePasswordCurrent &&
  changePasswordNew &&
  changePasswordConfirm
) {

  saveNewPasswordButton.addEventListener(
    "click",
    async () => {

      const currentPassword =
        changePasswordCurrent.value.trim();


      const newPassword =
        changePasswordNew.value.trim();


      const confirmPassword =
        changePasswordConfirm.value.trim();


      /* ------------------------------------------------
         Validate all fields
         ------------------------------------------------ */

      if (
        currentPassword.length !== 4 ||
        newPassword.length !== 4 ||
        confirmPassword.length !== 4
      ) {

        alert(
          "Please enter a valid 4-digit password."
        );

        return;

      }


      /* ------------------------------------------------
         New passwords must match
         ------------------------------------------------ */

      if (
        newPassword !==
        confirmPassword
      ) {

        alert(
          "New passwords do not match."
        );

        return;

      }


      try {

        saveNewPasswordButton.disabled =
          true;

        saveNewPasswordButton.textContent =
          "Updating...";

        if (
  !window.getSharedPinHash ||
  !window.saveSharedPinHash
) {

  alert(
    "Security system is still loading. Please try again."
  );

  return;

        }


        /* ------------------------------------------------
           Hash current password
           ------------------------------------------------ */

        const currentPasswordHash =
          await hashSharedPassword(
            currentPassword
          );


        /* ------------------------------------------------
           Get Firebase password hash
           ------------------------------------------------ */

        const storedPasswordHash =
          await window
            .getSharedPinHash();


        /* ------------------------------------------------
           Verify current password
           ------------------------------------------------ */

        if (
          currentPasswordHash !==
          storedPasswordHash
        ) {

          alert(
            "Current password is incorrect."
          );

          return;

        }


        /* ------------------------------------------------
           Hash new password
           ------------------------------------------------ */

        const newPasswordHash =
          await hashSharedPassword(
            newPassword
          );


        /* ------------------------------------------------
           Save new password hash
           ------------------------------------------------ */

        await window
          .saveSharedPinHash(
            newPasswordHash
          );


        /* ------------------------------------------------
           Success
           ------------------------------------------------ */

        changePasswordCurrent.value =
          "";

        changePasswordNew.value =
          "";

        changePasswordConfirm.value =
          "";


        alert(
          "Password updated successfully."
        );


      } catch (error) {

        console.error(
          "Failed to update password:",
          error
        );


        alert(
          "Unable to update password."
        );

      } finally {

        saveNewPasswordButton.disabled =
          false;

        saveNewPasswordButton.textContent =
          "Update Password";

      }

    }
  );

}

/* ================================================================
   INSTITUTE PROFILE NAVIGATION
   ================================================================ */

const instituteProfileButton =
  document.getElementById(
    "institute-profile-button"
  );


const instituteProfileBackButton =
  document.getElementById(
    "institute-profile-back"
  );


if (
  instituteProfileButton
) {

  instituteProfileButton.addEventListener(
  "click",
  async () => {

      /*
        Hide More panel.
      */

      document.getElementById(
        "more-panel"
      ).style.display =
        "none";


      /*
        Show Institute Profile.
      */

      document.getElementById(
        "institute-profile-panel"
      ).style.display =
        "block";
    await loadInstituteProfile();


      /*
        Scroll to top.
      */

      document.getElementById(
        "main-content"
      ).scrollTop =
        0;

    }
  );

}


if (
  instituteProfileBackButton
) {

  instituteProfileBackButton.addEventListener(
    "click",
    () => {

      /*
        Hide Institute Profile.
      */

      document.getElementById(
        "institute-profile-panel"
      ).style.display =
        "none";


      /*
        Return to More.
      */

      document.getElementById(
        "more-panel"
      ).style.display =
        "block";


      /*
        Scroll to top.
      */

      document.getElementById(
        "main-content"
      ).scrollTop =
        0;

    }
  );

}


/* ================================================================
   INSTITUTE LOGO UPLOAD
   FIRESTORE BASE64 VERSION
   ================================================================ */

const uploadInstituteLogoButton =
  document.getElementById(
    "upload-institute-logo-button"
  );


const instituteLogoInput =
  document.getElementById(
    "institute-logo-input"
  );


const instituteLogoImage =
  document.getElementById(
    "institute-logo-image"
  );


const instituteLogoPlaceholder =
  document.getElementById(
    "institute-logo-placeholder"
  );


/* ------------------------------------------------
   OPEN IMAGE PICKER
   ------------------------------------------------ */

if (
  uploadInstituteLogoButton &&
  instituteLogoInput
) {

  uploadInstituteLogoButton.addEventListener(
    "click",
    () => {

      instituteLogoInput.value =
        "";

      instituteLogoInput.click();

    }
  );

}


/* ------------------------------------------------
   RESIZE + COMPRESS IMAGE
   ------------------------------------------------ */

function compressInstituteLogo(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () => {

          const image =
            new Image();


          image.onload =
            () => {

              const maxSize =
                500;


              let width =
                image.width;


              let height =
                image.height;


              /*
                Keep image proportions.
              */

              if (
                width > height &&
                width > maxSize
              ) {

                height =
                  Math.round(
                    height *
                    (
                      maxSize /
                      width
                    )
                  );

                width =
                  maxSize;

              } else if (
                height > maxSize
              ) {

                width =
                  Math.round(
                    width *
                    (
                      maxSize /
                      height
                    )
                  );

                height =
                  maxSize;

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;


              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              /*
                Convert compressed image
                to JPEG Base64.
              */

              const compressedImage =
                canvas.toDataURL(
                  "image/jpeg",
                  0.85
                );


              resolve(
                compressedImage
              );

            };


          image.onerror =
            () => {

              reject(
                new Error(
                  "Failed to process image."
                )
              );

            };


          image.src =
            reader.result;

        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "Failed to read image."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* ------------------------------------------------
   SELECT + PREVIEW + SAVE TO FIRESTORE
   ------------------------------------------------ */

if (
  instituteLogoInput
) {

  instituteLogoInput.addEventListener(
    "change",
    async () => {

      const file =
        instituteLogoInput.files[0];


      if (
        !file ||
        !file.type.startsWith(
          "image/"
        )
      ) {

        return;

      }


      // 👇 REPLACE YOUR OLD TRY/CATCH HERE
      try {

        console.log(
          "STEP 1: Image selected:",
          file.name
        );

        uploadInstituteLogoButton.textContent =
          "Compressing...";

        uploadInstituteLogoButton.disabled =
          true;

        console.log(
          "STEP 2: Starting image compression"
        );

        const logoData =
          await compressInstituteLogo(
            file
          );

        console.log(
          "STEP 3: Compression completed"
        );

        console.log(
          "Logo Base64 size:",
          logoData.length
        );

        uploadInstituteLogoButton.textContent =
          "Saving...";

        instituteLogoImage.src =
          logoData;

        instituteLogoImage.style.display =
          "block";

        instituteLogoPlaceholder.style.display =
          "none";

        console.log(
          "STEP 4: Starting Firestore save"
        );

        await window
          .saveInstituteProfileToFirestore(
            {
              logoData:
                logoData
            }
          );

        console.log(
          "STEP 5: Firestore save completed"
        );

        uploadInstituteLogoButton.textContent =
          "Change Logo";

        uploadInstituteLogoButton.disabled =
          false;

        alert(
          "Institute logo saved successfully!"
        );

      } catch (error) {

        console.error(
          "Failed to save institute logo:",
          error
        );

        uploadInstituteLogoButton.textContent =
          "Upload Logo";

        uploadInstituteLogoButton.disabled =
          false;

        alert(
          "Failed to save institute logo: " +
          error.message
        );

      }

    }
  );

}
        
/* ================================================================
   INSTITUTE PROFILE EDIT / SAVE
   ================================================================ */

const editInstituteProfileButton =
  document.getElementById(
    "edit-institute-profile-button"
  );


let instituteProfileEditMode =
  false;


/* ------------------------------------------------
   PROFILE FIELD KEYS
   ------------------------------------------------ */

const instituteProfileFieldKeys = [
  "instituteName",
  "tagline",
  "established",
  "legacy",
  "address",
  "district",
  "state",
  "pinCode",
  "phone",
  "whatsapp",
  "email",
  "website",
  "founder",
  "designation"
];


/* ------------------------------------------------
   EDIT / SAVE BUTTON
   ------------------------------------------------ */

if (
  editInstituteProfileButton
) {

  editInstituteProfileButton.addEventListener(
    "click",
    async () => {


      /* ============================================
         ENTER EDIT MODE
         ============================================ */

      if (
        !instituteProfileEditMode
      ) {

        const profileRows =
          document.querySelectorAll(
            "#institute-profile-panel .profile-info-row"
          );


        profileRows.forEach(
          (row, index) => {

            const valueElement =
              row.querySelector(
                "strong"
              );


            if (
              !valueElement
            ) {

              return;

            }


            const currentValue =
              valueElement.textContent.trim();


            const input =
              document.createElement(
                "input"
              );


            input.type =
              "text";


            input.value =
              currentValue;


            input.className =
              "institute-profile-edit-input";


            input.dataset.profileKey =
              instituteProfileFieldKeys[
                index
              ];


            valueElement.replaceWith(
              input
            );

          }
        );


        editInstituteProfileButton.textContent =
          "Save Institute Profile";


        instituteProfileEditMode =
          true;


        return;

      }


      /* ============================================
         SAVE PROFILE
         ============================================ */

      const profile =
        {};


      const profileInputs =
        document.querySelectorAll(
          "#institute-profile-panel .institute-profile-edit-input"
        );


      profileInputs.forEach(
        (input) => {

          const key =
            input.dataset.profileKey;


          profile[key] =
            input.value.trim();

        }
      );


      try {

        if (
          window.saveInstituteProfileToFirestore
        ) {

          await window
            .saveInstituteProfileToFirestore(
              profile
            );

        }


        /*
          Convert inputs back to normal text.
        */

        profileInputs.forEach(
          (input) => {

            const strong =
              document.createElement(
                "strong"
              );


            strong.textContent =
              input.value.trim();


            input.replaceWith(
              strong
            );

          }
        );


        editInstituteProfileButton.textContent =
          "Edit Institute Profile";


        instituteProfileEditMode =
          false;


        alert(
          "Institute profile saved successfully!"
        );

      } catch (error) {

        console.error(
          "Failed to save institute profile:",
          error
        );


        alert(
          "Failed to save institute profile."
        );

      }

    }
  );

}


/* ================================================================
   LOAD INSTITUTE PROFILE FROM FIREBASE
   ================================================================ */

async function loadInstituteProfile() {

  try {

    if (
      !window.getInstituteProfileFromFirestore
    ) {

      console.error(
        "Institute profile load function not available."
      );

      return;

    }


    const profile =
      await window
        .getInstituteProfileFromFirestore();


    /*
      No saved profile yet.
    */

    if (
      !profile
    ) {

      console.log(
        "No saved institute profile found."
      );

      return;

    }


    const profileRows =
      document.querySelectorAll(
        "#institute-profile-panel .profile-info-row"
      );


    profileRows.forEach(
      (row, index) => {

        const key =
          instituteProfileFieldKeys[
            index
          ];


        const value =
          profile[key];


        /*
          Only replace fields that exist
          in Firestore.
        */

        if (
          value === undefined ||
          value === null
        ) {

          return;

        }


        const valueElement =
          row.querySelector(
            "strong"
          );


        if (
          valueElement
        ) {

          valueElement.textContent =
            value;

        }

      }
    );

    /* ============================================
       LOAD INSTITUTE LOGO
       ============================================ */

    if (
      profile.logoData
    ) {

      instituteLogoImage.src =
        profile.logoData;


      instituteLogoImage.style.display =
        "block";


      instituteLogoPlaceholder.style.display =
        "none";


      console.log(
        "Institute logo loaded from Firestore."
      );

    } else {

      /*
        No logo saved.
        Show default placeholder.
      */

      instituteLogoImage.src =
        "";


      instituteLogoImage.style.display =
        "none";


      instituteLogoPlaceholder.style.display =
        "flex";

    }
    
    console.log(
      "Institute profile loaded successfully."
    );

  } catch (error) {

    console.error(
      "Failed to load institute profile:",
      error
    );

  }

}
      
/* ==========================================================================
   STUDENT ID GENERATOR START
   ========================================================================== */

async function generateStudentId() {

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

  } catch (error) {

    console.error(
      "Failed to load students for ID generation:",
      error
    );

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


  /*
    Find the highest existing
    GZ-XXXX number.
  */

  let highestNumber = 0;

  students.forEach((student) => {

    const match =
      String(student.id || "")
        .match(/^GZ-(\d+)$/);

    if (match) {

      const number =
        parseInt(match[1], 10);

      if (number > highestNumber) {
        highestNumber = number;
      }

    }

  });


  const nextNumber =
    highestNumber + 1;


  return (
    "GZ-" +
    String(nextNumber).padStart(4, "0")
  );

}

/* STUDENT ID GENERATOR END */

/* ================================================================
   STUDENT PHOTO SYSTEM
   ================================================================ */

const takeStudentPhotoButton =
  document.getElementById(
    "btn-take-student-photo"
  );


const uploadStudentPhotoButton =
  document.getElementById(
    "btn-upload-student-photo"
  );


const studentCameraInput =
  document.getElementById(
    "student-camera-input"
  );


const studentGalleryInput =
  document.getElementById(
    "student-gallery-input"
  );


const studentPhotoImage =
  document.getElementById(
    "student-photo-image"
  );


const studentPhotoPlaceholder =
  document.getElementById(
    "student-photo-placeholder"
  );


let selectedStudentPhotoFile =
  null;


/*
  Compressed Base64 version
  that will be saved permanently
  in Firestore.
*/

let selectedStudentPhotoData =
  null;


/* ------------------------------------------------
   TAKE PHOTO
   ------------------------------------------------ */

if (
  takeStudentPhotoButton &&
  studentCameraInput
) {

  takeStudentPhotoButton.addEventListener(
    "click",
    () => {

      window.studentPhotoPickerOpen =
        true;

      studentCameraInput.value =
        "";

      studentCameraInput.click();

    }
  );

}


/* ------------------------------------------------
   UPLOAD PHOTO
   ------------------------------------------------ */

if (
  uploadStudentPhotoButton &&
  studentGalleryInput
) {

  uploadStudentPhotoButton.addEventListener(
    "click",
    () => {

      window.studentPhotoPickerOpen =
        true;

      studentGalleryInput.value =
        "";

      studentGalleryInput.click();

    }
  );

}


/* ================================================================
   preview student
   ================================================================ */


function previewStudentPhoto(
  file
) {

  if (
    !file ||
    !file.type.startsWith(
      "image/"
    )
  ) {

    window.studentPhotoPickerOpen =
      false;

    return;

  }


  selectedStudentPhotoFile =
    file;


  /*
    Preview original selected image.
  */

  const reader =
    new FileReader();


  reader.onload =
    () => {

      if (
        studentPhotoImage
      ) {

        studentPhotoImage.src =
          reader.result;


        studentPhotoImage.style.display =
          "block";

      }


      if (
        studentPhotoPlaceholder
      ) {

        studentPhotoPlaceholder.style.display =
          "none";

      }


      window.studentPhotoPickerOpen =
        false;

    };


  reader.readAsDataURL(
    file
  );

}


/* ================================================================
   COMPRESS STUDENT PHOTO
   ================================================================ */

function compressStudentPhoto(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () => {

          const image =
            new Image();


          image.onload =
            () => {

              /*
                Maximum image size.

                Student photos do not need
                to be extremely large.
              */

              const maxSize =
                500;


              let width =
                image.width;


              let height =
                image.height;


              /*
                Keep original proportions.
              */

              if (
                width > height &&
                width > maxSize
              ) {

                height =
                  Math.round(
                    height *
                    (
                      maxSize /
                      width
                    )
                  );


                width =
                  maxSize;

              }

              else if (
                height > maxSize
              ) {

                width =
                  Math.round(
                    width *
                    (
                      maxSize /
                      height
                    )
                  );


                height =
                  maxSize;

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;


              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              /*
                Convert to compressed JPEG Base64.
              */

              const compressedPhoto =
                canvas.toDataURL(
                  "image/jpeg",
                  0.80
                );


              resolve(
                compressedPhoto
              );

            };


          image.onerror =
            () => {

              reject(
                new Error(
                  "Failed to process student photo."
                )
              );

            };


          image.src =
            reader.result;

        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "Failed to read student photo."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}
 

/* ------------------------------------------------
   CAMERA PHOTO SELECTED
   ------------------------------------------------ */

if (
  studentCameraInput
) {

  studentCameraInput.addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];


      previewStudentPhoto(
        file
      );

    }
  );

}


/* ------------------------------------------------
   GALLERY PHOTO SELECTED
   ------------------------------------------------ */

if (
  studentGalleryInput
) {

  studentGalleryInput.addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];


      previewStudentPhoto(
        file
      );

    }
  );

}


/* ------------------------------------------------
   WHEN APP RETURNS FROM CAMERA/GALLERY
   ------------------------------------------------ */

window.addEventListener(
  "focus",
  () => {

    setTimeout(
      () => {

        window.studentPhotoPickerOpen =
          false;

      },
      500
    );

  }
);


/* ================================================================
   RESET STUDENT PHOTO
   ================================================================ */

function resetStudentPhoto() {

  selectedStudentPhotoFile =
    null;

  selectedStudentPhotoData =
  null;


  if (
    studentPhotoImage
  ) {

    studentPhotoImage.src =
      "";

    studentPhotoImage.style.display =
      "none";

  }


  if (
    studentPhotoPlaceholder
  ) {

    studentPhotoPlaceholder.style.display =
      "flex";

  }


  if (
    studentCameraInput
  ) {

    studentCameraInput.value =
      "";

  }


  if (
    studentGalleryInput
  ) {

    studentGalleryInput.value =
      "";

  }


  window.studentPhotoPickerOpen =
    false;

}

/* ==========================================================================
   STUDENT LOCAL MEMORY FEATURE START
   Reversible: this section saves students in this device's localStorage.
   ========================================================================== */
async function handleStudentFormSubmit(event) {

  event.preventDefault();


  /*
    LOAD CURRENT STUDENTS

    Firestore is the primary database.
    localStorage is the fallback backup.
  */

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

  } catch (error) {

    console.error(
      "Failed to load students:",
      error
    );

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


/*
  GET FORM DATA
*/

const studentData = {

  studentName:
    document.getElementById(
      "student-name"
    ).value.trim(),

  parentName:
    document.getElementById(
      "parent-name"
    ).value.trim(),

  place:
    document.getElementById(
      "student-place"
    ).value.trim(),

  phone:
    document.getElementById(
      "student-phone"
    ).value.trim(),

  backupPhone:
    document.getElementById(
      "backup-phone"
    ).value.trim(),

  course:
    document.getElementById(
      "student-course"
    ).value,

  admissionDate:
    document.getElementById(
      "admission-date"
    ).value

};


/* ================================================================
   PROCESS STUDENT PHOTO
   ================================================================ */

if (
  selectedStudentPhotoFile
) {

  try {

    console.log(
      "Compressing student photo..."
    );


    selectedStudentPhotoData =
      await compressStudentPhoto(
        selectedStudentPhotoFile
      );


    console.log(
      "Student photo compressed successfully."
    );


    console.log(
      "Photo Base64 size:",
      selectedStudentPhotoData.length
    );

  } catch (error) {

    console.error(
      "Student photo compression failed:",
      error
    );


    alert(
      "Student photo could not be processed."
    );


    return;

  }

}



  let savedStudent = null;


  /*
    EDIT EXISTING STUDENT
  */

  if (editingStudentId) {

    const studentIndex =
      students.findIndex(
        (student) =>
          student.id ===
          editingStudentId
      );


    if (studentIndex === -1) {

      alert(
        "Student could not be found. Please try again."
      );

      return;

    }


    savedStudent = {

  ...students[studentIndex],

  ...studentData,


  /*
    Only replace existing photo
    if the user selected a new one.
  */

  photoData:
    selectedStudentPhotoData ||
    students[studentIndex].photoData ||
    null,


  updatedAt:
    new Date().toISOString()

};

    /*
      Update Firestore first.
    */

    if (window.saveStudentToFirestore) {

      try {

        await window.saveStudentToFirestore(
          savedStudent
        );

      } catch (error) {

        console.error(
          "Student update failed:",
          error
        );

        alert(
          "Student could not be updated in the cloud."
        );

        return;

      }

    }


    /*
      Update local backup.
    */

    students[studentIndex] =
      savedStudent;

  }


  /*
    ADD NEW STUDENT
  */

  else {

    savedStudent = {

  id:
    await generateStudentId(),

  ...studentData,


  /*
    Permanent compressed student photo.
  */

  photoData:
    selectedStudentPhotoData ||
    null,


  createdAt:
    new Date().toISOString()

};


    /*
      Save new student to Firestore.
    */

    if (window.saveStudentToFirestore) {

      try {

        await window.saveStudentToFirestore(
          savedStudent
        );

      } catch (error) {

        console.error(
          "Student save failed:",
          error
        );

        alert(
          "Student could not be saved in the cloud."
        );

        return;

      }

    }


    students.push(
      savedStudent
    );

  }


  /*
    SYNC LOCAL BACKUP
  */

  localStorage.setItem(
    "gazal_students",
    JSON.stringify(
      students
    )
  );


/*
  RESET FORM
*/

event.target.reset();

resetStudentPhoto();

editingStudentId = null;


  const formTitle =
    document.querySelector(
      "#add-student-panel .form-header h2"
    );


  if (formTitle) {

    formTitle.textContent =
      "Add Student";

  }


  document.getElementById(
    "btn-save-student"
  ).textContent =
    "Save";


  closeAddStudentForm();


  alert(
    "Student saved successfully!\n\nID: " +
    savedStudent.id
  );

} 

/* STUDENT LOCAL MEMORY FEATURE END */

/* ==========================================================================
   COURSE LIST FEATURE START
   Reversible: remove this entire block to remove the course dropdown list.
   ========================================================================== */

const GAZAL_COURSES = [
  "ഹിന്ദുസ്ഥാനി സംഗീതം",
  "കർണാടക സംഗീതം",
  "മാപ്പിളപ്പാട്ട്",
  "ശാസ്ത്രീയ നൃത്തം",
  "സിനിമാറ്റിക് ഡാൻസ്",
  "തബല",
  "ഗിറ്റാർ",
  "കീബോർഡ്",
  "ഹാർമോണിയം",
  "ഫ്ലൂട്ട്",
  "വയലിൻ",
  "ട്രിപ്പിൾ ഡ്രംസ്",
  "ഡ്രോയിംഗ്"
];

function loadCourseOptions() {
  const studentCourseSelect =
    document.getElementById("student-course");

  const attendanceCourseSelect =
    document.getElementById("attendance-course");

  // ------------------------------------------------
  // ADD STUDENT COURSE DROPDOWN
  // ------------------------------------------------
  if (studentCourseSelect) {
    studentCourseSelect.innerHTML =
      `<option value="">Select Course</option>`;

    GAZAL_COURSES.forEach((course) => {
      const option = document.createElement("option");

      option.value = course;
      option.textContent = course;

      studentCourseSelect.appendChild(option);
    });
  }

  // ------------------------------------------------
  // ATTENDANCE COURSE DROPDOWN
  // ------------------------------------------------
  if (attendanceCourseSelect) {
    attendanceCourseSelect.innerHTML =
      `<option value="">Select Course</option>`;

    GAZAL_COURSES.forEach((course) => {
      const option = document.createElement("option");

      option.value = course;
      option.textContent = course;

      attendanceCourseSelect.appendChild(option);
    });
  }
}

/* COURSE LIST FEATURE END */

// ================================================================
// HOME — TOTAL COURSES POPUP
// ================================================================

function openTotalCoursesPopup() {

  const overlay =
    document.createElement("div");

  overlay.className =
    "courses-popup-overlay";


  overlay.innerHTML = `
    <div class="courses-popup">

      <div class="courses-popup-header">

        <div>

          <h2>
            കോഴ്സുകൾ
          </h2>

          <p>
            Gazal Darbar Music & Dance Academy
          </p>

        </div>


        <button
          type="button"
          class="courses-popup-close"
        >
          ×
        </button>

      </div>


      <div class="courses-grid">

        ${GAZAL_COURSES
          .map(
            (course) => `
              <button
                type="button"
                class="course-select-card"
                data-course="${course}"
              >
                ${course}
              </button>
            `
          )
          .join("")
        }

      </div>

    </div>
  `;


  document.body.appendChild(
    overlay
  );


  const closeButton =
    overlay.querySelector(
      ".courses-popup-close"
    );


  closeButton.addEventListener(
    "click",
    () => {
      overlay.remove();
    }
  );


  overlay.addEventListener(
    "click",
    (event) => {

      if (event.target === overlay) {
        overlay.remove();
      }

    }
  );


  overlay
    .querySelectorAll(
      ".course-select-card"
    )
    .forEach(
      (courseCard) => {

        courseCard.addEventListener(
  "click",
  () => {

    const course =
      courseCard.dataset.course;

    overlay.remove();

    openCourseStudentsPopup(
      course
    );

  }
);

      }
    );

}


/* ================================================================
   COURSE STUDENTS POPUP
   ================================================================ */

async function openCourseStudentsPopup(courseName) {

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

  } catch (error) {

    console.error(
      "Failed to load course students:",
      error
    );

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


  /*
    Get only students enrolled
    in the selected course.
  */

  const courseStudents =
    students.filter(
      (student) =>
        student.course === courseName
    );


  /*
    Create popup overlay.
  */

  const overlay =
    document.createElement("div");

  overlay.className =
    "course-students-overlay";


  overlay.innerHTML = `

    <div class="course-students-popup">

      <div class="course-students-header">

        <div>

          <h2>
            ${courseName}
          </h2>

          <p>
            ആകെ വിദ്യാർത്ഥികൾ:
            <strong>
              ${courseStudents.length}
            </strong>
          </p>

        </div>


        <button
          type="button"
          class="course-students-close"
        >
          ×
        </button>

      </div>


      <div class="course-students-list">

        ${
          courseStudents.length === 0
            ? `
              <div
                class="
                  course-students-empty
                "
              >
                ഈ കോഴ്‌സിൽ
                വിദ്യാർത്ഥികളൊന്നുമില്ല.
              </div>
            `
            : courseStudents
                .map(
                  (student) => `

                    <div
                      class="
                        course-student-card
                      "
                    >

                      <div
                        class="
                          course-student-main
                        "
                      >

                        <h3>
                          ${student.studentName}
                        </h3>

                        <p>
                          ${student.place || ""}
                        </p>

                      </div>


                      <div
                        class="
                          course-student-phones
                        "
                      >

                        ${
                          student.phone
                            ? `
                              <a
                                href="
                                  tel:${student.phone}
                                "
                              >
                                📞
                                ${student.phone}
                              </a>
                            `
                            : ""
                        }


                        ${
                          student.backupPhone
                            ? `
                              <a
                                href="
                                  tel:${student.backupPhone}
                                "
                              >
                                📞
                                ${student.backupPhone}
                              </a>
                            `
                            : ""
                        }

                      </div>

                    </div>

                  `
                )
                .join("")
        }

      </div>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  /*
    Close button.
  */

  const closeButton =
    overlay.querySelector(
      ".course-students-close"
    );

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      () => {

        overlay.remove();

      }
    );

  }


  /*
    Close when clicking outside popup.
  */

  overlay.addEventListener(
    "click",
    (event) => {

      if (event.target === overlay) {

        overlay.remove();

      }

    }
  );

}

/* ==========================================================================
   ATTENDANCE DATE DEFAULT START
   ========================================================================== */

function setAttendanceDateDefault() {
  const dateInput = document.getElementById("attendance-date");

  if (!dateInput) return;

  // Only set today's date if the user has not already selected one.
  if (!dateInput.value) {
    const today = new Date();

    const localDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    dateInput.value = localDate;
  }
}

/* ATTENDANCE DATE DEFAULT END */

 /* ==========================================================================
   ATTENDANCE MODAL STUDENT LIST START
   Shows selected course students inside the attendance popup.
   ========================================================================== */

async function renderAttendanceStudents() {

  const courseSelect =
    document.getElementById("attendance-course");

  const dateInput =
    document.getElementById("attendance-date");

  const modal =
    document.getElementById("attendance-modal");

  const modalCourse =
    document.getElementById("attendance-modal-course");

  const modalDate =
    document.getElementById("attendance-modal-date");

  const modalStudents =
    document.getElementById("attendance-modal-students");


  if (
    !courseSelect ||
    !dateInput ||
    !modal ||
    !modalStudents
  ) {
    return;
  }


  const selectedCourse =
    courseSelect.value;


  // Don't open the popup until a course is selected.

  if (!selectedCourse) {
    return;
  }


  /* ================================================================
     LOAD STUDENTS
     Firestore first, localStorage fallback
     ================================================================ */

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    }

  } catch (error) {

    console.error(
      "Failed to load students from Firestore:",
      error
    );

  }


  /* LocalStorage fallback */

  if (
    !students ||
    students.length === 0
  ) {

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


  /* ================================================================
     LOAD ATTENDANCE
     Firestore first, localStorage fallback
     ================================================================ */

  let attendanceRecords = [];

  try {

    if (window.getAttendanceFromFirestore) {

      attendanceRecords =
        await window.getAttendanceFromFirestore();

    }

  } catch (error) {

    console.error(
      "Failed to load attendance from Firestore:",
      error
    );

  }


  /* LocalStorage fallback */

  if (
    !attendanceRecords ||
    attendanceRecords.length === 0
  ) {

    attendanceRecords = JSON.parse(
      localStorage.getItem(
        "gazal_attendance"
      ) || "[]"
    );

  }


  // Find students belonging to selected course.

  const courseStudents =
    students.filter(
      (student) =>
        student.course === selectedCourse
    );


  // Find saved attendance for same course and date.

  const savedAttendance =
    attendanceRecords.find(
      (record) =>
        record.course === selectedCourse &&
        record.date === dateInput.value
    );


  // Update popup details.

  if (modalCourse) {

    modalCourse.textContent =
      selectedCourse;

  }


  if (modalDate) {

    modalDate.textContent =
      dateInput.value || "";

  }


  // Clear previous students.

  modalStudents.innerHTML = "";


  // No students found.

  if (
    courseStudents.length === 0
  ) {

    modalStudents.innerHTML = `
      <div class="attendance-modal-empty">
        No students found in this course.
      </div>
    `;

  } else {

    courseStudents.forEach(
      (student) => {

        const card =
          document.createElement("div");


        card.className =
          "attendance-modal-student-card";


        card.innerHTML = `

          <div class="attendance-student-main">

            <button
              type="button"
              class="attendance-student-name"
              data-student-id="${student.id}"
            >

              <strong>
                ${student.studentName}
              </strong>

              <span>
                ${student.id}
              </span>

            </button>


            <label
              class="attendance-student-checkbox"
            >

              <input
                type="checkbox"
                data-student-id="${student.id}"

                ${
                  savedAttendance &&
                  savedAttendance.students.some(
                    (recordStudent) =>
                      recordStudent.id === student.id &&
                      recordStudent.status === "present"
                  )
                    ? "checked"
                    : ""
                }
              >

            </label>

          </div>

        `;


        const studentNameButton =
          card.querySelector(
            ".attendance-student-name"
          );


        if (studentNameButton) {

          studentNameButton.addEventListener(
            "click",
            () => {

              openFingerprintAttendance(
                student
              );

            }
          );

        }


        modalStudents.appendChild(
          card
        );

      }
    );

  }


  // Open attendance modal.

  modal.style.display =
    "flex";

}

/* ATTENDANCE MODAL STUDENT LIST END */
      

/* ==========================================================================
   ATTENDANCE MODAL CONTROLS START
   ========================================================================== */

function closeAttendanceModal() {
  const modal =
    document.getElementById("attendance-modal");

  if (modal) {
    modal.style.display = "none";
  }
}

function setupAttendanceModalControls() {
  const closeButton =
    document.getElementById("btn-close-attendance-modal");

  const cancelButton =
    document.getElementById("btn-cancel-attendance");

  const saveButton =
  document.getElementById("btn-save-attendance");

  const backdrop =
    document.querySelector(
      "#attendance-modal .attendance-modal-backdrop"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeAttendanceModal
    );
  }

  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      closeAttendanceModal
    );
  }

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeAttendanceModal
    );
  }

  if (saveButton) {
  saveButton.addEventListener(
    "click",
    saveAttendance
  );
  }
}

/* ATTENDANCE MODAL CONTROLS END */

/* ==========================================================================
   ATTENDANCE SAVE FEATURE START
   Saves Present / Absent records to Firestore and local backup.
   ========================================================================== */

async function saveAttendance() {

  const courseSelect =
    document.getElementById("attendance-course");

  const dateInput =
    document.getElementById("attendance-date");

  const modalStudents =
    document.getElementById(
      "attendance-modal-students"
    );

  if (
    !courseSelect ||
    !dateInput ||
    !modalStudents
  ) {
    return;
  }


  const course = courseSelect.value;
  const date = dateInput.value;

  if (!course || !date) {

    alert(
      "Please select both course and date."
    );

    return;
  }


  /* ================================================================
     LOAD STUDENTS
     Firestore first, localStorage fallback
     ================================================================ */

  let students = [];

  try {

    if (window.getStudentsForAttendance) {

      students =
        await window.getStudentsForAttendance();

    }

  } catch (error) {

    console.error(
      "Failed to load students from Firestore:",
      error
    );

  }


  /* Local fallback */

  if (!students || students.length === 0) {

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


  const checkboxes =
    modalStudents.querySelectorAll(
      'input[type="checkbox"][data-student-id]'
    );

  const attendanceStudents = [];


  checkboxes.forEach((checkbox) => {

    const studentId =
      checkbox.dataset.studentId;

    const student = students.find(
      (item) =>
        item.id === studentId
    );

    if (!student) return;


    attendanceStudents.push({
      id: student.id,
      studentName: student.studentName,
      status: checkbox.checked
        ? "present"
        : "absent"
    });

  });


  /* ================================================================
     CREATE ATTENDANCE RECORD
     ================================================================ */

  const attendanceRecord = {

    course: course,
    date: date,
    students: attendanceStudents,
    savedAt: new Date().toISOString()

  };


  /* ================================================================
   SAVE TO FIRESTORE
   ================================================================ */

try {

  if (
    window.saveAttendanceToFirestore
  ) {

    await window.saveAttendanceToFirestore(
      attendanceRecord
    );

  }

} catch (error) {

  console.error(
    "Attendance cloud save failed:",
    error
  );

  alert(
    "Attendance cloud save failed:\n\n" +
    error.message
  );

  return;
}


  /* ================================================================
     KEEP LOCAL BACKUP
     ================================================================ */

  const attendanceRecords =
    JSON.parse(
      localStorage.getItem(
        "gazal_attendance"
      ) || "[]"
    );


  const updatedRecords =
    attendanceRecords.filter(
      (record) =>
        !(
          record.course === course &&
          record.date === date
        )
    );


  updatedRecords.push(
    attendanceRecord
  );


  localStorage.setItem(
    "gazal_attendance",
    JSON.stringify(updatedRecords)
  );


  closeAttendanceModal();


  alert(
    "Attendance saved successfully!"
  );

}

/* ATTENDANCE SAVE FEATURE END */


/* ==========================================================================
   ATTENDANCE HISTORY FEATURE START
   ========================================================================== */

function openAttendanceHistory() {
  const modal = document.getElementById(
    "attendance-history-modal"
  );

  const list = document.getElementById(
    "attendance-history-list"
  );

  if (!modal || !list) return;

  const attendanceRecords = JSON.parse(
    localStorage.getItem(
      "gazal_attendance"
    ) || "[]"
  );

  // Clear previous records.
  list.innerHTML = "";

  // No records found.
  if (attendanceRecords.length === 0) {
    list.innerHTML = `
      <div class="attendance-history-empty">
        No attendance records have been saved yet.
      </div>
    `;
  } else {

    // Show newest records first.
    attendanceRecords
      .slice()
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      })
      .forEach((record) => {

        const presentCount =
          record.students.filter(
            (student) =>
              student.status === "present"
          ).length;

        const absentCount =
          record.students.filter(
            (student) =>
              student.status === "absent"
          ).length;

        const totalStudents =
          record.students.length;

        const attendancePercent =
          totalStudents > 0
            ? Math.round(
                (presentCount / totalStudents) * 100
              )
            : 0;

        const card =
          document.createElement("div");

        card.className =
  "attendance-history-card attendance-history-card-clickable";

        card.innerHTML = `
          <div class="attendance-history-card-top">

            <div>
              <h3 class="attendance-history-course">
                ${record.course}
              </h3>

              <span class="attendance-history-date">
                ${record.date}
              </span>
            </div>

          </div>

          <div class="attendance-history-stats">

            <div class="
              attendance-history-stat
              present
            ">
              <strong>${presentCount}</strong>
              <span>Present</span>
            </div>

            <div class="
              attendance-history-stat
              absent
            ">
              <strong>${absentCount}</strong>
              <span>Absent</span>
            </div>

            <div class="
              attendance-history-stat
              percent
            ">
              <strong>${attendancePercent}%</strong>
              <span>Attendance</span>
            </div>

          </div>
        `;

        card.addEventListener(
  "click",
  () => {
    openAttendanceRecordDetails(record);
  }
);

        list.appendChild(card);
      });
  }

  modal.style.display = "flex";
}


function closeAttendanceHistory() {
  const modal = document.getElementById(
    "attendance-history-modal"
  );

  if (modal) {
    modal.style.display = "none";
  }
}


function setupAttendanceHistoryControls() {

  const openButton = document.getElementById(
    "btn-view-attendance-history"
  );

  const closeButton = document.getElementById(
    "btn-close-attendance-history"
  );

  const footerCloseButton = document.getElementById(
    "btn-close-attendance-history-footer"
  );

  const backdrop = document.querySelector(
    ".attendance-history-backdrop"
  );


  if (openButton) {
    openButton.addEventListener(
      "click",
      openAttendanceHistory
    );
  }


  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeAttendanceHistory
    );
  }


  if (footerCloseButton) {
    footerCloseButton.addEventListener(
      "click",
      closeAttendanceHistory
    );
  }


  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeAttendanceHistory
    );
  }
}

/* ATTENDANCE HISTORY FEATURE END */

/* ==========================================================================
   ATTENDANCE RECORD DETAILS FEATURE START
   ========================================================================== */

function openAttendanceRecordDetails(record) {
  const modal = document.getElementById(
    "attendance-record-details-modal"
  );

  const course = document.getElementById(
    "attendance-record-details-course"
  );

  const date = document.getElementById(
    "attendance-record-details-date"
  );

  const summary = document.getElementById(
    "attendance-record-details-summary"
  );

  const studentsList = document.getElementById(
    "attendance-record-details-students"
  );

  if (
    !modal ||
    !course ||
    !date ||
    !summary ||
    !studentsList
  ) {
    return;
  }

  course.textContent = record.course;
  date.textContent = record.date;

  const presentCount =
    record.students.filter(
      (student) =>
        student.status === "present"
    ).length;

  const absentCount =
    record.students.filter(
      (student) =>
        student.status === "absent"
    ).length;

  summary.innerHTML = `
    <div class="
      attendance-record-summary-stat
      present
    ">
      <strong>${presentCount}</strong>
      <span>Present</span>
    </div>

    <div class="
      attendance-record-summary-stat
      absent
    ">
      <strong>${absentCount}</strong>
      <span>Absent</span>
    </div>
  `;

  studentsList.innerHTML = "";

  record.students.forEach((student) => {
    const studentCard =
      document.createElement("div");

    studentCard.className =
      "attendance-record-student";

    const isPresent =
      student.status === "present";

    studentCard.innerHTML = `
      <div class="
        attendance-record-student-info
      ">
        <strong>
          ${student.studentName}
        </strong>

        <span>
          ${student.id}
        </span>
      </div>

      <span class="
        attendance-record-status
        ${isPresent ? "present" : "absent"}
      ">
        ${isPresent ? "Present" : "Absent"}
      </span>
    `;

    studentsList.appendChild(studentCard);
  });

  modal.style.display = "flex";
}


function closeAttendanceRecordDetails() {
  const modal = document.getElementById(
    "attendance-record-details-modal"
  );

  if (modal) {
    modal.style.display = "none";
  }
}


function setupAttendanceRecordDetailsControls() {

  const closeButton = document.getElementById(
    "btn-close-attendance-record-details"
  );

  const footerButton = document.getElementById(
    "btn-close-attendance-record-details-footer"
  );

  const backdrop = document.querySelector(
    ".attendance-record-details-backdrop"
  );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeAttendanceRecordDetails
    );
  }

  if (footerButton) {
    footerButton.addEventListener(
      "click",
      closeAttendanceRecordDetails
    );
  }

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeAttendanceRecordDetails
    );
  }
}

/* ATTENDANCE RECORD DETAILS FEATURE END */

/* ==========================================================================
   STUDENTS — COURSE NAVIGATION STATE
   ========================================================================== */

let studentsView = "courses";

let selectedStudentsCourse = null;

let selectedStudentId = null;


/* ==========================================================================
   STUDENTS — COURSE LIST VIEW
   ========================================================================== */

function renderStudentsCourseList() {

  const list =
    document.getElementById(
      "students-list"
    );

  const empty =
    document.getElementById(
      "students-empty"
    );

  const title =
    document.getElementById(
      "students-title"
    );

  const subtitle =
    document.getElementById(
      "students-subtitle"
    );

  const count =
    document.getElementById(
      "students-count"
    );

  const backButton =
    document.getElementById(
      "students-back-button"
    );


  /*
    Set navigation state.
  */

  studentsView = "courses";

  selectedStudentsCourse = null;

  selectedStudentId = null;


  /*
    Header.
  */

  title.textContent =
    "സ്റ്റുഡൻ്റ്സ്";

  subtitle.style.display =
    "none";

  count.textContent =
    GAZAL_COURSES.length;

  backButton.style.display =
    "none";


  /*
    Clear old student cards.
  */

  list.innerHTML = "";

  empty.style.display =
    "none";


  /*
    Create two-column course buttons.
  */

  const coursesGrid =
    document.createElement("div");

  coursesGrid.className =
    "students-courses-grid";


  GAZAL_COURSES.forEach(
    (course) => {

      const courseButton =
        document.createElement(
          "button"
        );

      courseButton.type =
        "button";

      courseButton.className =
        "students-course-button";

      courseButton.textContent =
        course;


      courseButton.addEventListener(
        "click",
        () => {

          selectedStudentsCourse =
            course;

          studentsView =
            "course-students";

          renderStudentsByCourse(
            course
          );

        }
      );


      coursesGrid.appendChild(
        courseButton
      );

    }
  );


  list.appendChild(
    coursesGrid
  );

}

/* ==========================================================================
   STUDENTS — SELECTED COURSE STUDENTS VIEW
   ========================================================================== */

async function renderStudentsByCourse(course) {

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

  } catch (error) {

    console.error(
      "Failed to load students:",
      error
    );

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


  /*
    Get only students enrolled in
    the selected course.
  */

  const courseStudents =
    students.filter(
      (student) =>
        student.course === course
    );


  /*
    Get interface elements.
  */

  const list =
    document.getElementById(
      "students-list"
    );

  const empty =
    document.getElementById(
      "students-empty"
    );

  const title =
    document.getElementById(
      "students-title"
    );

  const subtitle =
    document.getElementById(
      "students-subtitle"
    );

  const count =
    document.getElementById(
      "students-count"
    );

  const backButton =
    document.getElementById(
      "students-back-button"
    );


  /*
    Update navigation state.
  */

  studentsView =
    "course-students";

  selectedStudentsCourse =
    course;

  selectedStudentId =
    null;


  /*
    Update header.
  */

  title.textContent =
    course;

  subtitle.textContent =
    `${courseStudents.length} വിദ്യാർത്ഥികൾ`;

  subtitle.style.display =
    "block";

  count.textContent =
  courseStudents.length;

count.style.display =
  "inline-flex";

backButton.style.display =
  "inline-flex";

title.style.display =
  "block";

subtitle.style.display =
  "block";

  backButton.style.display =
    "inline-flex";


  /*
    Clear previous content.
  */

  list.innerHTML = "";


  /*
    Empty state.
  */

  if (
    courseStudents.length === 0
  ) {

    empty.style.display =
      "block";

    empty.innerHTML =
      "<p>ഈ കോഴ്സിൽ വിദ്യാർത്ഥികൾ ഇല്ല.</p>";

    return;

  }


  empty.style.display =
    "none";


  /*
    Create student list.
  */

  const studentsCourseList =
    document.createElement(
      "div"
    );

  studentsCourseList.className =
    "students-course-students-list";


  courseStudents.forEach(
    (student) => {

      const studentButton =
        document.createElement(
          "button"
        );

      studentButton.type =
        "button";

      studentButton.className =
        "course-student-row";


      studentButton.innerHTML = `

        <span
          class="course-student-name"
        >
          ${student.studentName}
        </span>

        <span
          class="course-student-place"
        >
          ${student.place || "-"}
        </span>

      `;


      /*
        Open full student details.
        We will create this next.
      */

      studentButton.addEventListener(
        "click",
        () => {

          selectedStudentId =
            student.id;

          studentsView =
            "student-details";

          renderStudentFullDetails(
            student.id
          );

        }
      );


      studentsCourseList.appendChild(
        studentButton
      );

    }
  );


  list.appendChild(
    studentsCourseList
  );

}

/* ==========================================================================
   STUDENTS — FULL STUDENT DETAILS VIEW
   ========================================================================== */

async function renderStudentFullDetails(studentId) {

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

  } catch (error) {

    console.error(
      "Failed to load student:",
      error
    );

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }


  /*
    Find selected student.
  */

  const student =
    students.find(
      (student) =>
        student.id === studentId
    );


  if (!student) {

    alert(
      "Student could not be found."
    );

    renderStudentsByCourse(
      selectedStudentsCourse
    );

    return;

  }


  const list =
    document.getElementById(
      "students-list"
    );

  const empty =
    document.getElementById(
      "students-empty"
    );

  const title =
    document.getElementById(
      "students-title"
    );

  const subtitle =
    document.getElementById(
      "students-subtitle"
    );

  const count =
    document.getElementById(
      "students-count"
    );

  const backButton =
    document.getElementById(
      "students-back-button"
    );

  /*
  STUDENT DETAILS HEADER STATE
*/

title.style.display =
  "none";

subtitle.style.display =
  "none";

count.style.display =
  "none";

backButton.style.display =
  "inline-flex";

  /*
    Update navigation state.
  */

  studentsView =
    "student-details";

  selectedStudentId =
    student.id;


  /*
    Header.
  */

  title.textContent =
    student.studentName;

  subtitle.textContent =
    student.course;

  subtitle.style.display =
    "block";

  count.textContent =
    "";

  backButton.style.display =
    "inline-flex";


  list.innerHTML = "";

  empty.style.display =
    "none";


  /*
    Create full student card.
  */

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "student-card";


  card.innerHTML = `

    <div class="student-card-top">

  <div class="student-card-profile">

    ${
      student.photoData
        ? `
          <img
  class="student-card-photo student-details-photo"
  src="${student.photoData}"
  alt="${student.studentName}"
>
        `
        : `
          <div
  class="
    student-card-photo-placeholder
    student-details-photo-placeholder
  "
>
  👤
</div>
        `
    }


    <div>

      <h3>
        ${student.studentName}
      </h3>

      <p class="student-card-id">
        ${student.id}
      </p>

    </div>

  </div>


  <span class="student-course-badge">
    ${student.course}
  </span>

</div>


    <div class="student-details">

      <div class="student-detail-row">

        <span class="student-detail-label">
          രക്ഷിതാവിൻ്റെ പേര്
        </span>

        <span class="student-detail-value">
          ${student.parentName || "-"}
        </span>

      </div>


      <div class="student-detail-row">

        <span class="student-detail-label">
          സ്ഥലം
        </span>

        <span class="student-detail-value">
          ${student.place || "-"}
        </span>

      </div>


      <div class="student-detail-row">

        <span class="student-detail-label">
          ഫോൺ നമ്പർ
        </span>

        <a
          class="student-phone-link"
          href="tel:${student.phone}"
        >
          📞 ${student.phone}
        </a>

      </div>


      ${
        student.backupPhone
          ? `

            <div class="student-detail-row">

              <span class="student-detail-label">
                2nd ഫോൺ നമ്പർ
              </span>

              <a
                class="student-phone-link"
                href="tel:${student.backupPhone}"
              >
                📞 ${student.backupPhone}
              </a>

            </div>

          `
          : ""
      }


      <div class="student-detail-row">

        <span class="student-detail-label">
          കോഴ്സ്
        </span>

        <span class="student-detail-value">
          ${student.course}
        </span>

      </div>


      <div class="student-detail-row">

        <span class="student-detail-label">
          അഡ്മിഷൻ ഡേറ്റ്
        </span>

        <span class="student-detail-value">
          ${student.admissionDate || "-"}
        </span>

      </div>

    </div>


    <div class="student-card-actions">

      <button
        class="student-edit-btn"
        type="button"
      >

        <span class="student-action-icon">
          ✎
        </span>

        <span>
          Edit
        </span>

      </button>

<button
  class="student-attendance-btn"
  type="button"
>
  <span class="student-action-icon">✓</span>
  <span>Attendance</span>
</button>

      <button
        class="student-delete-btn"
        type="button"
      >

        <span class="student-action-icon">
          ×
        </span>

        <span>
          Delete
        </span>

      </button>

    </div>

  `;


  list.appendChild(
    card
  );


  /*
    Edit selected student.
  */

  const editButton =
    card.querySelector(
      ".student-edit-btn"
    );


  if (editButton) {

    editButton.addEventListener(
      "click",
      () => {
        editStudent(
          student.id
        );
      }
    );

  }


  /*
  Open selected student's attendance.
*/

const attendanceButton =
  card.querySelector(
    ".student-attendance-btn"
  );


if (attendanceButton) {

  attendanceButton.addEventListener(
    "click",
    () => {

      renderStudentAttendance(
        student.id
      );

    }
  );

}

  /*
    Delete selected student.
  */

  const deleteButton =
    card.querySelector(
      ".student-delete-btn"
    );


  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      () => {
        deleteStudent(
          student.id
        );
      }
    );

  }

}

/* ==========================================================================
   STUDENT ATTENDANCE HISTORY VIEW
   ========================================================================== */

async function renderStudentAttendance(studentId) {

  let attendanceRecords = [];


  /*
    Load attendance from Firestore.
  */

  try {

    if (
      window.getAttendanceFromFirestore
    ) {

      attendanceRecords =
        await window
          .getAttendanceFromFirestore();

    }

  } catch (error) {

    console.error(
      "Failed to load attendance:",
      error
    );

  }


  /*
    Local backup fallback.
  */

  if (
    !attendanceRecords ||
    attendanceRecords.length === 0
  ) {

    attendanceRecords =
      JSON.parse(
        localStorage.getItem(
          "gazal_attendance"
        ) || "[]"
      );

  }


  /*
    Find the selected student.
  */

  let students = [];

  try {

    if (
      window.getStudentsFromFirestore
    ) {

      students =
        await window
          .getStudentsFromFirestore();

    }

  } catch (error) {

    console.error(
      "Failed to load students:",
      error
    );

  }


  if (
    !students ||
    students.length === 0
  ) {

    students =
      JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

  }


  const student =
    students.find(
      (item) =>
        item.id === studentId
    );


  if (!student) {

    alert(
      "Student could not be found."
    );

    return;

  }


  /*
    Get Attendance History interface.
  */

  const studentsPanel =
    document.getElementById(
      "students-panel"
    );

  const attendancePanel =
    document.getElementById(
      "student-attendance-panel"
    );

  const history =
    document.getElementById(
      "student-attendance-history"
    );

  const empty =
    document.getElementById(
      "student-attendance-empty"
    );

  const studentName =
    document.getElementById(
      "student-attendance-student"
    );


  /*
    Open Attendance History.
  */

  studentsPanel.style.display =
    "none";

  attendancePanel.style.display =
    "block";


  studentName.textContent =
    student.studentName;


  history.innerHTML =
    "";


  /*
    Get only attendance belonging
    to this student.
  */

  const studentAttendance =
    [];


  attendanceRecords.forEach(
    (record) => {

      const attendanceEntry =
        record.students?.find(
          (item) =>
            item.id === studentId
        );


      if (!attendanceEntry) {
        return;
      }


      studentAttendance.push({

        date:
          record.date,

        course:
          record.course,

        status:
          attendanceEntry.status

      });

    }
  );


  /*
    Sort newest first.
  */

  studentAttendance.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  /*
    Empty state.
  */

  if (
    studentAttendance.length === 0
  ) {

    empty.style.display =
      "block";

    history.innerHTML =
      "";

    return;

  }


  empty.style.display =
    "none";


  /*
    Group records by month.
  */

  const groupedAttendance =
    {};


  studentAttendance.forEach(
    (record) => {

      const date =
        new Date(
          record.date +
          "T00:00:00"
        );

      const monthName =
        date.toLocaleDateString(
          "en-US",
          {
            month:
              "long",

            year:
              "numeric"
          }
        );


      if (
        !groupedAttendance[
          monthName
        ]
      ) {

        groupedAttendance[
          monthName
        ] =
          [];

      }


      groupedAttendance[
        monthName
      ].push(
        record
      );

    }
  );


  /*
    Render each month.
  */

  Object.entries(
    groupedAttendance
  ).forEach(
    ([
      month,
      records
    ]) => {

      const monthSection =
        document.createElement(
          "div"
        );


      monthSection.className =
        "student-attendance-month";


      const monthTitle =
        document.createElement(
          "h3"
        );


      monthTitle.textContent =
        month;


      monthSection.appendChild(
        monthTitle
      );


      records.forEach(
        (record) => {

          const row =
            document.createElement(
              "div"
            );


          row.className =
            "student-attendance-record " +
            record.status;


          const date =
            new Date(
              record.date +
              "T00:00:00"
            );


          row.innerHTML = `

            <span
              class="student-attendance-status"
            >
              ${
                record.status ===
                "present"
                  ? "✓"
                  : "✕"
              }
            </span>


            <span
              class="student-attendance-date"
            >
              ${
                date.toLocaleDateString(
                  "en-US",
                  {
                    day:
                      "numeric",

                    month:
                      "long",

                    year:
                      "numeric"
                  }
                )
              }
            </span>

          `;


          monthSection.appendChild(
            row
          );

        }
      );


      history.appendChild(
        monthSection
      );

    }
  );

        }

/* ================================================================
   HIDE STUDENT ATTENDANCE HISTORY
   ================================================================ */

function hideStudentAttendancePanel() {

  const attendancePanel =
    document.getElementById(
      "student-attendance-panel"
    );

  if (attendancePanel) {

    attendancePanel.style.display =
      "none";

  }

}

/* ==========================================================================
   STUDENT LIST FEATURE START
   Reversible: remove this block to remove student list rendering.
   ========================================================================== */

async function renderStudentsList(searchQuery = "") {

  let students = [];

  try {

    if (window.getStudentsFromFirestore) {

      students =
        await window.getStudentsFromFirestore();

    } else {

      students = JSON.parse(
        localStorage.getItem(
          "gazal_students"
        ) || "[]"
      );

    }

  } catch (error) {

    console.error(
      "Failed to load students from Firestore:",
      error
    );

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }

    /* ================================================================
     LOAD ATTENDANCE RECORDS
     Firestore first, localStorage fallback
     ================================================================ */

  let attendanceRecords = [];

  try {

    if (window.getAttendanceFromFirestore) {

      attendanceRecords =
        await window.getAttendanceFromFirestore();

    }

  } catch (error) {

    console.error(
      "Failed to load attendance from Firestore:",
      error
    );

  }


  /* LocalStorage fallback */

  if (
    !attendanceRecords ||
    attendanceRecords.length === 0
  ) {

    attendanceRecords = JSON.parse(
      localStorage.getItem(
        "gazal_attendance"
      ) || "[]"
    );

  }

  if (searchQuery) {

    students = students.filter(
      (student) => {

        const query =
          searchQuery.toLowerCase();

        return (
          student.studentName
            ?.toLowerCase()
            .includes(query) ||

          student.id
            ?.toLowerCase()
            .includes(query) ||

          student.course
            ?.toLowerCase()
            .includes(query)
        );

      }
    );

  }

  const list = document.getElementById("students-list");
  const empty = document.getElementById("students-empty");
  const count = document.getElementById("students-count");

  list.innerHTML = "";

  count.textContent = students.length;

  if (students.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  students.forEach((student) => {
    const card = document.createElement("div");
    card.className = "student-card";

    /* ================================================================
   4 CLASS ATTENDANCE CYCLE
   ================================================================ */

/*
  Get every class where this student was actually present.

  Absences do NOT count toward the 4-class cycle.
*/

const presentClasses = [];

attendanceRecords.forEach((record) => {
  const studentAttendance = record.students.find(
    (attendanceStudent) =>
      attendanceStudent.id === student.id
  );

  if (
    studentAttendance &&
    studentAttendance.status === "present"
  ) {
    presentClasses.push({
      date: record.date,
      course: record.course
    });
  }
});


/*
  Sort newest attendance first.
*/

presentClasses.sort(
  (a, b) =>
    new Date(b.date) - new Date(a.date)
);


/*
  Temporary current cycle calculation.

  We will connect this to the Fees section later,
  so this currently shows the student's latest
  progress toward a 4-class cycle.
*/

const cycleSize = 4;

const totalPresentClasses =
  presentClasses.length;

const completedMonths =
  Math.floor(
    totalPresentClasses / cycleSize
  );

const remainingInCurrentCycle =
  totalPresentClasses % cycleSize;


/*
  If exactly 4, 8, 12... classes are completed,
  show the completed cycle as 4 / 4.

  Otherwise show the progress of the new cycle.
*/

const completedClasses =
  remainingInCurrentCycle === 0 &&
  totalPresentClasses > 0
    ? cycleSize
    : remainingInCurrentCycle;


const remainingClasses =
  Math.max(
    0,
    cycleSize - completedClasses
  );


const monthComplete =
  completedClasses === cycleSize;

    const latestCompletedMonth =
  completedMonths;

    /*
  A payment is currently due only when the
  student is exactly at the end of a 4-class cycle.

  If a new cycle has already started (5/4, 6/4,
  7/4), the previous month's payment may be paid,
  but the current cycle is not yet due.
*/

const cycleCurrentlyComplete =
  remainingInCurrentCycle === 0 &&
  totalPresentClasses > 0;


const latestMonthPaid =
  cycleCurrentlyComplete &&
  latestCompletedMonth > 0
    ? isFeeMonthPaid(
        student.id,
        latestCompletedMonth
      )
    : false;


const feeDue =
  cycleCurrentlyComplete &&
  !latestMonthPaid;

    card.innerHTML = `

  <div class="student-card-top">

  <div class="student-card-profile">

    ${
      student.photoData
        ? `
          <img
            class="student-card-photo"
            src="${student.photoData}"
            alt="${student.studentName}"
          >
        `
        : `
          <div class="student-card-photo-placeholder">
            👤
          </div>
        `
    }


    <div>

      <h3>
        ${student.studentName}
      </h3>

      <p class="student-card-id">
        ${student.id}
      </p>

    </div>

  </div>


  <span class="student-course-badge">
    ${student.course}
  </span>

</div>


    <!-- STUDENT NAME + ID -->

    <div class="student-card-main-info">

      <h3>
        ${student.studentName}
      </h3>

      <p class="student-card-id">
        ${student.id}
      </p>

    </div>


    <!-- COURSE -->

    <span class="student-course-badge">
      ${student.course}
    </span>

  </div>

  <div class="student-details">

    <div class="student-detail-row">
      <span class="student-detail-label">രക്ഷിതാവിൻ്റെ പേര്</span>
      <span class="student-detail-value">
        ${student.parentName || "-"}
      </span>
    </div>

    <div class="student-detail-row">
      <span class="student-detail-label">സ്ഥലം</span>
      <span class="student-detail-value">
        ${student.place || "-"}
      </span>
    </div>

    <div class="student-detail-row">
      <span class="student-detail-label">ഫോൺ നമ്പർ</span>

      <a
        class="student-phone-link"
        href="tel:${student.phone}"
      >
        📞 ${student.phone}
      </a>
    </div>

    ${
      student.backupPhone
        ? `
        <div class="student-detail-row">
          <span class="student-detail-label">
            2nd ഫോൺ നമ്പർ
          </span>

          <a
            class="student-phone-link"
            href="tel:${student.backupPhone}"
          >
            📞 ${student.backupPhone}
          </a>
        </div>
        `
        : ""
    }

    <div class="student-detail-row">
      <span class="student-detail-label">കോഴ്സ്</span>
      <span class="student-detail-value">
        ${student.course}
      </span>
    </div>

    <div class="student-detail-row">
      <span class="student-detail-label">
        അഡ്മിഷൻ ഡേറ്റ്
      </span>

      <span class="student-detail-value">
        ${student.admissionDate || "-"}
      </span>
    </div>

  </div>

  </div>

<!-- ================================================================
     STUDENT 4 CLASS MONTH PROGRESS
     ================================================================ -->

<div class="student-attendance-summary">

  <div class="student-attendance-header">

    <div>
      <span class="student-attendance-title">
        Class Progress
      </span>

      <span class="student-attendance-subtitle">
        ${monthComplete
          ? "Month completed"
          : `${remainingClasses} class${
              remainingClasses === 1 ? "" : "es"
            } remaining`}
      </span>
    </div>

    <span class="
      student-attendance-percent
      ${monthComplete
        ? "month-complete"
        : ""
      }
    ">
      ${completedClasses} / 4
    </span>

  </div>


  <!-- Four class indicators -->

  <div class="student-class-progress-dots">

    ${[0, 1, 2, 3]
      .map(
        (index) => `
          <span
            class="
              student-class-dot
              ${
                index < completedClasses
                  ? "completed"
                  : ""
              }
            "
          ></span>
        `
      )
      .join("")}

  </div>


  <div class="student-attendance-cycle-message">

    ${
      monthComplete
        ? "✓ 4 classes completed — Fee due"
        : `${remainingClasses} more class${
            remainingClasses === 1
              ? ""
              : "es"
          } to complete this month`
    }

  </div>

  <div class="student-fee-status">

  <span class="student-fee-status-label">
    ഫീസ്
  </span>

  <span
    class="
      student-fee-status-value
      ${
        latestMonthPaid
          ? "paid"
          : feeDue
            ? "not-paid"
            : "not-due"
      }
    "
  >
    ${
      latestMonthPaid
        ? "അടച്ചു"
        : feeDue
          ? "അടച്ചില്ല"
          : "ഇപ്പോൾ അടക്കേണ്ടതില്ല"
    }
  </span>

</div>

  <div class="student-fee-status">

  <span class="student-fee-status-label">
    Fee Status
  </span>

  <span
    class="
      student-fee-status-value
      ${
        latestMonthPaid
          ? "paid"
          : feeDue
            ? "not-paid"
            : "not-due"
      }
    "
  >
    ${
      latestMonthPaid
        ? "Paid"
        : feeDue
          ? "Pending"
          : "Not Due"
    }
  </span>

</div>
</div>

<div class="student-card-actions">

  <div class="student-card-actions">

  <button
    class="student-edit-btn"
    type="button"
    data-student-id="${student.id}"
  >
    <span class="student-action-icon">✎</span>
    <span>Edit</span>
  </button>

  <button
    class="student-delete-btn"
    type="button"
    data-student-id="${student.id}"
  >
    <span class="student-action-icon">×</span>
    <span>Delete</span>
  </button>

</div>
`;
    list.appendChild(card);

const editButton = card.querySelector(".student-edit-btn");

if (editButton) {
  editButton.addEventListener("click", () => {
    editStudent(student.id);
  });
}
    
    const deleteButton = card.querySelector(".student-delete-btn");

if (deleteButton) {
  deleteButton.addEventListener("click", () => {
    deleteStudent(student.id);
  });
}
  });
}

/* STUDENT LIST FEATURE END */

/* ==========================================================================
   STUDENT SEARCH FEATURE START
   Reversible: remove this block to remove student search.
   ========================================================================== */

function setupStudentSearch() {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    if (!query) return;

    showStudentSearchResults(query);
  });
}

function showStudentSearchResults(query) {
  document.getElementById("home-panel").style.display = "none";
  document.getElementById("placeholder-panel").style.display = "none";
  document.getElementById("add-student-panel").style.display = "none";
  document.getElementById("students-panel").style.display = "block";

  document
    .querySelectorAll(".nav-item")
    .forEach((button) => button.classList.remove("active"));

  renderStudentsList(query);
}

function getStudentSearchMatches(query) {
  const normalizedQuery = query.toLowerCase();

  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  return students.filter((student) => {
    const searchableFields = [
      student.studentName,
      student.parentName,
      student.place,
      student.phone,
      student.backupPhone,
      student.course,
      student.id
    ];

    return searchableFields.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  });
}

/* STUDENT SEARCH FEATURE END */

/* ==========================================================================
   STUDENT DELETE FEATURE START
   Reversible: remove this block to remove student deletion.
   ========================================================================== */
async function deleteStudent(studentId) {

  let student = null;

  try {

    /* Load student from Firestore */

    if (window.getStudentFromFirestore) {

      student =
        await window.getStudentFromFirestore(
          studentId
        );

    }

  } catch (error) {

    console.error(
      "Failed to load student from Firestore:",
      error
    );

  }


  /* Fallback to localStorage */

  if (!student) {

    const students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

    student = students.find(
      (item) => item.id === studentId
    );

  }


  if (!student) {

    alert(
      "Student could not be found."
    );

    return;

  }


  const confirmed = confirm(
    `Delete ${student.studentName}?\n\nThis action cannot be undone.`
  );

  if (!confirmed) return;


  try {

    /* Delete from Firestore */

    if (window.deleteStudentFromFirestore) {

      await window.deleteStudentFromFirestore(
        studentId
      );

    }

  } catch (error) {

    console.error(
      "Failed to delete student from Firestore:",
      error
    );

    alert(
      "Failed to delete student from cloud."
    );

    return;

  }


  /* Also remove local backup */

  const localStudents = JSON.parse(
    localStorage.getItem(
      "gazal_students"
    ) || "[]"
  );

  const updatedStudents =
    localStudents.filter(
      (item) => item.id !== studentId
    );

  localStorage.setItem(
    "gazal_students",
    JSON.stringify(updatedStudents)
  );


  /* Refresh student list */

  await renderStudentsList();

}


/* STUDENT DELETE FEATURE END */

/* ==========================================================================
   STUDENT EDIT FEATURE START
   Reversible: remove this block to remove student editing.
   ========================================================================== */

let editingStudentId = null;

async function editStudent(studentId) {

  let student = null;

  try {

    if (window.getStudentFromFirestore) {

      student =
        await window.getStudentFromFirestore(
          studentId
        );

    }

  } catch (error) {

    console.error(
      "Failed to load student from Firestore:",
      error
    );

  }


  /* Fallback to localStorage */

  if (!student) {

    const students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

    student = students.find(
      (item) => item.id === studentId
    );

  }


  if (!student) {

    alert(
      "Student could not be found."
    );

    return;
  }


  editingStudentId = studentId;


  // Open the existing student form.
  document.getElementById(
    "students-panel"
  ).style.display = "none";

  document.getElementById(
    "home-panel"
  ).style.display = "none";

  document.getElementById(
    "placeholder-panel"
  ).style.display = "none";

  document.getElementById(
    "add-student-panel"
  ).style.display = "block";


  // Change form title.
  const formTitle =
    document.querySelector(
      "#add-student-panel .form-header h2"
    );

  if (formTitle) {

    formTitle.textContent =
      "Edit Student";

  }


  // Fill existing student data.
  document.getElementById(
    "student-name"
  ).value =
    student.studentName || "";

  document.getElementById(
    "parent-name"
  ).value =
    student.parentName || "";

  document.getElementById(
    "student-place"
  ).value =
    student.place || "";

  document.getElementById(
    "student-phone"
  ).value =
    student.phone || "";

  document.getElementById(
    "backup-phone"
  ).value =
    student.backupPhone || "";

  document.getElementById(
    "student-course"
  ).value =
    student.course || "";

    document.getElementById(
    "admission-date"
  ).value =
    student.admissionDate || "";


/* ================================================================
   LOAD EXISTING STUDENT PHOTO FOR EDITING
   ================================================================ */


/*
  Clear any previously selected
  file from another student.
*/

selectedStudentPhotoFile =
  null;


/*
  Load the saved Base64 photo.
*/

selectedStudentPhotoData =
  student.photoData ||
  null;


if (
  student.photoData
) {

  studentPhotoImage.src =
    student.photoData;


  studentPhotoImage.style.display =
    "block";


  studentPhotoPlaceholder.style.display =
    "none";

} else {

  studentPhotoImage.src =
    "";


  studentPhotoImage.style.display =
    "none";


  studentPhotoPlaceholder.style.display =
    "flex";

}




  // Change Save button text.
  document.getElementById(
    "btn-save-student"
  ).textContent =
    "Save";


  document.getElementById(
    "main-content"
  ).scrollTop = 0;

}

/* STUDENT EDIT FEATURE END */


/* ==========================================================================
   FINGERPRINT ATTENDANCE FEATURE START
   Premium biometric-style attendance confirmation.
   ========================================================================== */

let selectedFingerprintStudentId = null;


/* ------------------------------------------------
   Open fingerprint popup
------------------------------------------------ */

function openFingerprintAttendance(student) {
  const modal = document.getElementById(
    "fingerprint-attendance-modal"
  );

  if (!modal) return;

  selectedFingerprintStudentId = student.id;

  document.getElementById(
    "fingerprint-student-name"
  ).textContent = student.studentName;

  document.getElementById(
    "fingerprint-student-id"
  ).textContent = student.id;

  modal.style.display = "flex";
}


/* ------------------------------------------------
   Close fingerprint popup
------------------------------------------------ */

function closeFingerprintAttendance() {
  const modal = document.getElementById(
    "fingerprint-attendance-modal"
  );

  if (!modal) return;

  modal.style.display = "none";

  selectedFingerprintStudentId = null;
}


/* ------------------------------------------------
   Premium scanner sound
   Uses Web Audio API — no audio file required.
------------------------------------------------ */

function playFingerprintSound(type = "scan") {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;

  if (type === "success") {
    oscillator.frequency.setValueAtTime(620, now);
    oscillator.frequency.setValueAtTime(880, now + 0.12);

    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + 0.35
    );

    oscillator.start(now);
    oscillator.stop(now + 0.35);

  } else {

    oscillator.frequency.setValueAtTime(360, now);

    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + 0.18
    );

    oscillator.start(now);
    oscillator.stop(now + 0.18);
  }
}


/* ------------------------------------------------
   Confirm fingerprint attendance
------------------------------------------------ */

function confirmFingerprintAttendance() {
  if (!selectedFingerprintStudentId) return;

  const scanButton = document.getElementById(
    "fingerprint-scan-button"
  );

  const scanTitle = document.getElementById(
    "fingerprint-scan-title"
  );

  const scanMessage = document.getElementById(
    "fingerprint-scan-message"
  );

  if (scanButton) {
    scanButton.classList.add("scanning");
  }

  if (scanTitle) {
    scanTitle.textContent = "Scanning...";
  }

  if (scanMessage) {
    scanMessage.textContent =
      "Verifying attendance...";
  }

  playFingerprintSound("scan");


  /* Simulated biometric scan */
  setTimeout(() => {

    if (scanButton) {
      scanButton.classList.remove("scanning");
      scanButton.classList.add("scan-success");
    }

    if (scanTitle) {
      scanTitle.textContent = "Attendance Confirmed";
    }

    if (scanMessage) {
      scanMessage.textContent =
        "Present successfully marked.";
    }

    playFingerprintSound("success");


    /* Automatically tick matching checkbox */
    const checkbox = document.querySelector(
      `.attendance-student-checkbox input[data-student-id="${selectedFingerprintStudentId}"]`
    );

    if (checkbox) {
      checkbox.checked = true;
    }


    /* Close popup after success */
    setTimeout(() => {

      closeFingerprintAttendance();

      if (scanButton) {
        scanButton.classList.remove("scan-success");
      }

    }, 900);

  }, 700);
}


/* ------------------------------------------------
   Setup fingerprint controls
------------------------------------------------ */

function setupFingerprintAttendanceControls() {

  const scanButton = document.getElementById(
    "fingerprint-scan-button"
  );

  const cancelButton = document.getElementById(
    "fingerprint-cancel-button"
  );

  const cancelTopButton = document.getElementById(
    "fingerprint-cancel-top"
  );

  const backdrop = document.querySelector(
    ".fingerprint-attendance-backdrop"
  );


  if (scanButton) {

  let scanHoldTimer = null;
  let isScanning = false;

  function startFingerprintScan(event) {
    event.preventDefault();

    if (isScanning) return;

    isScanning = true;

    scanButton.classList.remove("scan-success");
    scanButton.classList.add("scanning");

    const scanTitle = document.getElementById(
      "fingerprint-scan-title"
    );

    const scanMessage = document.getElementById(
      "fingerprint-scan-message"
    );

    if (scanTitle) {
      scanTitle.textContent = "Scanning...";
    }

    if (scanMessage) {
      scanMessage.textContent =
        "Keep your finger on the scanner.";
    }

    playFingerprintSound("scan");

    scanHoldTimer = setTimeout(() => {
      scanHoldTimer = null;
      confirmFingerprintAttendance();
    }, 1200);
  }

  function cancelFingerprintScan(event) {
    if (event) {
      event.preventDefault();
    }

    if (!isScanning) return;

    /* If scan already completed, don't cancel it */
    if (!scanHoldTimer) return;

    clearTimeout(scanHoldTimer);
    scanHoldTimer = null;

    isScanning = false;

    scanButton.classList.remove("scanning");

    const scanTitle = document.getElementById(
      "fingerprint-scan-title"
    );

    const scanMessage = document.getElementById(
      "fingerprint-scan-message"
    );

    if (scanTitle) {
      scanTitle.textContent = "Hold to Mark Present";
    }

    if (scanMessage) {
      scanMessage.textContent =
        "Keep your finger on the fingerprint.";
    }
  }

  /* Touch devices */
  scanButton.addEventListener(
    "pointerdown",
    startFingerprintScan
  );

  scanButton.addEventListener(
    "pointerup",
    cancelFingerprintScan
  );

  scanButton.addEventListener(
    "pointerleave",
    cancelFingerprintScan
  );

  scanButton.addEventListener(
    "pointercancel",
    cancelFingerprintScan
  );

  /* Prevent long-press browser menu */
  scanButton.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();
    }
  );
}


  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      closeFingerprintAttendance
    );
  }


  if (cancelTopButton) {
    cancelTopButton.addEventListener(
      "click",
      closeFingerprintAttendance
    );
  }


  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeFingerprintAttendance
    );
  }
}


/* FINGERPRINT ATTENDANCE FEATURE END */

/* ================================================================
   FEE PAYMENT STORAGE
   ================================================================ */

function getFeePayments() {
  return JSON.parse(
    localStorage.getItem("gazal_fee_payments") || "[]"
  );
}


function saveFeePayments(payments) {
  localStorage.setItem(
    "gazal_fee_payments",
    JSON.stringify(payments)
  );
}

      async function loadFeePaymentsFromFirestore() {

  if (!window.getFeePaymentsFromFirestore) {
    return getFeePayments();
  }

  try {

    const payments =
      await window.getFeePaymentsFromFirestore();

    saveFeePayments(payments);

    console.log(
      "Fee payments loaded from Firestore:",
      payments
    );

    return payments;

  } catch (error) {

    console.error(
      "Failed to load fee payments from Firestore:",
      error
    );

    return getFeePayments();
  }

      }


/*
  Check whether a specific student's
  4-class month has already been paid.
*/

function isFeeMonthPaid(
  studentId,
  monthNumber
) {
  const payments = getFeePayments();

  return payments.some(
    (payment) =>
      payment.studentId === studentId &&
      payment.monthNumber === monthNumber &&
      payment.status === "paid"
  );
}


/*
  Mark a student's specific 4-class month
  as paid.
*/

async function markFeeMonthPaid(
  studentId,
  monthNumber,
  feeMonthInfo
) {

  const payments = getFeePayments();

  const existingPayment = payments.find(
    (payment) =>
      payment.studentId === studentId &&
      payment.monthNumber === monthNumber
  );

  if (existingPayment) {

    existingPayment.status = "paid";

    existingPayment.paidDate =
      new Date().toISOString();

    existingPayment.feeMonth =
      feeMonthInfo?.month ?? null;

    existingPayment.feeYear =
      feeMonthInfo?.year ?? null;

    existingPayment.feeMonthMalayalam =
      feeMonthInfo?.monthNameMalayalam ?? "";

  } else {

    payments.push({
      studentId: studentId,

      monthNumber: monthNumber,

      status: "paid",

      paidDate:
        new Date().toISOString(),

      feeMonth:
        feeMonthInfo?.month ?? null,

      feeYear:
        feeMonthInfo?.year ?? null,

      feeMonthMalayalam:
        feeMonthInfo?.monthNameMalayalam ?? ""
    });

  }


  /* Save local backup */

  saveFeePayments(payments);


  /* ================================================================
     SAVE FEE PAYMENT TO FIRESTORE
     ================================================================ */

  const savedPayment = payments.find(
    (payment) =>
      payment.studentId === studentId &&
      payment.monthNumber === monthNumber
  );

console.log(
  "Fee Firestore function available:",
  typeof window.saveFeePaymentToFirestore
);

console.log(
  "Payment being saved:",
  savedPayment
);
  
  if (
    savedPayment &&
    window.saveFeePaymentToFirestore
  ) {

    try {

      await window.saveFeePaymentToFirestore(
        savedPayment
      );

    } catch (error) {

      console.error(
        "Fee payment cloud save failed:",
        error
      );

      alert(
        "Fee was saved locally, but cloud backup failed."
      );

    }

  }

}
/* ==========================================================================
   FEES STUDENT LIST START
   ========================================================================== */

async function renderFeesStudents() {
    await loadFeePaymentsFromFirestore();
  let attendanceRecords = [];

try {

  if (window.getAttendanceFromFirestore) {

    attendanceRecords =
      await window.getAttendanceFromFirestore();

  } else {

    attendanceRecords = JSON.parse(
      localStorage.getItem(
        "gazal_attendance"
      ) || "[]"
    );

  }

} catch (error) {

  console.error(
    "Failed to load attendance for fees:",
    error
  );

  attendanceRecords = JSON.parse(
    localStorage.getItem(
      "gazal_attendance"
    ) || "[]"
  );

}
  const list = document.getElementById(
    "fees-students-list"
  );

  if (!list) return;

  let students = [];

try {

  if (window.getStudentsFromFirestore) {

    students =
      await window.getStudentsFromFirestore();

  } else {

    students = JSON.parse(
      localStorage.getItem(
        "gazal_students"
      ) || "[]"
    );

  }

} catch (error) {

  console.error(
    "Failed to load students for fees:",
    error
  );

  students = JSON.parse(
    localStorage.getItem(
      "gazal_students"
    ) || "[]"
  );

}

  list.innerHTML = "";

  let totalStudents = students.length;

let dueStudents = 0;

let paidStudents = 0;

  if (students.length === 0) {
  list.innerHTML = `
    <div class="fees-empty-message">
      No students found.
    </div>
  `;
  return;
}

students.forEach((student) => {
    const card = document.createElement("div");

card.className = "fees-student-card";


/* ================================================================
   FEE STATUS CALCULATION
   ================================================================ */

const presentClasses = [];


attendanceRecords.forEach((record) => {

  record.students.forEach((attendanceStudent) => {

    if (
      attendanceStudent.id === student.id &&
      attendanceStudent.status === "present"
    ) {
      presentClasses.push(record.date);
    }

  });

});


const totalPresentClasses =
  presentClasses.length;


const completedMonths =
  Math.floor(totalPresentClasses / 4);


const latestCompletedMonth =
  completedMonths;


/*
  True when currently at exactly
  4, 8, 12... classes.
*/
const cycleCurrentlyComplete =
  totalPresentClasses > 0 &&
  totalPresentClasses % 4 === 0;


/*
  Check if ANY completed 4-class
  fee cycle is still unpaid.
*/
let hasUnpaidCompletedMonth = false;

for (
  let monthNumber = 1;
  monthNumber <= completedMonths;
  monthNumber++
) {

  if (
    !isFeeMonthPaid(
      student.id,
      monthNumber
    )
  ) {

    hasUnpaidCompletedMonth = true;
    break;

  }

}


/*
  Fee is due whenever at least one
  completed 4-class cycle remains unpaid.
*/
const feeDue =
  hasUnpaidCompletedMonth;


/*
  Show PAID only when the current
  cycle is exactly complete AND all
  completed cycles are paid.
*/
const latestMonthPaid =
  cycleCurrentlyComplete &&
  latestCompletedMonth > 0 &&
  !hasUnpaidCompletedMonth;

    if (feeDue) {
  dueStudents++;
}

if (latestMonthPaid) {
  paidStudents++;
}


card.innerHTML = `
  <div class="fees-card-top">

    <div class="fees-student-info">
      <strong>${student.studentName}</strong>

      <span class="fees-student-id">
        ${student.id}
      </span>
    </div>

    <div
  class="
    fees-status-badge
    ${
      latestMonthPaid
        ? "paid"
        : feeDue
          ? "not-paid"
          : "not-due"
    }
  "
>
  ${
    latestMonthPaid
      ? "ഫീസ് : അടച്ചു"
      : feeDue
        ? "ഫീസ് : അടച്ചില്ല"
        : "ഫീസ് : ഇപ്പോൾ അടക്കേണ്ടതില്ല"
  }
</div>

  </div>

  <div class="fees-card-divider"></div>

  <button
  type="button"
  class="fees-details-button"
>
  <span>
    നിലവിലെ ഫീസ് വിവരങ്ങൾ
  </span>

  <span class="fees-arrow">
    ›
  </span>
</button>
`;

    list.appendChild(card);
    const detailsButton = card.querySelector(
  ".fees-details-button"
);

if (detailsButton) {
  detailsButton.addEventListener("click", () => {
    openStudentFeeDetails(student);
  });
}
    });


  const totalStudentsElement =
    document.getElementById(
      "fees-stat-total-students"
    );

  const dueStudentsElement =
    document.getElementById(
      "fees-stat-due"
    );

  const paidStudentsElement =
    document.getElementById(
      "fees-stat-paid"
    );


  if (totalStudentsElement) {
    totalStudentsElement.textContent =
      totalStudents;
  }

  if (dueStudentsElement) {
    dueStudentsElement.textContent =
      dueStudents;
  }

  if (paidStudentsElement) {
    paidStudentsElement.textContent =
      paidStudents;
  }

}

/* FEES STUDENT LIST END */

// ================================================================
// STUDENT FEE DETAILS
// ================================================================

async function openStudentFeeDetails(student) {

  let attendanceRecords = [];

try {

  if (window.getAttendanceFromFirestore) {

    attendanceRecords =
      await window.getAttendanceFromFirestore();

  } else {

    attendanceRecords = JSON.parse(
      localStorage.getItem(
        "gazal_attendance"
      ) || "[]"
    );

  }

} catch (error) {

  console.error(
    "Failed to load attendance for fee details:",
    error
  );

  attendanceRecords = JSON.parse(
    localStorage.getItem(
      "gazal_attendance"
    ) || "[]"
  );

}

  const presentClasses = [];

  attendanceRecords.forEach((record) => {

    record.students.forEach((attendanceStudent) => {

      if (
        attendanceStudent.id === student.id &&
        attendanceStudent.status === "present"
      ) {
        presentClasses.push({
          date: record.date
        });
      }

    });

  });

  // Sort newest first
  presentClasses.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );

  const totalPresentClasses =
  presentClasses.length;


/*
  Each 4 Present classes = one month.
*/

const completedMonths =
  Math.floor(totalPresentClasses / 4);


/*
  Current active month number.

  Example:
  0–3 classes → Month 1
  4–7 classes → Month 2
  8–11 classes → Month 3
*/

const currentMonthNumber =
  completedMonths + 1;


/*
  Number of classes in the current
  unfinished month.
*/

const remainingClasses =
  totalPresentClasses % 4;


const displayClassesCount =
  remainingClasses === 0 &&
  totalPresentClasses > 0
    ? 4
    : remainingClasses;


const currentClasses =
  presentClasses.slice(
    0,
    displayClassesCount
  );

/* ================================================================
   CURRENT FEE PAYMENT STATUS
   ================================================================ */

/*
  The latest completed 4-class month.
*/

const latestCompletedMonth =
  completedMonths;


/*
  Check whether the latest completed month
  has already been paid.
*/

const cycleCurrentlyComplete =
  totalPresentClasses > 0 &&
  totalPresentClasses % 4 === 0;


/*
  Find the first completed 4-class cycle
  that has not yet been paid.
*/

const unpaidMonths = [];

for (
  let monthNumber = 1;
  monthNumber <= completedMonths;
  monthNumber++
) {

  if (
    !isFeeMonthPaid(
      student.id,
      monthNumber
    )
  ) {

    unpaidMonths.push(
      monthNumber
    );

  }

}


/*
  True when one or more completed
  fee cycles are still unpaid.
*/

const hasUnpaidCompletedMonth =
  unpaidMonths.length > 0;


/*
  The payment button always pays
  the oldest unpaid cycle first.
*/

const oldestUnpaidMonth =
  unpaidMonths.length > 0
    ? unpaidMonths[0]
    : null;


/*
  Fee is due if any completed cycle
  is still unpaid.
*/

const feeDue =
  hasUnpaidCompletedMonth;


/*
  Show "Paid" only if the student is
  currently exactly at the end of a
  completed cycle and everything is paid.
*/

const latestMonthPaid =
  cycleCurrentlyComplete &&
  latestCompletedMonth > 0 &&
  !hasUnpaidCompletedMonth;

  const feePayments =
  getFeePayments();

const latestPaymentRecord =
  feePayments.find(
    (payment) =>
      payment.studentId === student.id &&
      payment.monthNumber === latestCompletedMonth
  );

const studentPaymentHistory =
  feePayments
    .filter(
      (payment) =>
        payment.studentId === student.id &&
        payment.status === "paid"
    )
    .sort(
      (a, b) =>
        new Date(b.paidDate) -
        new Date(a.paidDate)
    );



  
  const overlay = document.createElement("div");

  overlay.className =
    "student-fee-details-overlay";

  overlay.innerHTML = `

    <div class="student-fee-details-modal">

      <div class="student-fee-details-header">

        <div>
          <h2>${student.studentName}</h2>

          <p>
            ${student.id}
          </p>
        </div>

        <button
          type="button"
          class="student-fee-details-close"
        >
          ×
        </button>

      </div>


      <div class="student-fee-details-progress">

        <div class="student-fee-details-progress-top">

          <span>
            ഈ മാസത്തെ ക്ലാസുകൾ
          </span>

          <strong>
            ${currentClasses.length} / 4
          </strong>

        </div>


        <div class="student-fee-details-dots">

          ${[0, 1, 2, 3]
            .map(
              (index) => `
                <span
                  class="
                    fee-class-dot
                    ${
                      index < currentClasses.length
                        ? "completed"
                        : ""
                    }
                  "
                ></span>
              `
            )
            .join("")}

        </div>

      </div>


      <div class="student-fee-details-classes">

        <h3>
          കഴിഞ്ഞ ക്ലാസുകൾ
        </h3>

        ${
          currentClasses.length === 0
            ? `
              <p class="fee-no-classes">
                ഹാജർ രേഖകൾ ലഭ്യമല്ല.
              </p>
            `
            : currentClasses
                .map(
                  (classItem, index) => `
                    <div
                      class="student-fee-class-row"
                    >

                      <span>
                        ക്ലാസ് ${index + 1}
                      </span>

                      <span>
                        ${classItem.date}
                      </span>

                      <span
                        class="
                          student-fee-class-present
                        "
                      >
                        ഹാജർ
                      </span>

                    </div>
                  `
                )
                .join("")
        }

      </div>


      <div class="student-fee-details-status">

  <span>
    ഫീസ്
  </span>

  <strong
    class="
      ${
        latestMonthPaid
          ? "fee-paid"
          : feeDue
            ? "fee-not-paid"
            : "fee-not-due"
      }
    "
  >
    ${
      latestMonthPaid
        ? "അടച്ചു"
        : feeDue
          ? "അടച്ചില്ല"
          : "ഇപ്പോൾ അടക്കേണ്ടതില്ല"
    }
  </strong>

</div>

${
  latestPaymentRecord &&
  latestPaymentRecord.feeMonthMalayalam
    ? `
      <div class="student-fee-month-info">

        <span class="student-fee-month-label">
          ഫീസ് മാസം
        </span>

        <strong class="student-fee-month-value">
          ${latestPaymentRecord.feeMonthMalayalam}
          ${latestPaymentRecord.feeYear}
        </strong>

      </div>
    `
    : ""
}

<div class="student-fee-history">

  <h3>
    ഫീസ് ഹിസ്റ്ററി
  </h3>

  ${
    studentPaymentHistory.length === 0
      ? `
        <p class="student-fee-history-empty">
          ഫീസ് അടച്ച വിവരങ്ങൾ ലഭ്യമല്ല.
        </p>
      `
      : studentPaymentHistory
          .map(
            (payment) => `
              <div class="student-fee-history-item">

  <div class="student-fee-history-main">

    <strong>
      ${
        payment.feeMonthMalayalam ||
        "ഫീസ് മാസം"
      }
      ${
        payment.feeYear || ""
      }
    </strong>

    <span>
      ഫീസ് : അടച്ചു
    </span>

  </div>


  <div class="student-fee-history-cycle">

    <span class="student-fee-history-cycle-icon">
      ✓
    </span>

    <span>
      4 ക്ലാസുകൾ പൂർത്തിയായി
    </span>

  </div>


  <div class="student-fee-history-date">

    അടച്ച തീയതി:
    ${
      payment.paidDate
  ? new Date(
      payment.paidDate
    ).toLocaleDateString(
      "ml-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    )
  : "-"
    }

  </div>

</div>
            `
          )
          .join("")
  }

</div>

${
  feeDue
    ? `
      <button
  type="button"
  class="mark-fee-paid-button"
>
  <span class="mark-fee-paid-icon">✓</span>

  <span class="mark-fee-paid-text">
    ഫീസ് അടച്ചാൽ ഇവിടെ ക്ലിക്ക് ചെയ്യുക
  </span>
</button>
    `
    : ""
}

    </div>

  `;


  document.body.appendChild(overlay);

  const markPaidButton =
  overlay.querySelector(
    ".mark-fee-paid-button"
  );

if (markPaidButton) {
  markPaidButton.addEventListener(
  "click",
  async () => {

      /*
  Create an oldest-first copy because
  getFeeMonthFromCycle() expects that order.
*/

const presentClassesOldestFirst =
  [...presentClasses].sort(
    (a, b) =>
      new Date(a.date) - new Date(b.date)
  );


/*
  Get the month of the final class that
  completed this 4-class fee cycle.
*/

const feeMonthInfo =
  getFeeMonthFromCycle(
    presentClassesOldestFirst,
    oldestUnpaidMonth
  );

/*
  Save payment together with the
  actual fee month.
*/

await markFeeMonthPaid(
  student.id,
  oldestUnpaidMonth,
  feeMonthInfo
);
      overlay.remove();

      openStudentFeeDetails(student);

      renderFeesStudents();
    }
  );
}


  const closeButton =
    overlay.querySelector(
      ".student-fee-details-close"
    );

  closeButton.addEventListener(
    "click",
    () => {
      overlay.remove();
    }
  );


  overlay.addEventListener(
    "click",
    (event) => {

      if (event.target === overlay) {
        overlay.remove();
      }

    }
  );

}

/* ================================================================
   GET FEE MONTH FROM COMPLETED 4-CLASS CYCLE
   ================================================================ */

function getFeeMonthFromCycle(
  presentClasses,
  monthNumber
) {

  /*
    Each fee month contains 4 present classes.

    Example:
    Month 1 → classes 1–4
    Month 2 → classes 5–8
  */

  const cycleSize = 4;

  const cycleEndIndex =
    monthNumber * cycleSize - 1;


  /*
    presentClasses must be sorted oldest first
    before calling this function.
  */

  const cycleEndClass =
    presentClasses[cycleEndIndex];


  if (!cycleEndClass) {
    return null;
  }


  const classDate =
    new Date(cycleEndClass.date);


  return {
    month:
      classDate.getMonth(),

    year:
      classDate.getFullYear(),

    monthNameMalayalam:
      [
        "ജനുവരി",
        "ഫെബ്രുവരി",
        "മാർച്ച്",
        "ഏപ്രിൽ",
        "മേയ്",
        "ജൂൺ",
        "ജൂലൈ",
        "ഓഗസ്റ്റ്",
        "സെപ്റ്റംബർ",
        "ഒക്ടോബർ",
        "നവംബർ",
        "ഡിസംബർ"
      ][classDate.getMonth()]
  };

}

/* ==========================================================================
   ATTENDANCE HISTORY
   ========================================================================== */

async function renderAttendanceHistory() {

  const historyList =
    document.getElementById(
      "attendance-history-list"
    );

  if (!historyList) return;


  /* ================================================================
   LOAD ATTENDANCE
   Firestore first, localStorage fallback
   ================================================================ */

let attendanceRecords = [];

try {

  if (window.getAttendanceFromFirestore) {

    attendanceRecords =
      await window.getAttendanceFromFirestore();

  }

} catch (error) {

  console.error(
    "Failed to load attendance from Firestore:",
    error
  );

  alert(
    "Failed to load attendance history:\n\n" +
    error.message
  );

}

/* LocalStorage fallback */

if (
  !attendanceRecords ||
  attendanceRecords.length === 0
) {

  attendanceRecords = JSON.parse(
    localStorage.getItem(
      "gazal_attendance"
    ) || "[]"
  );

}

  /* Newest date first */
  attendanceRecords.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  historyList.innerHTML = "";


  if (attendanceRecords.length === 0) {

    historyList.innerHTML = `
      <div class="attendance-history-empty">
        No attendance records found.
      </div>
    `;

    return;
  }


  attendanceRecords.forEach((record) => {

    const presentCount =
      record.students.filter(
        (student) =>
          student.status === "present"
      ).length;


    const absentCount =
      record.students.filter(
        (student) =>
          student.status === "absent"
      ).length;


    const item =
      document.createElement("div");


    item.className =
  "attendance-history-card";


    item.innerHTML = `

      <div class="attendance-history-item-top">

        <div>

          <strong>
            ${new Date(
              record.date
            ).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "long",
                year: "numeric"
              }
            )}
          </strong>

          <span>
            ${record.course}
          </span>

        </div>

      </div>


      <div
        class="
          attendance-history-item-stats
        "
      >

        <span
          class="
            attendance-history-present
          "
        >
          ${presentCount} Present
        </span>


        <span
          class="
            attendance-history-absent
          "
        >
          ${absentCount} Absent
        </span>

      </div>

    `;

     historyList.appendChild(item);

  });

}

/* ==========================================================================
   ATTENDANCE HISTORY MODAL CONTROLS
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const viewAttendanceHistoryButton =
      document.getElementById(
        "btn-view-attendance-history"
      );

    const attendanceHistoryModal =
      document.getElementById(
        "attendance-history-modal"
      );

    const closeAttendanceHistoryButton =
      document.getElementById(
        "btn-close-attendance-history"
      );

    const closeAttendanceHistoryFooterButton =
      document.getElementById(
        "btn-close-attendance-history-footer"
      );


    function closeAttendanceHistory() {

      if (attendanceHistoryModal) {
        attendanceHistoryModal.style.display =
          "none";
      }

    }


    if (viewAttendanceHistoryButton) {

      viewAttendanceHistoryButton.addEventListener(
        "click",
        async () => {

          if (attendanceHistoryModal) {
            attendanceHistoryModal.style.display =
              "flex";
          }

          await renderAttendanceHistory();

        }
      );

    }


    if (closeAttendanceHistoryButton) {

      closeAttendanceHistoryButton.addEventListener(
        "click",
        closeAttendanceHistory
      );

    }


    if (closeAttendanceHistoryFooterButton) {

      closeAttendanceHistoryFooterButton.addEventListener(
        "click",
        closeAttendanceHistory
      );

    }

  }
);


/* ================================================================
   TODAY'S ATTENDANCE POPUP
   ================================================================ */

async function openTodayAttendancePopup() {

  /* ------------------------------------------------
   LOAD ATTENDANCE RECORDS

   Firestore first.
   Local backup fallback.
   ------------------------------------------------ */

let attendanceRecords =
  [];


try {

  if (
    window.getAttendanceFromFirestore
  ) {

    attendanceRecords =
      await window
        .getAttendanceFromFirestore();

  }

} catch (error) {

  console.error(
    "Failed to load attendance from Firestore:",
    error
  );

}


/* ------------------------------------------------
   LOCAL BACKUP FALLBACK
   ------------------------------------------------ */

if (
  !Array.isArray(
    attendanceRecords
  ) ||
  attendanceRecords.length === 0
) {

  attendanceRecords =
    JSON.parse(
      localStorage.getItem(
        "gazal_attendance"
      ) || "[]"
    );

}


console.log(
  "ATTENDANCE RECORDS LOADED:",
  attendanceRecords
);

  /* ------------------------------------------------
     GET LOCAL TODAY DATE

     Do not use toISOString() directly because it
     uses UTC and can create date mismatches.
     ------------------------------------------------ */

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const today =
    `${year}-${month}-${day}`;


  console.log(
    "TODAY:",
    today
  );


  console.log(
    "ALL ATTENDANCE RECORDS:",
    attendanceRecords
  );


  /* ------------------------------------------------
     NORMALIZE DATE

     Supports:
     - YYYY-MM-DD
     - Date objects
     - Firestore Timestamp objects
     - ISO date strings
     ------------------------------------------------ */

  function normalizeAttendanceDate(
    dateValue
  ) {

    if (
      !dateValue
    ) {

      return "";

    }


    /*
      Already YYYY-MM-DD
    */

    if (
      typeof dateValue ===
      "string"
    ) {

      return dateValue
        .split(
          "T"
        )[0];

    }


    /*
      Firestore Timestamp
    */

    if (
      typeof dateValue.toDate ===
      "function"
    ) {

      const date =
        dateValue.toDate();


      const y =
        date.getFullYear();


      const m =
        String(
          date.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const d =
        String(
          date.getDate()
        ).padStart(
          2,
          "0"
        );


      return `${y}-${m}-${d}`;

    }


    /*
      JavaScript Date
    */

    if (
      dateValue instanceof Date
    ) {

      const y =
        dateValue.getFullYear();


      const m =
        String(
          dateValue.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const d =
        String(
          dateValue.getDate()
        ).padStart(
          2,
          "0"
        );


      return `${y}-${m}-${d}`;

    }


    return "";

  }


  /* ------------------------------------------------
     GET ONLY TODAY'S RECORDS
     ------------------------------------------------ */

  const todaysRecords =
    attendanceRecords.filter(
      (record) => {

        const recordDate =
          normalizeAttendanceDate(
            record.date
          );


        return (
          recordDate ===
          today
        );

      }
    );


  console.log(
    "TODAY'S RECORDS:",
    todaysRecords
  );


  /* ------------------------------------------------
     OVERALL TOTALS
     ------------------------------------------------ */

  let totalPresent =
    0;


  let totalAbsent =
    0;


  /* ------------------------------------------------
     COURSE-WISE SUMMARY
     ------------------------------------------------ */

  const courseAttendance =
    {};


  todaysRecords.forEach(
    (record) => {

      let present =
        0;


      let absent =
        0;


      const students =
        Array.isArray(
          record.students
        )
          ? record.students
          : [];


      students.forEach(
        (
          attendanceStudent
        ) => {

          if (
            attendanceStudent.status ===
            "present"
          ) {

            present++;

            totalPresent++;

          }


          if (
            attendanceStudent.status ===
            "absent"
          ) {

            absent++;

            totalAbsent++;

          }

        }
      );


      /*
        Add course if it doesn't exist.
      */

      const courseName =
        record.course ||
        "Unknown Course";


      if (
        !courseAttendance[
          courseName
        ]
      ) {

        courseAttendance[
          courseName
        ] = {

          present:
            0,

          absent:
            0

        };

      }


      courseAttendance[
        courseName
      ].present +=
        present;


      courseAttendance[
        courseName
      ].absent +=
        absent;

    }
  );


  /* ------------------------------------------------
     OVERALL PERCENTAGE
     ------------------------------------------------ */

  const totalMarked =
    totalPresent +
    totalAbsent;


  const attendancePercentage =
    totalMarked > 0
      ? Math.round(
          (
            totalPresent /
            totalMarked
          ) * 100
        )
      : 0;


  /* ------------------------------------------------
     CREATE POPUP
     ------------------------------------------------ */

  const overlay =
    document.createElement(
      "div"
    );


  overlay.className =
    "today-attendance-overlay";


  overlay.innerHTML = `

    <div class="today-attendance-popup">

      <div class="today-attendance-header">

        <div>

          <h2>
            ഇന്നത്തെ ഹാജർ
          </h2>

          <p>
            ${today}
          </p>

        </div>


        <button
          type="button"
          class="today-attendance-close"
        >
          ×
        </button>

      </div>


      <div
        class="
          today-attendance-summary
        "
      >

        <div
          class="
            today-attendance-stat
            present
          "
        >

          <span>
            ഹാജർ
          </span>

          <strong>
            ${totalPresent}
          </strong>

        </div>


        <div
          class="
            today-attendance-stat
            absent
          "
        >

          <span>
            ഹാജരായില്ല
          </span>

          <strong>
            ${totalAbsent}
          </strong>

        </div>


        <div
          class="
            today-attendance-stat
            percentage
          "
        >

          <span>
            ഹാജർ ശതമാനം
          </span>

          <strong>
            ${attendancePercentage}%
          </strong>

        </div>

      </div>


      <div
        class="
          today-attendance-course-list
        "
      >

        <h3>
          ഇന്നത്തെ ക്ലാസുകൾ
        </h3>


        ${
          Object.keys(
            courseAttendance
          ).length === 0

            ? `

              <div
                class="
                  today-attendance-empty
                "
              >

                ഇന്നത്തെ ഹാജർ രേഖകൾ
                ലഭ്യമല്ല.

              </div>

            `

            : Object.entries(
                courseAttendance
              )
                .map(
                  (
                    [
                      course,
                      data
                    ]
                  ) => {

                    const total =
                      data.present +
                      data.absent;


                    const percentage =
                      total > 0
                        ? Math.round(
                            (
                              data.present /
                              total
                            ) * 100
                          )
                        : 0;


                    return `

                      <div
                        class="
                          today-attendance-course-card
                        "
                      >

                        <h4>
                          ${course}
                        </h4>


                        <div
                          class="
                            today-attendance-course-info
                          "
                        >

                            <span>

                              ഹാജർ:

                              <strong>
                                ${data.present}
                              </strong>

                            </span>


                            <span>

                              ഹാജരായില്ല:

                              <strong>
                                ${data.absent}
                              </strong>

                            </span>


                            <span>
                              ${percentage}%
                            </span>

                        </div>

                      </div>

                    `;

                  }
                )
                .join(
                  ""
                )
        }

      </div>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  /* ------------------------------------------------
     CLOSE BUTTON
     ------------------------------------------------ */

  const closeButton =
    overlay.querySelector(
      ".today-attendance-close"
    );


  if (
    closeButton
  ) {

    closeButton.addEventListener(
      "click",
      () => {

        overlay.remove();

      }
    );

  }


  /* ------------------------------------------------
     CLOSE OUTSIDE POPUP
     ------------------------------------------------ */

  overlay.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        overlay
      ) {

        overlay.remove();

      }

    }
  );

}

/* ================================================================
   QR POPUP FEATURE
   ================================================================ */

function openQrPopup() {

  const overlay =
    document.getElementById(
      "qr-popup-overlay"
    );

  if (overlay) {
    overlay.classList.add("active");
  }

}


function closeQrPopup() {

  const overlay =
    document.getElementById(
      "qr-popup-overlay"
    );

  if (overlay) {
    overlay.classList.remove("active");
  }

}


function setupQrPopup() {

  const payButton =
    document.getElementById(
      "btn-pay"
    );

  const closeButton =
    document.getElementById(
      "qr-popup-close"
    );

  const overlay =
    document.getElementById(
      "qr-popup-overlay"
    );


  if (payButton) {

    payButton.addEventListener(
      "click",
      openQrPopup
    );

  }


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeQrPopup
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      (event) => {

        if (
          event.target === overlay
        ) {

          closeQrPopup();

        }

      }
    );

  }

}
