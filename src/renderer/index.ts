import { ipcRenderer } from 'electron';
import { LoginObj } from '../common/type';

function main() {
  const btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
  btnLogin.addEventListener('click', () => {
    console.log('#btn-login click');

    const input_email = document.querySelector('#email') as HTMLInputElement;
    const input_password = document.querySelector(
      '#password'
    ) as HTMLInputElement;

    const email = input_email.value;
    const password = input_password.value;
    const loginObj: LoginObj = {
      email,
      password,
    };
    ipcRenderer.send('request-login', loginObj);
  });
}

document.addEventListener('DOMContentLoaded', main);
