import { ipcRenderer } from 'electron';
import { LoginObjectType, MessageObjectType } from '../common/type';

function main() {
  const btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
  const btnLogout = document.querySelector('#btn-logout') as HTMLButtonElement;
  const input_email = document.querySelector('#email') as HTMLInputElement;
  const input_password = document.querySelector(
    '#password'
  ) as HTMLInputElement;

  const email = input_email.value;
  const password = input_password.value;

  btnLogin.addEventListener('click', () => {
    console.log('#btn-login click');

    // //1. Email rule - Use RegEx
    if (input_email.value.length < 4 || !validateEmail(input_email.value)) {
      ipcRenderer.send('invalid-email-format');
    }

    // //2. Password length
    if (input_password.value.length < 4) {
      ipcRenderer.send('invalid-password-length');
    }

    const loginObj: LoginObjectType = {
      email,
      password,
    };
    ipcRenderer.send('request-login', loginObj);
  });

  ipcRenderer.on('focus-on-email', (event) => {
    input_email.focus();
  });

  ipcRenderer.on('focus-on-password', (event) => {
    input_password.focus();
  });

  btnLogout.addEventListener('click', () => {
    ipcRenderer.send('request-logout');
  });

  const loginSection = document.querySelector(
    '#login-section'
  ) as HTMLDivElement;
  const chatSection = document.querySelector('#chat-section') as HTMLDivElement;
  const writeSection = document.querySelector(
    '#write-section'
  ) as HTMLDivElement;

  const btnToggle = document.querySelector('#btn-toggle') as HTMLSpanElement;
  const navMenu = document.querySelector(
    `#${btnToggle.dataset.target}`
  ) as HTMLDivElement;

  btnToggle.addEventListener('click', () => {
    btnToggle.classList.toggle('is-active');
    navMenu.classList.toggle('is-active');
  });

  ipcRenderer.on('login-success', () => {
    console.log('login-succedeed');

    loginSection.style.display = 'none';
    chatSection.style.display = 'block';
    writeSection.style.display = 'block';
    btnToggle.style.display = 'block';
  });

  ipcRenderer.on('login-error', (event, value) => {
    if (value === 'auth/wrong-password') {
      ipcRenderer.invoke('focus-on-password');
    }
  });

  ipcRenderer.on('logout-success', () => {
    console.log('logout-succedeed');

    loginSection.style.display = 'block';
    chatSection.style.display = 'none';
    writeSection.style.display = 'none';

    btnToggle.style.display = 'none';
    btnToggle.classList.toggle('is-active');
    navMenu.classList.toggle('is-active');
  });

  ipcRenderer.on(
    'general-message',
    (event, messageObjects: MessageObjectType[]) => {
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
      const messageContainer = document.querySelector(
        '#message-container'
      ) as HTMLDivElement;
      messageContainer.innerHTML = messageHTML;
    }
  );

  const btnSendMessage = document.querySelector(
    '#btn-send-message'
  ) as HTMLButtonElement;

  btnSendMessage.addEventListener('click', () => {
    console.log('#btn-send-message click');

    const messageDom = document.querySelector(
      '#message'
    ) as HTMLTextAreaElement;

    const message = messageDom.value;

    if (message === '') {
      return;
    }

    ipcRenderer.send('send-message', message);
    messageDom.value = '';
  });
}

document.addEventListener('DOMContentLoaded', main);

function validateEmail(email) {
  const re = /\S+@\S+\.\S\S+/;
  return re.test(email);
}
