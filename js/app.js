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
  document.getElementById("search-box").insertAdjacentHTML("afterbegin", icon("search"));

  // Placeholder stats — wired to real data in Phase 2/3/4.
  document.getElementById("stat-students").textContent = "—";
  document.getElementById("stat-classes").textContent = "—";
  document.getElementById("stat-attendance").textContent = "—";
  document.getElementById("stat-fees").textContent = "—";

  setActionButton("btn-new-student", "plus", t("actionNewStudent"));
  setActionButton("btn-students", "students", t("actionStudents"));
  setActionButton("btn-attendance-home", "attendance", t("actionAttendance"));
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
    "placeholder-panel"
  ];

  panels.forEach((id) => {
    const panel = document.getElementById(id);

    if (panel) {
      panel.style.display = "none";
    }
  });

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

    renderStudentsList();
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
    addButton.addEventListener("click", openAddStudentForm);
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", closeAddStudentForm);
  }

  if (form) {
    form.addEventListener("submit", handleStudentFormSubmit);
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

/* ==========================================================================
   STUDENT ID GENERATOR START
   ========================================================================== */

function generateStudentId() {
  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  const nextNumber = students.length + 1;

  return "GZ-" + String(nextNumber).padStart(4, "0");
}

/* STUDENT ID GENERATOR END */

/* ==========================================================================
   STUDENT LOCAL MEMORY FEATURE START
   Reversible: this section saves students in this device's localStorage.
   ========================================================================== */
function handleStudentFormSubmit(event) {
  event.preventDefault();

  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  const studentData = {
    studentName: document.getElementById("student-name").value.trim(),
    parentName: document.getElementById("parent-name").value.trim(),
    place: document.getElementById("student-place").value.trim(),
    phone: document.getElementById("student-phone").value.trim(),
    backupPhone: document.getElementById("backup-phone").value.trim(),
    course: document.getElementById("student-course").value,
    admissionDate: document.getElementById("admission-date").value,
  };

  let savedStudent = null;

  if (editingStudentId) {
    const studentIndex = students.findIndex(
      (student) => student.id === editingStudentId
    );

    if (studentIndex === -1) {
      alert("Student could not be found. Please try again.");
      editingStudentId = null;
      return;
    }

    students[studentIndex] = {
      ...students[studentIndex],
      ...studentData,
      updatedAt: new Date().toISOString(),
    };

    savedStudent = students[studentIndex];
  } else {
    savedStudent = {
      id: generateStudentId(),
      ...studentData,
      createdAt: new Date().toISOString(),
    };

    students.push(savedStudent);
  }

  localStorage.setItem(
    "gazal_students",
    JSON.stringify(students)
  );

  event.target.reset();

  editingStudentId = null;

  const formTitle = document.querySelector(
    "#add-student-panel .form-header h2"
  );

  if (formTitle) {
    formTitle.textContent = "Add Student";
  }

  document.getElementById("btn-save-student").textContent =
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

function renderAttendanceStudents() {
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

  const selectedCourse = courseSelect.value;

  // Don't open the popup until a course is selected.
  if (!selectedCourse) {
    return;
  }

  // Load saved students.
  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  // Find students belonging to the selected course.
  const courseStudents = students.filter(
    (student) => student.course === selectedCourse
  );

  const attendanceRecords = JSON.parse(
  localStorage.getItem("gazal_attendance") || "[]"
);

const savedAttendance = attendanceRecords.find(
  (record) =>
    record.course === selectedCourse &&
    record.date === dateInput.value
);

  // Update popup details.
  if (modalCourse) {
    modalCourse.textContent = selectedCourse;
  }

  if (modalDate) {
    modalDate.textContent =
      dateInput.value || "";
  }

  // Clear previous students.
  modalStudents.innerHTML = "";

  // No students found.
  if (courseStudents.length === 0) {
    modalStudents.innerHTML = `
      <div class="attendance-modal-empty">
        No students found in this course.
      </div>
    `;
  } else {
    courseStudents.forEach((student) => {
      const card = document.createElement("div");

      card.className = "attendance-modal-student-card";

      card.innerHTML = `
  <div class="attendance-student-main">

    <button
      type="button"
      class="attendance-student-name"
      data-student-id="${student.id}"
    >
      <strong>${student.studentName}</strong>
      <span>${student.id}</span>
    </button>

    <label class="attendance-student-checkbox">
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

      const studentNameButton = card.querySelector(
  ".attendance-student-name"
);

if (studentNameButton) {
  studentNameButton.addEventListener("click", () => {
    openFingerprintAttendance(student);
  });
}

      modalStudents.appendChild(card);
    });
  }

  // Open attendance modal.
  modal.style.display = "flex";
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
   Saves Present / Absent records permanently in localStorage.
   ========================================================================== */

function saveAttendance() {
  const courseSelect =
    document.getElementById("attendance-course");

  const dateInput =
    document.getElementById("attendance-date");

  const modalStudents =
    document.getElementById("attendance-modal-students");

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
    alert("Please select both course and date.");
    return;
  }

  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  const checkboxes =
    modalStudents.querySelectorAll(
      'input[type="checkbox"][data-student-id]'
    );

  const attendanceStudents = [];

  checkboxes.forEach((checkbox) => {
    const studentId =
      checkbox.dataset.studentId;

    const student = students.find(
      (item) => item.id === studentId
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

  const attendanceRecords = JSON.parse(
    localStorage.getItem(
      "gazal_attendance"
    ) || "[]"
  );

  /* Remove an existing record for the
     same course and same date. */
  const updatedRecords =
    attendanceRecords.filter(
      (record) =>
        !(
          record.course === course &&
          record.date === date
        )
    );

  updatedRecords.push({
    course: course,
    date: date,
    students: attendanceStudents,
    savedAt: new Date().toISOString()
  });

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
   STUDENT LIST FEATURE START
   Reversible: remove this block to remove student list rendering.
   ========================================================================== */

function renderStudentsList(searchQuery = "") {
  const students = searchQuery
  ? getStudentSearchMatches(searchQuery)
  : JSON.parse(
      localStorage.getItem("gazal_students") || "[]"
    );

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

const attendanceRecords = JSON.parse(
  localStorage.getItem("gazal_attendance") || "[]"
);

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


const latestMonthPaid =
  latestCompletedMonth > 0
    ? isFeeMonthPaid(
        student.id,
        latestCompletedMonth
      )
    : false;


const feeDue =
  latestCompletedMonth > 0 &&
  !latestMonthPaid;

    card.innerHTML = `
  <div class="student-card-top">
    <div>
      <h3>${student.studentName}</h3>
      <p class="student-card-id">${student.id}</p>
    </div>

    <span class="student-course-badge">${student.course}</span>
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

function deleteStudent(studentId) {
  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  const student = students.find(
    (item) => item.id === studentId
  );

  if (!student) return;

  const confirmed = confirm(
    `Delete ${student.studentName}?\n\nThis action cannot be undone.`
  );

  if (!confirmed) return;

  const updatedStudents = students.filter(
    (item) => item.id !== studentId
  );

  localStorage.setItem(
    "gazal_students",
    JSON.stringify(updatedStudents)
  );

  renderStudentsList();
}

/* STUDENT DELETE FEATURE END */

/* ==========================================================================
   STUDENT EDIT FEATURE START
   Reversible: remove this block to remove student editing.
   ========================================================================== */

let editingStudentId = null;

function editStudent(studentId) {
  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  const student = students.find(
    (item) => item.id === studentId
  );

  if (!student) return;

  editingStudentId = studentId;

  // Open the existing student form.
  document.getElementById("students-panel").style.display = "none";
  document.getElementById("home-panel").style.display = "none";
  document.getElementById("placeholder-panel").style.display = "none";
  document.getElementById("add-student-panel").style.display = "block";

  // Change form title.
  const formTitle = document.querySelector(
    "#add-student-panel .form-header h2"
  );

  if (formTitle) {
    formTitle.textContent = "Edit Student";
  }

  // Fill existing student data.
  document.getElementById("student-name").value =
    student.studentName || "";

  document.getElementById("parent-name").value =
    student.parentName || "";

  document.getElementById("student-place").value =
    student.place || "";

  document.getElementById("student-phone").value =
    student.phone || "";

  document.getElementById("backup-phone").value =
    student.backupPhone || "";

  document.getElementById("student-course").value =
    student.course || "";

  document.getElementById("admission-date").value =
    student.admissionDate || "";

  // Change Save button text.
  document.getElementById("btn-save-student").textContent =
    "Save";

  document.getElementById("main-content").scrollTop = 0;
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

function markFeeMonthPaid(
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

  saveFeePayments(payments);
}

/* ==========================================================================
   FEES STUDENT LIST START
   ========================================================================== */

function renderFeesStudents() {
  const list = document.getElementById(
    "fees-students-list"
  );

  if (!list) return;

  const students = JSON.parse(
    localStorage.getItem("gazal_students") || "[]"
  );

  list.innerHTML = "";

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

const attendanceRecords = JSON.parse(
  localStorage.getItem("gazal_attendance") || "[]"
);

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


const latestMonthPaid =
  latestCompletedMonth > 0
    ? isFeeMonthPaid(
        student.id,
        latestCompletedMonth
      )
    : false;


const feeDue =
  latestCompletedMonth > 0 &&
  !latestMonthPaid;


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
}

/* FEES STUDENT LIST END */

// ================================================================
// STUDENT FEE DETAILS
// ================================================================

function openStudentFeeDetails(student) {

  const attendanceRecords = JSON.parse(
    localStorage.getItem("gazal_attendance") || "[]"
  );

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

const latestMonthPaid =
  latestCompletedMonth > 0
    ? isFeeMonthPaid(
        student.id,
        latestCompletedMonth
      )
    : false;

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


/*
  A fee is currently due when at least one
  completed month exists and the latest
  completed month has not been paid.
*/

const feeDue =
  latestCompletedMonth > 0 &&
  !latestMonthPaid;
  
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

                <div class="student-fee-history-date">

                  അടച്ച തീയതി:
                  ${
                    payment.paidDate
                      ? new Date(
                          payment.paidDate
                        ).toLocaleDateString(
                          "en-GB"
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
    () => {

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
    latestCompletedMonth
  );


/*
  Save payment together with the
  actual fee month.
*/

markFeeMonthPaid(
  student.id,
  latestCompletedMonth,
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
