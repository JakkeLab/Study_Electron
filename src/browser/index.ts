import 'dotenv/config';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
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

// Initialize Firebase
firebase.initializeApp({
  apiKey: process.env.apiKey,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
});

const auth = firebase.auth();
const database = firebase.database();

require('@electron/remote/main').initialize();

app.on('ready', () => {
  console.log('app ready');

  const win = new BrowserWindow({
    width: 500,
    minWidth: 500,
    maxWidth: 500,
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
      if (error.code === 'auth/wrong-password') {
        dialog.showMessageBox(win, {
          message: 'Invalid email address',
          detail: '잘못된 메일 주소',
        });

        const errorMessage: string = error.code;
        event.sender.send('login-error', errorMessage);
      }
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
      console.log(error.code);
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

  //Get invalid-email-format event and send 'focus-on-email', which is focusing input email form, to notify user about this.
  ipcMain.on('invalid-email-format', (event) => {
    const res = dialog
      .showMessageBox(win, {
        message: 'Login failed',
        detail: 'Invalid email address format.',
      })
      .then((result) => event.sender.send('focus-on-email'));
  });

  ipcMain.on('invalid-password-length', (event) => {
    const res = dialog
      .showMessageBox(win, {
        message: 'Login failed',
        detail: 'Too short password',
      })
      .then((result) => event.sender.send('focus-on-password'));
  });

  // //231104_OriginalCode
  // ipcMain.on('invalid-email-format', (event) => {
  //   dialog.showMessageBox(win, {
  //       message: 'Invalid email address',
  //       detail: '잘못된 메일 주소',
  //     })
  //    event.sender.send('focus-on-email')
  //
  //   In this case, because dialog.showMessageBox returns Promise<object> so that
  //   sending arg to 'focus-on-email' channel will be run directly after showing messagebox.
  //   Thus, user can see the input email form as blinking.
});
