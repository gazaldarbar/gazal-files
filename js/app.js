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

function handleStudentFormSubmit(event) {
  event.preventDefault();

  /*
   * Saving student data will be added in the next step.
   * For now this confirms that the form itself works.
   */

  alert("Student form is ready. Saving will be added next.");
}

/* ADD STUDENT FEATURE END */

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
