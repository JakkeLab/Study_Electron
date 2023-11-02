import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import * as url from 'url';
import * as path from 'path';
import { LoginObjectType, MessageObjectType } from '../common/type';

// 둘 중 하나가 참이면 => protocol 뒤에 // 가 붙는다.
// protocol begins with http, https, ftp, gopher, or file
// slashes is true

const html = url.format({
  protocol: 'file',
  pathname: path.join(__dirname, '../../static/index.html'),
});

console.log('breakpoint1');

// Initialize Firebase
firebase.initializeApp({
  apiKey: process.env.apiKey,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
});

const auth = firebase.auth();
const database = firebase.database();

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
      contextIsolation: false,
    },
  });
  win.loadURL(html);

  //
  ipcMain.on('request-login', async (event, arg: LoginObjectType) => {
    console.log(arg);

    let user = null;
    try {
      user = await auth.signInWithEmailAndPassword(arg.email, arg.password);
    } catch (error) {
      console.log(error);
    }
    if (user) {
      event.sender.send('login-success');
      const ref = database.ref();
      ref.child('general').on('value', (snapshopt) => {
        console.log(snapshopt.val());
      });
      ref.child('general').on('value', (snapshopt) => {
        const data = snapshopt.val();

        const messageObjects: MessageObjectType[] = Object.keys(data).map(
          (id) => {
            const messageObject: MessageObjectType = {
              id,
              email: data[id].email,
              name: data[id].name,
              message: data[id].message,
              time: data[id].time,
            };

            return messageObject;
          }
        );
        event.sender.send('general-message', messageObjects);
      });
    }
  });

  //로그아웃
  ipcMain.on('request-logout', async (event) => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log(error);
    }
    event.sender.send('logout-success');
  });

  // Send message to Firebase
  ipcMain.on('send-message', (event, message) => {
    if (auth.currentUser) {
      const email = auth.currentUser.email;
      const name = 'Jakkelab';
      const time = new Date().toISOString();

      const ref = database.ref();
      ref.child('general').push().set({
        email,
        name,
        message,
        time,
      });
    }
  });
});
