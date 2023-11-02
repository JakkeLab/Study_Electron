import 'dotenv/config'; //TS(ES6) 에선 app 정의 전에 실행해야 한다.
import { app, BrowserWindow, ipcMain } from 'electron';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; //es6 특성상 해당 auth함수를 불러올 수 있도록 히부분을 추가해야 함
import * as url from 'url';
import * as path from 'path';
import { LoginObj } from '../common/type';

// 둘 중 하나가 참이면 => protocol 뒤에 // 가 붙는다.
// protocol begins with http, https, ftp, gopher, or file
// slashes is true
const html = url.format({
  protocol: 'file',
  pathname: path.join(__dirname, '../../static/index.html'),
});

// Initialize Firebase
firebase.initializeApp({
  apiKey: process.env.apiKey,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
});

const auth = firebase.auth();
auth.onAuthStateChanged((user: { email: string }) => {
  console.log(user);
});

app.on('ready', () => {
  console.log('app ready');

  const win = new BrowserWindow({
    width: 500,
    minWidth: 500,
    maxWidth: 900,
    height: 750,
    minHeight: 750,
    maxHeight: 750,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadURL(html);

  // 로그인
  ipcMain.on('request-login', async (event, arg: LoginObj) => {
    console.log(arg);

    let user = null;
    try {
      user = await auth.signInWithEmailAndPassword(arg.email, arg.password);
    } catch (error) {
        console.log(error);
    }
    if (user) {
        event.sender.send('login-success');
    }
  });

  // 로그아웃
  ipcMain.on('request-logout', async event => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log(error);
    }
    event.sender.send('logout-success');
  });
});
