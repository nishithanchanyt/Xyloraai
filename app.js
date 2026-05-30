// -------- Firebase Imports ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// -------- Your Firebase config ----------
const firebaseConfig = {
  apiKey: "AIzaSyCs_znyDpcLh4IkyBy5b8sG8_ijtVa9qc0",
  authDomain: "xylora-ai.firebaseapp.com",
  databaseURL: "https://xylora-ai-default-rtdb.firebaseio.com",
  projectId: "xylora-ai",
  storageBucket: "xylora-ai.firebasestorage.app",
  messagingSenderId: "661792524043",
  appId: "1:661792524043:web:9220837635a325e7b5c40e",
  measurementId: "G-E1N0YHWQDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// -------- DOM elements ----------
const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const googleLoginBtn = document.getElementById("google-login-btn");
const logoutBtn = document.getElementById("logout-btn");
const sidebarAvatar = document.getElementById("sidebar-avatar");
const sidebarName = document.getElementById("sidebar-name");
const headerAvatar = document.getElementById("header-avatar");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
const sidebar = document.getElementById("sidebar");

// -------- Auth state observer ----------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
    const photo = user.photoURL || "https://via.placeholder.com/36";
    sidebarAvatar.src = photo;
    headerAvatar.src = photo;
    sidebarName.textContent = user.displayName || "User";
    // Reset chat to welcome message
    chatBox.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">✨</div>
        <h2>Welcome back, ${user.displayName?.split(' ')[0] || 'friend'}</h2>
        <p>How can Xylora help you today?</p>
      </div>`;
  } else {
    loginScreen.classList.remove("hidden");
    chatScreen.classList.add("hidden");
  }
});

// -------- Event listeners ----------
googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed. See console.");
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

userInput.addEventListener("input", () => {
  sendBtn.disabled = userInput.value.trim() === "";
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
});

// -------- Groq API (free) ----------
const GROQ_API_KEY = "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";  // <-- PUT YOUR KEY HERE
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant";

async function askXylora(prompt) {
  const welcomeEl = chatBox.querySelector(".welcome-message");
  if (welcomeEl) welcomeEl.remove();

  appendMessage("user", prompt);
  const typingId = appendTypingIndicator();

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "You are Xylora, a friendly, creative, and helpful AI assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I didn't get that.";

    removeTypingIndicator(typingId);
    appendMessage("ai", reply);
  } catch (error) {
    console.error("Groq API error:", error);
    removeTypingIndicator(typingId);
    appendMessage("ai", "Oops! Something went wrong. Please try again.");
  }
}

function appendMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTypingIndicator() {
  const id = "typing-" + Date.now();
  const typingDiv = document.createElement("div");
  typingDiv.className = "message ai";
  typingDiv.id = id;
  typingDiv.innerHTML = `<div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";
  userInput.style.height = "auto";
  sendBtn.disabled = true;
  askXylora(text);
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Dummy sidebar conversations
const list = document.getElementById("conversation-list");
const titles = ["Brainstorming ideas", "Code review help", "Story writing", "Travel tips"];
list.innerHTML = titles.map(title => `<div class="conversation-item">${title}</div>`).join("");
