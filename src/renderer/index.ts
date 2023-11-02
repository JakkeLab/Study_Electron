import { ipcRenderer } from 'electron';
import { LoginObjectType, MessageObjectType } from '../common/type';

function main() {
  const btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
  const btnLogout = document.querySelector('#btn-logout') as HTMLButtonElement;

  btnLogin.addEventListener('click', () => {
    console.log('#btn-login click');

    const input_email = document.querySelector('#email') as HTMLInputElement;
    const input_password = document.querySelector(
      '#password'
    ) as HTMLInputElement;

    const email = input_email.value;
    const password = input_password.value;

    // 숙제
    // 이메일이면 보내도록,
    // 이메일이 아니면, 경고

    const loginObj: LoginObjectType = {
      email,
      password,
    };
    ipcRenderer.send('request-login', loginObj);
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

  ipcRenderer.on('login-success', () => {
    console.log('login-succedeed');

    loginSection.style.display = 'none';
    chatSection.style.display = 'block';
    writeSection.style.display = 'block';
  });

  ipcRenderer.on('logout-success', () => {
    console.log('logout-succedeed');

    loginSection.style.display = 'block';
    chatSection.style.display = 'none';
    writeSection.style.display = 'none';
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
