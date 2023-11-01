"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); //TS(ES6) 에선 app 정의 전에 실행해야 한다.
const electron_1 = require("electron");
const app_1 = require("firebase/compat/app");
require("firebase/compat/auth"); //es6 특성상 해당 auth함수를 불러올 수 있도록 히부분을 추가해야 함
const url = require("url");
const path = require("path");
// 둘 중 하나가 참이면 => protocol 뒤에 // 가 붙는다.
// protocol begins with http, https, ftp, gopher, or file
// slashes is true
const html = url.format({
    protocol: 'file',
    pathname: path.join(__dirname, '../../static/index.html'),
});
// Initialize Firebase
app_1.default.initializeApp({
    apiKey: process.env.apiKey,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
});
const auth = app_1.default.auth();
auth.onAuthStateChanged((user) => {
    console.log(user);
});
electron_1.app.on('ready', () => {
    console.log('app ready');
    const win = new electron_1.BrowserWindow({
        width: 500,
        minWidth: 500,
        maxWidth: 900,
        height: 750,
        minHeight: 750,
        maxHeight: 750,
        maximizable: false,
    });
    win.loadURL(html);
    auth.signInWithEmailAndPassword('itsjakk3@gmail.com', 'jakkeelectron');
});
//# sourceMappingURL=index.js.map