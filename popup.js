const API_BASE = "http://localhost:3000"; // change to your deployed URL once hosted

document.addEventListener("DOMContentLoaded", async () => {
  const { token } = await chrome.storage.local.get("token");
  if (token) {
    showAppView();
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await doLogin();
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await chrome.storage.local.remove("token");
      location.reload();
    });
  }

  const autofillBtn = document.getElementById("autofillBtn");
  if (autofillBtn) {
    autofillBtn.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: "AUTOFILL" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
          alert("Could not reach this page. Try refreshing the job page and try again.");
        }
      });
      // popup stays open — no window.close() here
    });
  }
});

async function doLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.token) {
      await chrome.storage.local.set({ token: data.token });
      showAppView();
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login request failed:", err);
    alert("Request failed: " + err.message);
  }
}

function showAppView() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("appView").style.display = "block";
}