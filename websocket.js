// websocket.js
const WebSocket = require('ws');
const redis = require('redis');

const wss = new WebSocket.Server({ noServer: true });
const redisClient = redis.createClient();
const pubClient = redis.createClient();
const subClient = redis.createClient();

const clients = new Map();

subClient.subscribe('cart-updates');
subClient.on('message', (channel, message) => {
  const { userId, cart } = JSON.parse(message);
  const client = clients.get(userId.toString());
  if (client) client.send(JSON.stringify(cart));
});

function emitCartUpdate(userId, cart) {
  pubClient.publish('cart-updates', JSON.stringify({ userId, cart }));
}

wss.on('connection', (ws, req) => {
  const userId = req.user._id.toString();
  clients.set(userId, ws);

  ws.on('close', () => {
    clients.delete(userId);
  });
});

module.exports = {
  wss,
  emitCartUpdate
};