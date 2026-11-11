const API_BASE = "http://localhost:3000"; // or http://localhost:3000 for local testing

document.addEventListener("DOMContentLoaded", async () => {
  const { token } = await chrome.storage.local.get("token");
  if (token) showAppView();
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await chrome.storage.local.remove("token");
  location.reload();
});

document.getElementById("autofillBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "AUTOFILL" });
  window.close();
});

function showAppView() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("appView").style.display = "block";
}