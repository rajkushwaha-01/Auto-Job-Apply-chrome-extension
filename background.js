const API_BASE = "http://localhost:3000"; // change to your deployed URL once hosted

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "FETCH_PROFILE") {
    (async () => {
      try {
        const { token } = await chrome.storage.local.get("token");
        if (!token) {
          sendResponse({ error: "No token found" });
          return;
        }

        const res = await fetch(`${API_BASE}/api/autofill/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          sendResponse({ error: "Could not fetch profile" });
          return;
        }

        const profile = await res.json();
        sendResponse({ profile });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();
    return true; // keeps the message channel open for the async response
  }
});