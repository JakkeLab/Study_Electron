"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function main() {
    const btnLogin = document.querySelector('#btn-login');
    const btnLogout = document.querySelector('#btn-logout');
    const input_email = document.querySelector('#email');
    const input_password = document.querySelector('#password');
    const email = input_email.value;
    const password = input_password.value;
    btnLogin.addEventListener('click', () => {
        console.log('#btn-login click');
        // //1. Email rule - Use RegEx
        if (input_email.value.length < 4 || !validateEmail(input_email.value)) {
            electron_1.ipcRenderer.send('invalid-email-format');
        }
        // //2. Password length
        if (input_password.value.length < 4) {
            electron_1.ipcRenderer.send('invalid-password-length');
        }
        const loginObj = {
            email,
            password,
        };
        electron_1.ipcRenderer.send('request-login', loginObj);
    });
    electron_1.ipcRenderer.on('focus-on-email', (event) => {
        input_email.focus();
    });
    electron_1.ipcRenderer.on('focus-on-password', (event) => {
        input_password.focus();
    });
    btnLogout.addEventListener('click', () => {
        electron_1.ipcRenderer.send('request-logout');
    });
    const loginSection = document.querySelector('#login-section');
    const chatSection = document.querySelector('#chat-section');
    const writeSection = document.querySelector('#write-section');
    const btnToggle = document.querySelector('#btn-toggle');
    const navMenu = document.querySelector(`#${btnToggle.dataset.target}`);
    btnToggle.addEventListener('click', () => {
        btnToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
    });
    electron_1.ipcRenderer.on('login-success', () => {
        console.log('login-succedeed');
        loginSection.style.display = 'none';
        chatSection.style.display = 'block';
        writeSection.style.display = 'block';
        btnToggle.style.display = 'block';
    });
    electron_1.ipcRenderer.on('login-error', (event, value) => {
        if (value === 'auth/wrong-password') {
            electron_1.ipcRenderer.invoke('focus-on-password');
        }
    });
    electron_1.ipcRenderer.on('logout-success', () => {
        console.log('logout-succedeed');
        loginSection.style.display = 'block';
        chatSection.style.display = 'none';
        writeSection.style.display = 'none';
        btnToggle.style.display = 'none';
        btnToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
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
        const messageContainer = document.querySelector('#message-container');
        messageContainer.innerHTML = messageHTML;
    });
    const btnSendMessage = document.querySelector('#btn-send-message');
    btnSendMessage.addEventListener('click', () => {
        console.log('#btn-send-message click');
        const messageDom = document.querySelector('#message');
        const message = messageDom.value;
        if (message === '') {
            return;
        }
        electron_1.ipcRenderer.send('send-message', message);
        messageDom.value = '';
    });
}
document.addEventListener('DOMContentLoaded', main);
function validateEmail(email) {
    const re = /\S+@\S+\.\S\S+/;
    return re.test(email);
}
