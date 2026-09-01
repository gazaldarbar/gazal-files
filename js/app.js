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
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  btnEl.classList.add("active");

  const main = document.getElementById("main-content");

if (key === "home") {
  document.getElementById("home-panel").style.display = "block";
  document.getElementById("placeholder-panel").style.display = "none";
  document.getElementById("students-panel").style.display = "none";
  document.getElementById("add-student-panel").style.display = "none";
  return;
}

if (key === "students") {
  document.getElementById("home-panel").style.display = "none";
  document.getElementById("placeholder-panel").style.display = "none";
  document.getElementById("add-student-panel").style.display = "none";
  document.getElementById("students-panel").style.display = "block";

  renderStudentsList();
  return;
}
  document.getElementById("home-panel").style.display = "none";
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
  document.getElementById("add-student-panel").style.display = "none";
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
  const courseSelect = document.getElementById("student-course");

  if (!courseSelect) return;

  // Keep the first placeholder option.
  courseSelect.innerHTML = `<option value="">Select Course</option>`;

  GAZAL_COURSES.forEach((course) => {
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    courseSelect.appendChild(option);
  });
}

/* COURSE LIST FEATURE END */

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
