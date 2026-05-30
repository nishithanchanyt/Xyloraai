// Wait for Firebase to be ready
window.onload = () => {
  const auth = window.firebaseAuth;
  const provider = new window.GoogleAuthProvider();

  // UI elements
  const loginScreen = document.getElementById("login-screen");
  const chatScreen = document.getElementById("chat-screen");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userPhoto = document.getElementById("user-photo");
  const userName = document.getElementById("user-name");
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  // Show correct screen based on auth state
  window.onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      loginScreen.classList.add("hidden");
      chatScreen.classList.remove("hidden");
      userPhoto.src = user.photoURL || "https://via.placeholder.com/36";
      userName.textContent = user.displayName;
      // Clear chat on fresh login (you can later load history from Firestore)
      chatBox.innerHTML = "";
    } else {
      loginScreen.classList.remove("hidden");
      chatScreen.classList.add("hidden");
    }
  });

  // Login with Google
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await window.signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check console.");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await window.signOut(auth);
  });

  // ---- DeepSeek API Integration ----
  const DEEPSEEK_API_KEY = "sk-1c33e647754a4677a7c28f051686f7a8";  // Replace with your real key (keep secret!)
  const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
  const MODEL_NAME = "deepseek-chat";  // or "deepseek-reasoner" for R1

  async function askXylora(prompt) {
    // Show a temporary loading message
    const loadingId = addMessage("ai", "Xylora is thinking...");
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I didn't get a response.";

      // Remove loading message
      document.getElementById(loadingId)?.remove();
      addMessage("ai", reply);
    } catch (error) {
      console.error("DeepSeek API error:", error);
      document.getElementById(loadingId)?.remove();
      addMessage("ai", "Oops! Something went wrong. Please try again.");
    }
  }

  function addMessage(role, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;
    msgDiv.textContent = text;
    msgDiv.id = `msg-${Date.now()}-${Math.random()}`; // unique ID for removal
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv.id;
  }

  // Send message on button click
  sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) return;
    addMessage("user", text);
    userInput.value = "";
    askXylora(text);
  });

  // Send on Enter key
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
};