const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/AFEB82B0D367FE8AB813E96702347C0E');
ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: { url: 'https://itviec.com/it-jobs/ho-chi-minh' }
  }));
});
ws.on('message', (msg) => {
  const resp = JSON.parse(msg);
  if (resp.id === 1) {
    console.log('Navigated to ITviec HCM');
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const userBtn = document.querySelector('.user-menu, [data-controller*="user"], a[href*="/profile"], a[href*="/sign_in"]');
              const title = document.title;
              return { title, url: window.location.href, userText: userBtn ? userBtn.innerText : 'None' };
            })()
          `,
          returnByValue: true
        }
      }));
    }, 3000);
  } else if (resp.id === 2) {
    console.log(JSON.stringify(resp.result.result.value, null, 2));
    ws.close();
  }
});
