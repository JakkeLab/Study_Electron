"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function main() {
    const btnLogin = document.querySelector('#btn-login');
    btnLogin.addEventListener('click', () => {
        console.log('#btn-login click');
        const input_email = document.querySelector('#email');
        const input_password = document.querySelector('#password');
        const email = input_email.value;
        const password = input_password.value;
        const loginObj = {
            email,
            password,
        };
        electron_1.ipcRenderer.send('request-login', loginObj);
    });
}
document.addEventListener('DOMContentLoaded', main);
//# sourceMappingURL=index.js.map