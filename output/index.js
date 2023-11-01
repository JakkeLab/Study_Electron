"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); //TS(ES6) 에선 app 정의 전에 실행해야 한다.
const electron_1 = require("electron");
const app_1 = require("firebase/compat/app");
require("firebase/compat/auth"); //es6 특성상 해당 auth함수를 불러올 수 있도록 히부분을 추가해야 함
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
const defaultApp = app_1.default.initializeApp(firebaseConfig);
console.log(defaultApp.name);
console.log(app_1.default.app().name);
const auth = app_1.default.auth();
auth.onAuthStateChanged((user) => {
    console.log(user);
});
electron_1.app.on('ready', () => {
    console.log('ready');
    auth.signInWithEmailAndPassword('itsjakk3@gmail.com', 'jakkeelectron');
});
//# sourceMappingURL=index.js.map