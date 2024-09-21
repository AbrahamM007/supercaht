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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const googleAuthUrl = "https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?response_type=code&client_id=886466090729-7jo0ga9nqcpknnqp8ggbsqp5i24rjfhc.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fsuperchat-cfc50.firebaseapp.com%2F__%2Fauth%2Fhandler&state=AMbdmDnxYgckxN5ApQqLd18lmjFfkPZg2YqHtFRk9ycTXw8apOtyPT7-5mRXdUPFOHPMXPlc3akZKi21nXqRTQz-w5FV6HZ-vKL_-0Jf5j5JWOfvXUXsyTlVyOmptKO5gGRwjW7e3wLk7pU1wMM9Td5eCeL68MBh6XJ0Ai-vB9oqGO9aqPGgd-buydxIdyD3iYGBHBxiiY20WA5wnccj7zekrCMeCdoY2kNMA8vG8XDtV5RDyqAnnF5Zxpc_fyo9xZIv-9FmhmWNXvUpM6QB1DVR9EwyLxfDFoHn5napAbuWZ7Jglxh2w9g2LQkjRxLWN-e3IB1BXRxf1Q&scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&context_uri=http%3A%2F%2Flocalhost%3A3000&service=lso&o2v=1&ddm=0&flowName=GeneralOAuthFlow";

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in", error);
      alert("Error during sign-in. Please try again.");
    }
  };
  

  const signInWithEmail = async (e) => {
    e.preventDefault();
    // Add your logic to sign in with email using Firebase
  };

  const registerWithEmail = async (e) => {
    e.preventDefault();
    // Add your logic to register a new user with email using Firebase
  };

  return (
    <div className="auth-container">
      <button className="sign-in google-btn" onClick={signInWithGoogle}>Sign in with Google</button>

      <div className="email-signin">
        <form onSubmit={signInWithEmail}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="auth-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="auth-input"
            required
          />

          <div className="auth-buttons">
            <button type="submit" className="sign-in email-btn">Sign in with Email</button>
            <button type="button" onClick={registerWithEmail} className="sign-in email-btn">Register with Email</button>
          </div>
        </form>
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
