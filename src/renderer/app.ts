import { ipcRenderer } from 'electron';
import { LoginObjectType, MessageObjectType } from '../common/type';

export class App {
  private _btnLogin;
  private _btnLogout;
  private _input_email;
  private _input_password;
  private _loginSection;
  private _chatSection;
  private _writeSection;
  private _btnSendMessage;
  private _btnToggle;
  private _messageDom;
  private _navMenu;
  private _messageContainer;
  constructor() {
    this._btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
    this._btnLogout = document.querySelector('#btn-logout') as HTMLButtonElement;
    this._input_email = document.querySelector('#email') as HTMLInputElement;
    this._input_password = document.querySelector('#password') as HTMLInputElement;
    this._loginSection = document.querySelector('#login-section') as HTMLDivElement;
    this._chatSection = document.querySelector('#chat-section') as HTMLDivElement;
    this._writeSection = document.querySelector('#write-section') as HTMLDivElement;
    this._btnSendMessage = document.querySelector('#btn-send-message') as HTMLButtonElement;
    this._btnToggle = document.querySelector('#btn-toggle') as HTMLSpanElement;
    this._messageDom = document.querySelector('#message') as HTMLTextAreaElement;
    this._messageContainer = document.querySelector('#message-container') as HTMLDivElement;
    this._navMenu = document.querySelector(`#${this._btnToggle.dataset.target}`) as HTMLDivElement;
    this._bindEvent();
    this._bindIpc();
  }

  private _bindEvent() {
    // Login button action.
    this._btnLogin.addEventListener('click', () => {
      const email = this._input_email.value;
      const password = this._input_password.value;
      console.log('#btn-login click');
      const loginObj: LoginObjectType = {
        email,
        password,
      };
      console.log(`email : ${email}, password : ${password}`);
      ipcRenderer.send('request-login', loginObj);
    });

    this._btnLogout.addEventListener('click', () => {
      ipcRenderer.send('request-logout');
    });

    this._btnToggle.addEventListener('click', () => {
      this._btnToggle.classList.toggle('is-active');
      this._navMenu.classList.toggle('is-active');
    });

    ipcRenderer.on('login-success', () => {
      console.log('login-succedeed');

      this._loginSection.style.display = 'none';
      this._chatSection.style.display = 'block';
      this._writeSection.style.display = 'block';
      this._btnToggle.style.display = 'block';
    });

    ipcRenderer.on('login-error', (event, value) => {
      if (value === 'auth/wrong-password') {
        ipcRenderer.invoke('focus-on-password');
      }
    });

    ipcRenderer.on('logout-success', () => {
      console.log('logout-succedeed');

      this._loginSection.style.display = 'block';
      this._chatSection.style.display = 'none';
      this._writeSection.style.display = 'none';

      this._btnToggle.style.display = 'none';
      this._btnToggle.classList.toggle('is-active');
      this._navMenu.classList.toggle('is-active');
    });

    ipcRenderer.on('general-message', (event, messageObjects: MessageObjectType[]) => {
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

  private _bindIpc() {
    ipcRenderer.on('focus-on-email', (event) => {
      this._input_email.focus();
    });

    ipcRenderer.on('focus-on-password', (event) => {
      this._input_password.focus();
    });
  }

  private _writeMessage = () => {
    console.log('#btn-send-message click');

    const message = this._messageDom.value;

    if (message === '') {
      return;
    }

    ipcRenderer.send('send-message', message);
    this._messageDom.value = '';
  };
}
