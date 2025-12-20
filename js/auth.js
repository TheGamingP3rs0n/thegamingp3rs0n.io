// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "flixer-3d421",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Show/hide elements based on login
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('new-post').style.display = 'block';
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('logoutLink').style.display = 'inline';
  } else {
    document.getElementById('new-post').style.display = 'none';
    document.getElementById('loginLink').style.display = 'inline';
    document.getElementById('logoutLink').style.display = 'none';
  }
});

// Logout
document.getElementById('logoutLink').addEventListener('click', () => {
  auth.signOut();
});
