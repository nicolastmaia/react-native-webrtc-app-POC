const WebSocket = require('ws');

const clients = {};

function onError(ws, err) {
  console.error(`onError: ${err.message}`);
}

function onMessage(ws, data) {
  const parsedData = JSON.parse(data);

  switch (parsedData.type) {
    case 'register':
      clients[parsedData.callerId] = ws;
      console.log(`${parsedData.callerId} registered`);
      break;
    case 'newCall':
      clients[parsedData.calleeId].send(JSON.stringify(parsedData));
      break;
    case 'callAnswered':
      clients[parsedData.callerId].send(JSON.stringify(parsedData));
      break;
    case 'ICEcandidate':
      clients[parsedData.calleeId].send(JSON.stringify(parsedData));
      break;
    case 'cancelCall':
      clients[parsedData.otherUserId].send(JSON.stringify(parsedData));
    case 'endCall':
      clients[parsedData.otherUserId].send(JSON.stringify(parsedData));
      break;
  }
}

function onConnection(ws, req) {
  ws.on('message', (data) => onMessage(ws, data));
  ws.on('error', (error) => onError(ws, error));
  console.log(`onConnection`);
}

module.exports = (server) => {
  const wss = new WebSocket.Server({
    server,
  });

  console.log(`Websocket listening on port: ${server.address().port}`);

  wss.on('connection', onConnection);

  console.log(`App Web Socket Server is running!`);
  return wss;
};