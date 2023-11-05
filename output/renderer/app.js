"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const electron_1 = require("electron");
class App {
    constructor() {
        this._writeMessage = () => {
            console.log('#btn-send-message click');
            const message = this._messageDom.value;
            if (message === '') {
                return;
            }
            electron_1.ipcRenderer.send('send-message', message);
            this._messageDom.value = '';
        };
        this._btnLogin = document.querySelector('#btn-login');
        this._btnLogout = document.querySelector('#btn-logout');
        this._input_email = document.querySelector('#email');
        this._input_password = document.querySelector('#password');
        this._loginSection = document.querySelector('#login-section');
        this._chatSection = document.querySelector('#chat-section');
        this._writeSection = document.querySelector('#write-section');
        this._btnSendMessage = document.querySelector('#btn-send-message');
        this._btnToggle = document.querySelector('#btn-toggle');
        this._messageDom = document.querySelector('#message');
        this._messageContainer = document.querySelector('#message-container');
        this._navMenu = document.querySelector(`#${this._btnToggle.dataset.target}`);
        this._bindEvent();
        this._bindIpc();
    }
    _bindEvent() {
        // Login button action.
        this._btnLogin.addEventListener('click', () => {
            const email = this._input_email.value;
            const password = this._input_password.value;
            console.log('#btn-login click');
            const loginObj = {
                email,
                password,
            };
            console.log(`email : ${email}, password : ${password}`);
            electron_1.ipcRenderer.send('request-login', loginObj);
        });
        this._btnLogout.addEventListener('click', () => {
            electron_1.ipcRenderer.send('request-logout');
        });
        this._btnToggle.addEventListener('click', () => {
            this._btnToggle.classList.toggle('is-active');
            this._navMenu.classList.toggle('is-active');
        });
        electron_1.ipcRenderer.on('login-success', () => {
            console.log('login-succedeed');
            this._loginSection.style.display = 'none';
            this._chatSection.style.display = 'block';
            this._writeSection.style.display = 'block';
            this._btnToggle.style.display = 'block';
        });
        electron_1.ipcRenderer.on('login-error', (event, value) => {
            if (value === 'auth/wrong-password') {
                electron_1.ipcRenderer.invoke('focus-on-password');
            }
        });
        electron_1.ipcRenderer.on('logout-success', () => {
            console.log('logout-succedeed');
            this._loginSection.style.display = 'block';
            this._chatSection.style.display = 'none';
            this._writeSection.style.display = 'none';
            this._btnToggle.style.display = 'none';
            this._btnToggle.classList.toggle('is-active');
            this._navMenu.classList.toggle('is-active');
        });
        electron_1.ipcRenderer.on('general-message', (event, messageObjects) => {
            console.log('receive : general-message');
            const messageHTML = messageObjects
                .map((messageObject) => {
                return `
          <div class="box">
          <article class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>${messageObject.name}</strong> <small>${messageObject.email}</small>
                  <small>${messageObject.time}</small>
                  <br />
                  ${messageObject.message}
                </p>
              </div>
            </div>
          </article>
        </div>
        `;
            })
                .join('');
            this._messageContainer.innerHTML = messageHTML;
            this._messageContainer.scrollTop = this._messageContainer.scrollHeight;
        });
        this._btnSendMessage.addEventListener('click', this._writeMessage);
        document.addEventListener('keypress', (event) => {
            if (!event.shiftKey && event.key === 'Enter') {
                event.preventDefault(); //기본기능인 줄바꿈 해제
                this._writeMessage();
            }
        });
    }
    _bindIpc() {
        electron_1.ipcRenderer.on('focus-on-email', (event) => {
            this._input_email.focus();
        });
        electron_1.ipcRenderer.on('focus-on-password', (event) => {
            this._input_password.focus();
        });
    }
}
exports.App = App;
