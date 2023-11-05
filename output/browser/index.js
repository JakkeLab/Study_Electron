"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const electron_1 = require("electron");
const app_1 = __importDefault(require("firebase/compat/app"));
require("firebase/compat/auth");
require("firebase/compat/database");
const url = __importStar(require("url"));
const path = __importStar(require("path"));
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
const database = app_1.default.database();
electron_1.app.on('ready', () => {
    console.log('app ready');
    const win = new electron_1.BrowserWindow({
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
    electron_1.ipcMain.on('request-login', (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(arg);
        let user = null;
        try {
            user = yield auth.signInWithEmailAndPassword(arg.email, arg.password);
        }
        catch (error) {
            console.log('---------------\n');
            console.log(`Error Code : ${error.code}`); //에러정보 수신
            switch (error.code) {
                //01. Invalid mail address
                case 'auth/invalid-email':
                    electron_1.dialog
                        .showMessageBox(win, {
                        message: 'Invalid email address',
                        detail: '잘못된 메일 주소를 입력했습니다.',
                    })
                        .then((result) => event.sender.send('focus-on-email'));
                    break;
                //02. Disabled user
                case 'auth/user-disabled':
                    electron_1.dialog
                        .showMessageBox(win, {
                        message: 'Disabled user',
                        detail: '비활성화된 유저입니다.',
                    })
                        .then((result) => event.sender.send('focus-on-email'));
                    break;
                //03. No input password
                case 'auth/missing-password':
                    electron_1.dialog
                        .showMessageBox(win, {
                        message: 'Empty Password',
                        detail: '패스워드를 입력해 주세요.',
                    })
                        .then((result) => event.sender.send('focus-on-password'));
                    break;
                //04. No matching user with credentials
                case 'auth/invalid-login-credentials': {
                    electron_1.dialog.showMessageBox(win, {
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
                const messageObjects = Object.keys(data).map((id) => {
                    const messageObject = {
                        id,
                        email: data[id].email,
                        name: data[id].name,
                        message: data[id].message,
                        time: data[id].time,
                    };
                    return messageObject;
                });
                event.sender.send('general-message', messageObjects);
            });
        }
    }));
    //로그아웃
    electron_1.ipcMain.on('request-logout', (event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield auth.signOut();
        }
        catch (error) {
            console.log(error.code);
        }
        event.sender.send('logout-success');
    }));
    // Send message to Firebase
    electron_1.ipcMain.on('send-message', (event, message) => {
        if (auth.currentUser) {
            const email = auth.currentUser.email;
            const id = email.slice(0, email.indexOf('@') - 1);
            const name = `${id}`;
            const timeData = new Date();
            const time = `${timeData.getMonth() + 1}월 ${timeData.getDate()}일 ${timeData
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
