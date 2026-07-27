// Firebase Configuration directly from user request
const firebaseConfig = {
  apiKey: "AIzaSyDg9l2YfP1q5saXKbIwpKX-ZaH-EeIaLZ4",
  authDomain: "codequest-f20b0.firebaseapp.com",
  projectId: "codequest-f20b0",
  storageBucket: "codequest-f20b0.firebasestorage.app",
  messagingSenderId: "353052426911",
  appId: "1:353052426911:web:5ccc3e975ae2ee4fbad8aa",
  // Added a fallback for older/new RTDB URL structure just in case
  databaseURL: "https://codequest-f20b0-default-rtdb.firebaseio.com"
};

let database;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const adminCard = document.getElementById('adminCard');
const adminPassword = document.getElementById('adminPassword');
const loginStatus = document.getElementById('loginStatus');

const headlineInput = document.getElementById('headlineInput');
const headlineForm = document.getElementById('headlineForm');
const updateBtn = document.getElementById('updateBtn');
const statusMessage = document.getElementById('statusMessage');

// Default initial value
const defaultHeadline = "श्री शनिदेवाय नमः | नवसाचा शनिदेव मंदिर देवस्थान, हलगरा मध्ये आपले सहर्ष स्वागत आहे! | दर्शन आणि आरतीच्या वेळापत्रकासाठी खालील माहिती पहा.";

// --- Security Gateway ---
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pwd = adminPassword.value;
    
    // Simple password check
    if (pwd === "Admin@123") {
      loginCard.style.display = 'none';
      adminCard.style.display = 'block';
      initFirebaseAdmin();
    } else {
      loginStatus.textContent = "Incorrect password. Please try again.";
      loginStatus.className = "status-message error";
      loginStatus.style.display = 'block';
      setTimeout(() => {
        loginStatus.style.display = 'none';
      }, 3000);
    }
  });
}

// --- Firebase Initialization ---
function initFirebaseAdmin() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      database = firebase.database();
      loadHeadline();
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    showStatus("Warning: Could not connect to Firebase.", "error");
  }
}

function loadHeadline() {
  database.ref('headline').once('value')
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        headlineInput.value = data;
      } else {
        headlineInput.value = defaultHeadline;
      }
    })
    .catch((error) => {
      console.warn("Could not load from Firebase", error);
      headlineInput.value = defaultHeadline;
      showStatus("Warning: Could not connect to Firebase.", "error");
    });
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  setTimeout(() => {
    statusMessage.style.display = 'none';
    statusMessage.className = 'status-message';
  }, 4000);
}

// Handle form submit for updating headline
if (headlineForm) {
  headlineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newHeadline = headlineInput.value.trim();

    if (!newHeadline) {
      showStatus("Headline cannot be empty.", "error");
      return;
    }

    updateBtn.disabled = true;
    updateBtn.textContent = "Updating...";

    const setPromise = database.ref('headline').set(newHeadline);
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Firebase write timeout. Database might not exist or rules are blocking.")), 6000);
    });

    Promise.race([setPromise, timeoutPromise])
      .then(() => {
        showStatus("Headline updated successfully!", "success");
      })
      .catch((error) => {
        console.error("Error updating headline: ", error);
        showStatus("Error: " + error.message, "error");
      })
      .finally(() => {
        updateBtn.disabled = false;
        updateBtn.textContent = "Update Headline";
      });
  });
}
