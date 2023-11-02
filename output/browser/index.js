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
require("dotenv/config"); //TS(ES6) 에선 app 정의 전에 실행해야 한다.
const electron_1 = require("electron");
const app_1 = __importDefault(require("firebase/compat/app"));
require("firebase/compat/auth"); //es6 특성상 해당 auth함수를 불러올 수 있도록 히부분을 추가해야 함
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
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadURL(html);
    // 로그인
    electron_1.ipcMain.on('request-login', (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(arg);
        let user = null;
        try {
            user = yield auth.signInWithEmailAndPassword(arg.email, arg.password);
        }
        catch (error) {
            console.log(error);
        }
        if (user) {
            event.sender.send('login-success');
        }
    }));
    // 로그아웃
    electron_1.ipcMain.on('request-logout', (event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield auth.signOut();
        }
        catch (error) {
            console.log(error);
        }
        event.sender.send('logout-success');
    }));
});
