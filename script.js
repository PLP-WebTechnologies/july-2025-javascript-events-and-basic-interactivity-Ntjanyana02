"use strict";

/* ==========================================================
   SETUP & UTILITIES
   ========================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setText(id, msg) { $(id).textContent = msg; }

/* ==========================================================
   PART 1 — EVENT HANDLING (click, keyboard, mouseover)
   ========================================================== */
// Counter: click + Space key increments, Reset clears
(() => {
  const out = $("#countOut");
  const btnInc = $("#btnInc");
  const btnReset = $("#btnReset");
  let count = 0;

  function render() { out.textContent = String(count); }
  function inc() { count += 1; render(); }

  btnInc.addEventListener("click", inc);
  btnReset.addEventListener("click", () => { count = 0; render(); });

  // Keyboard: space increments when focused anywhere
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !e.repeat) {
      e.preventDefault(); // stop page from scrolling on Space
      inc();
    }
  });

  render();
})();

// Mouseover demo: mouseenter/leave + focus/blur for keyboard users
(() => {
  const box = $("#hoverDemo");
  const out = $("#hoverOut");
  const set = (msg) => out.textContent = msg;

  box.addEventListener("mouseenter", () => set("Mouse entered the box 🐭"));
  box.addEventListener("mouseleave", () => set("Mouse left the box 👋"));
  box.addEventListener("focus", () => set("Box focused via keyboard 👀"));
  box.addEventListener("blur", () => set("Box blurred."));
})();

// Theme toggle (also demonstrates localStorage)
(() => {
  const btn = $("#btnTheme");
  const key = "theme";
  if (localStorage.getItem(key) === "dark") document.body.classList.add("dark");

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(key, document.body.classList.contains("dark") ? "dark" : "light");
  });
})();

/* ==========================================================
   PART 2 — INTERACTIVE ELEMENTS (Accordion + Tabs)
   ========================================================== */
// Accordion (collapsible FAQ)
(() => {
  $$(".acc-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });
})();

// Tabs (accessible with arrows)
(() => {
  const tabs = $$(".tab");
  const panels = [$("#p1"), $("#p2"), $("#p3")];

  function activate(idx) {
    tabs.forEach((t, i) => {
      const selected = i === idx;
      t.classList.toggle("active", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    tabs[idx].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(i));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") activate((i + 1) % tabs.length);
      if (e.key === "ArrowLeft")  activate((i - 1 + tabs.length) % tabs.length);
    });
  });
})();

/* ==========================================================
   PART 3 — CUSTOM FORM VALIDATION (no HTML5-only validation)
   ========================================================== */
(() => {
  const form = $("#signupForm");
  const status = $("#formStatus");
  const demo = $("#btnDemoValid");

  // Helpers to show/clear per-field errors and visual state
  function showError(id, msg) {
    const input = $(id);
    const errId = "#err-" + id.slice(1); // e.g., #name -> #err-name
    $(errId).textContent = msg;
    input.classList.add("invalid");
    input.classList.remove("valid");
  }
  function clearError(id) {
    const input = $(id);
    const errId = "#err-" + id.slice(1);
    $(errId).textContent = "";
    input.classList.remove("invalid");
    input.classList.add("valid");
  }

  // Individual validators
  const nameOk = () => {
    const v = $("#name").value.trim();
    if (v.length < 2) return showError("#name", "Please enter at least 2 characters.");
    if (!/^[A-Za-z ,.'-]+$/.test(v)) return showError("#name", "Use letters and common name punctuation only.");
    clearError("#name");
    return true;
  };

  const emailOk = () => {
    const v = $("#email").value.trim();
    // Simple, practical regex for demo purposes
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return showError("#email", "Enter a valid email like you@example.com.");
    clearError("#email");
    return true;
  };

  const passwordOk = () => {
    const v = $("#password").value;
    if (v.length < 8) return showError("#password", "At least 8 characters required.");
    if (!/[A-Z]/.test(v)) return showError("#password", "Include at least one uppercase letter.");
    if (!/[a-z]/.test(v)) return showError("#password", "Include at least one lowercase letter.");
    if (!/\d/.test(v))   return showError("#password", "Include at least one digit.");
    clearError("#password");
    return true;
  };

  const confirmOk = () => {
    const p = $("#password").value;
    const c = $("#confirm").value;
    if (c !== p) return showError("#confirm", "Passwords do not match.");
    clearError("#confirm");
    return true;
  };

  const termsOk = () => {
    if (!$("#terms").checked) { $("#err-terms").textContent = "You must accept the terms."; return false; }
    $("#err-terms").textContent = "";
    return true;
  };

  // Real-time validation
  $("#name").addEventListener("input", nameOk);
  $("#email").addEventListener("input", emailOk);
  $("#password").addEventListener("input", () => { passwordOk(); confirmOk(); });
  $("#confirm").addEventListener("input", confirmOk);
  $("#terms").addEventListener("change", termsOk);

  // Submit handler — prevent submission on error
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop actual submission for this assignment
    const ok = [nameOk(), emailOk(), passwordOk(), confirmOk(), termsOk()].every(Boolean);

    if (!ok) {
      status.textContent = "Please fix the errors above and try again.";
      status.classList.remove("ok");
      return;
    }
    status.textContent = "🎉 Success! Your account has been created (demo).";
    status.classList.add("ok");
  });

  // Fill with valid demo data to test success path
  demo.addEventListener("click", () => {
    $("#name").value = "Amohelang Ntjanyana";
    $("#email").value = "amo@example.com";
    $("#password").value = "Secure123";
    $("#confirm").value = "Secure123";
    $("#terms").checked = true;
    nameOk(); emailOk(); passwordOk(); confirmOk(); termsOk();
    status.textContent = "Demo data filled. Press Create Account.";
    status.classList.remove("ok");
  });
})();
