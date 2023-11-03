"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function main() {
    const btnLogin = document.querySelector('#btn-login');
    const btnLogout = document.querySelector('#btn-logout');
    btnLogin.addEventListener('click', () => {
        console.log('#btn-login click');
        const input_email = document.querySelector('#email');
        const input_password = document.querySelector('#password');
        const email = input_email.value;
        const password = input_password.value;
        // 숙제
        // 이메일이면 보내도록,
        // 이메일이 아니면, 경고
        const loginObj = {
            email,
            password,
        };
        electron_1.ipcRenderer.send('request-login', loginObj);
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
