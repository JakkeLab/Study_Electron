import 'dotenv/config';                         //TS(ES6) 에선 app 정의 전에 실행해야 한다.
import {app, BrowserWindow} from 'electron';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';                  //es6 특성상 해당 auth함수를 불러올 수 있도록 히부분을 추가해야 함


// Your web app's Firebase configuration
console.log(process.env.apiKey);
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId
};

// Initialize Firebase
const defaultApp: firebase.app.App = firebase.initializeApp(firebaseConfig);

console.log(defaultApp.name);
console.log(firebase.app().name);

const auth = firebase.auth();
auth.onAuthStateChanged((user: {email: string;}) => {
    console.log(user);
});


app.on('ready', () => {
    console.log('ready');
    auth.signInWithEmailAndPassword('itsjakk3@gmail.com', 'jakkeelectron');
}); 