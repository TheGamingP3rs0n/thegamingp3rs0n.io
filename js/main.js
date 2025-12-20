// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Create a post
function createPost() {
  const content = document.getElementById('post-content').value;
  if (!content) return alert('Post cannot be empty!');

  db.collection('posts').add({
    content: content,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('post-content').value = '';
    loadPosts();
  });
}

// Load posts
function loadPosts() {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  db.collection('posts').orderBy('timestamp', 'desc').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const post = doc.data();
        const div = document.createElement('div');
        div.className = 'post';
        div.innerText = post.content;
        feed.appendChild(div);
      });
    });
}

// Initial load
loadPosts();
