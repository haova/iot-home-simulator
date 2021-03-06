const WebSocket = require('ws');

const PORT = 5000
const wss = new WebSocket.Server({ port: PORT })

const data = [
  { id: 'living_room_door', name: 'Door', group: 'Living room', type: 'enabled', value: false },
  { id: 'living_room_light', name: 'Light', group: 'Living room', type: 'enabled', value: false },
  { id: 'bed_room_door', name: 'Door', group: 'Bed room', type: 'enabled', value: false },
  { id: 'bed_room_light', name: 'Light', group: 'Bed room', type: 'enabled', value: false },
  { id: 'toilet_door', name: 'Door', group: 'Toilet', type: 'enabled', value: false },
  { id: 'toilet_light', name: 'Light', group: 'Toilet', type: 'enabled', value: false },
  { id: 'dinning_room_light', name: 'Light', group: 'Dinning room', type: 'enabled', value: false },
  { id: 'kitchen_room_light', name: 'Light', group: 'Kitchen', type: 'enabled', value: false },
]

wss.on('connection', function connection(ws) {
  var socketAddr = ws._socket.remoteAddress.replace("::ffff:", "");
  console.log('Connection from ' + socketAddr + " - " + new Date())

  console.log('Send init data');
  ws.send(JSON.stringify(data));
  console.table(data);
  
  ws.on('message', function incoming(message) {
    console.log('Received data');
    message = message.toString();
    let pos = message.indexOf('[');
    message = message.substr(pos);

    let newData = [];
    try {
      newData = JSON.parse(message);
      console.log(`Accept`, message);
    } catch(err){
      console.log(err.message);
      console.log(`Skip`, message);
      return;
    }

    let isChanged = false;

    for (let item of newData){
      for (let origin of data){
        if (origin.id != item.id)
          continue

        if (origin.value !== item.value){
          origin.value = item.value;
          isChanged = true;
        }

        break;
      }
    }

    if (isChanged){
      console.log('Send changed data');
      console.table(data);

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  })
})

console.log("server running on port", PORT)
