const sendHeartbeat = ws => {
  if (ws) {
    console.log('SENDING WS HEARTBEAT');
    const heartbeat = {type: 'heartbeat'};
    ws.send(JSON.stringify(heartbeat));
  }
};

module.exports = sendHeartbeat;
