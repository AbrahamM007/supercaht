import React, { useRef, useState } from 'react';
import './App.css';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArh5xqjve7Ko2PJ9M0R4vEqSvphj2NW6w",
  authDomain: "superchat-cfc50.firebaseapp.com",
  projectId: "superchat-cfc50",
  storageBucket: "superchat-cfc50.appspot.com",
  messagingSenderId: "886466090729",
  appId: "1:886466090729:web:90c0987c7bfb92b7b8c278"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  // Copy all page content
  const copyPageContent = () => {
    const pageContent = document.body.innerText;
    navigator.clipboard.writeText(pageContent).then(() => {
      alert("Page content copied to clipboard!");
    }).catch(err => {
      alert("Failed to copy content. Error: " + err);
    });
  };

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬 SuperChat</h1>
        <SignOut />
        <button className="copy-button" onClick={copyPageContent}>Copy Page Content</button>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  // Email sign-in states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("User signed in");
    } catch (error) {
      console.error("Error during sign-in", error);
      alert("Error during sign-in. Please try again.");
    }
  };

  // Email sign-in
  const signInWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in with email");
    } catch (error) {
      console.error("Error during email sign-in", error);
      alert("Error signing in with email. Please try again.");
    }
  };

  // Email account creation
  const registerWithEmail = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Account created");
    } catch (error) {
      console.error("Error during account creation", error);
      alert("Error creating account. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <button className="sign-in google-btn" onClick={signInWithGoogle}>Sign in with Google</button>

      <div className="email-signin">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="auth-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="auth-input"
        />

        <div className="auth-buttons">
          <button className="sign-in email-btn" onClick={signInWithEmail}>Sign in with Email</button>
          <button className="sign-in email-btn" onClick={registerWithEmail}>Register with Email</button>
        </div>
      </div>

      <p className="guidelines-text">Do not violate the community guidelines or you will be banned for life!</p>
    </div>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>
      Sign Out
    </button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;
