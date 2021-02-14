import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Import firebase-react hooks
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { useState, useRef } from 'react';

firebase.initializeApp({
  // Initialize firebase app
  apiKey: "AIzaSyBNSFH0ij8jiiFjPrP_oZMwNAkdYKdSMlM",
  authDomain: "focuschat-ff641.firebaseapp.com",
  projectId: "focuschat-ff641",
  storageBucket: "focuschat-ff641.appspot.com",
  messagingSenderId: "253759282896",
  appId: "1:253759282896:web:989ca9a53a1cbd3b8008d5",
  measurementId: "G-FF3EKKPZEX"
})

// Create references for Auth and Firestore SDKs
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  // Determine if user is signed in - null if logged out
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    <p>You will be banned for swearing!</p>
    </>
  )
}


function SignOut() {
  return auth.currentUser && (

    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const fakeRef = useRef();

  // Create the reference for our firestore collection to get user messages
  const messagesRef = firestore.collection('messages');

  // Query for documents in collection for messages, sort by creation time, only show newest 25 messages
  const query = messagesRef.orderBy('createdAt').limit(25);

  // Listen for changes to the collection in real time, returns array of message objects
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    fakeRef.current.scrollIntoView({behavior: 'smooth'})

  }

  return (
    <>
    <main>
      
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
      

      <span ref={fakeRef}></span>

      </main>

      <form onSubmit={sendMessage}>
       
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message..." />

        <button type="submit" disabled={!formValue}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg></button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, avatarURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={`message ${messageClass}`}>

      <img src={avatarURL} alt="User Avatar"/>
      <p>{text}</p>
      </div>
  )
}

export default App;
