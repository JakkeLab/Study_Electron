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
      console.log('---------------\n');
      console.log(`Error Code : ${error.code}`); //에러정보 수신
      switch (error.code) {
        //01. Invalid mail address
        case 'auth/invalid-email':
          dialog
            .showMessageBox(win, {
              message: 'Invalid email address',
              detail: '잘못된 메일 주소를 입력했습니다.',
            })
            .then((result) => event.sender.send('focus-on-email'));
          break;
        //02. Disabled user
        case 'auth/user-disabled':
          dialog
            .showMessageBox(win, {
              message: 'Disabled user',
              detail: '비활성화된 유저입니다.',
            })
            .then((result) => event.sender.send('focus-on-email'));
          break;
        //03. No input password
        case 'auth/missing-password':
          dialog
            .showMessageBox(win, {
              message: 'Empty Password',
              detail: '패스워드를 입력해 주세요.',
            })
            .then((result) => event.sender.send('focus-on-password'));
          break;
        //04. No matching user with credentials
        case 'auth/invalid-login-credentials': {
          dialog.showMessageBox(win, {
            message: 'Invalid User',
            detail: '일치하는 유저가 없습니다.',
          });
          break;
        }
      }
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
      const id = email.slice(0, email.indexOf('@') - 1);
      const name = `${id}`;
      const timeData = new Date();
      const time = `${
        timeData.getMonth() + 1
      }월 ${timeData.getDate()}일 ${timeData
        .getHours()
        .toString()}:${timeData.getMinutes()}`;

      const ref = database.ref();
      ref.child('general').push().set({
        email,
        name,
        message,
        time,
      });
    }
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
