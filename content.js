console.log("CONTENT SCRIPT LOADED on", window.location.href);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "AUTOFILL") {
    runAutofill();
    sendResponse({ status: "started" }); // acknowledges receipt, prevents lastError
  }
  return true; // keep channel open in case of async work
});

async function runAutofill() {
  const { token } = await chrome.storage.local.get("token");
  if (!token) {
    alert("Please log in via the extension popup first.");
    return;
  }

  chrome.runtime.sendMessage({ action: "FETCH_PROFILE" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Message to background failed:", chrome.runtime.lastError.message);
      alert("Could not reach the extension background. Try reloading the extension.");
      return;
    }

    if (response.error) {
      console.error("Autofill fetch failed:", response.error);
      alert("Could not fetch your profile: " + response.error);
      return;
    }

    console.log("PROFILE RECEIVED:", response.profile);
    runAutofillForPlatform(response.profile);
  });
}

function runAutofillForPlatform(profile) {
  const host = window.location.hostname;
  if (host.includes("greenhouse.io")) {
    fillGreenhouseForm(profile);
  } else if (host.includes("lever.co")) {
    fillLeverForm(profile);
  } else if (host.includes("ashbyhq.com")) {
    fillAshbyForm(profile);
  } else if (host.includes("workable.com")) {
    fillWorkableForm(profile);
  } else if (host.includes("myworkdayjobs.com")) {
    const hasFormFields = document.querySelectorAll('input[type="text"], input[type="email"]').length > 0;
    if (!hasFormFields) {
      showToast("Please create a Workday account / sign in first, then click Autofill again once you're on the application form.");
    } else {
      showToast("Workday support is still in progress.");
    }
  } else {
    showToast("This platform isn't supported yet.");
  }
}

function findField(patterns) {
  for (const pattern of patterns) {
    const field = document.querySelector(pattern);
    if (field) return field;
  }
  return null;
}

function findFieldByLabelText(labelText) {
  const labels = Array.from(document.querySelectorAll('label'));
  const match = labels.find(l => l.textContent.toLowerCase().includes(labelText.toLowerCase()));
  if (!match) return null;

  if (match.htmlFor) {
    const byId = document.getElementById(match.htmlFor);
    if (byId) return byId;
  }
  return match.closest('div')?.querySelector('input, textarea') || null;
}

function fillGreenhouseForm(profile) {
  const fieldMap = [
    {
      patterns: [
        'input[name="first_name"]',
        'input[name*="first_name" i]',
        'input[id*="first_name" i]',
        'input[autocomplete="given-name"]'
      ],
      value: profile.firstName
    },
    {
      patterns: [
        'input[name="last_name"]',
        'input[name*="last_name" i]',
        'input[id*="last_name" i]',
        'input[autocomplete="family-name"]'
      ],
      value: profile.lastName
    },
    {
      patterns: [
        'input[name="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[autocomplete="email"]'
      ],
      value: profile.email
    },
    {
      patterns: [
        'input[name="phone"]',
        'input[type="tel"]',
        'input[name*="phone" i]',
        'input[id*="phone" i]'
      ],
      value: profile.phone
    },
    {
      patterns: [
        'input[name*="linkedin" i]',
        'input[id*="linkedin" i]'
      ],
      value: profile.linkedin
    }
  ];

  let filledCount = 0;

  fieldMap.forEach(({ patterns, value }) => {
    if (!value) return;
    const field = findField(patterns);
    console.log(`Greenhouse — Trying: ${patterns.join(", ")} | Found: ${!!field}`);
    if (field) {
      setNativeValue(field, value);
      filledCount++;
    }
  });

  if (profile.linkedin) {
    const alreadyFilled = findField(['input[name*="linkedin" i]', 'input[id*="linkedin" i]']);
    if (!alreadyFilled) {
      const linkedinField = findFieldByLabelText("LinkedIn");
      console.log("LinkedIn label-based fallback | Found:", !!linkedinField);
      if (linkedinField) {
        setNativeValue(linkedinField, profile.linkedin);
        filledCount++;
      }
    }
  }

  if (profile.github) {
    const githubField = findFieldByLabelText("GitHub") || findFieldByLabelText("Portfolio");
    console.log("GitHub label-based fallback | Found:", !!githubField);
    if (githubField) {
      setNativeValue(githubField, profile.github);
      filledCount++;
    }
  }

  showToast(`Autofilled ${filledCount} fields. Attach resume/cover letter manually, and review dropdown/custom questions yourself.`);
}

function fillLeverForm(profile) {
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  const fieldMap = [
    { patterns: ['input[name="name"]'], value: fullName },
    { patterns: ['input[name="email"]'], value: profile.email },
    { patterns: ['input[name="phone"]'], value: profile.phone },
    { patterns: ['input[name="org"]'], value: profile.currentCompany },
    { patterns: ['input[name="urls[LinkedIn]"]'], value: profile.linkedin },
    { patterns: ['input[name="urls[GitHub]"]'], value: profile.github },
    { patterns: ['input[name="urls[Portfolio]"]'], value: profile.portfolio }
  ];

  let filledCount = 0;
  fieldMap.forEach(({ patterns, value }) => {
    if (!value) return;
    const field = findField(patterns);
    console.log(`Lever — Trying: ${patterns.join(", ")} | Found: ${!!field}`);
    if (field) {
      setNativeValue(field, value);
      filledCount++;
    }
  });

  showToast(`Autofilled ${filledCount} fields on Lever. Attach resume manually, and review the pronouns/demographic survey yourself.`);
}

function fillAshbyForm(profile) {
  const fieldMap = [
    { patterns: ['input[name="_systemfield_name"]'], value: `${profile.firstName} ${profile.lastName}`.trim() },
    { patterns: ['input[name="_systemfield_email"]'], value: profile.email }
  ];

  let filledCount = 0;
  fieldMap.forEach(({ patterns, value }) => {
    if (!value) return;
    const field = findField(patterns);
    console.log(`Ashby — Trying: ${patterns.join(", ")} | Found: ${!!field}`);
    if (field) {
      setNativeValue(field, value);
      filledCount++;
    }
  });

  const labelFallbacks = [
    { label: "Phone", value: profile.phone },
    { label: "LinkedIn", value: profile.linkedin },
    { label: "GitHub", value: profile.github },
    { label: "Portfolio", value: profile.portfolio }
  ];

  labelFallbacks.forEach(({ label, value }) => {
    if (!value) return;
    const field = findFieldByLabelText(label);
    console.log(`Ashby label fallback — ${label} | Found: ${!!field}`);
    if (field) {
      setNativeValue(field, value);
      filledCount++;
    }
  });

  showToast(`Autofilled ${filledCount} fields on Ashby. Attach resume manually, and double-check phone/links filled into the right boxes.`);
}

function fillWorkableForm(profile) {
  const fieldMap = [
    { patterns: ['input[name="firstname"]'], value: profile.firstName },
    { patterns: ['input[name="lastname"]'], value: profile.lastName },
    { patterns: ['input[name="email"]'], value: profile.email },
    { patterns: ['input[name="phone"]'], value: profile.phone }
  ];

  let filledCount = 0;
  fieldMap.forEach(({ patterns, value }) => {
    if (!value) return;
    const field = findField(patterns);
    console.log(`Workable — Trying: ${patterns.join(", ")} | Found: ${!!field}`);
    if (field) {
      setNativeValue(field, value);
      filledCount++;
    }
  });

  showToast(`Autofilled ${filledCount} fields on Workable. Attach resume manually, and review the custom screening questions yourself.`);
}

function setNativeValue(element, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeInputValueSetter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.textContent = text;
  toast.style.cssText = "position:fixed;bottom:20px;right:20px;background:#1a1a1a;color:#fff;padding:12px 16px;border-radius:8px;z-index:99999;font-family:sans-serif;max-width:320px;";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}