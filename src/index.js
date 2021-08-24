if (!requireAsync) requireAsync = (name) => { return require(name) }; //for compatibility with other platforms e.g. glitch.com
const http = require('http');
(async () => {
  const express = await requireAsync('express'); //runtime lib downloading/async
  const socketio = await requireAsync('socket.io');
  const verify = require('./utils/verify');
  const action = require('./utils/action');
  const app = express();
  app.use(express.static('files'));

  const server = http.createServer(app);
  const io = socketio(server);

  var events = require('events');
  var userEvents = new events.EventEmitter();

  const profiles = [];

  userEvents.on('profile', (args, id) => { 
    profiles[id] = args;
  });

  const moment = require('moment');
  function formatMessage(username ,text) {
      return {
          username,
          text,
          time: moment().format('h:mm a')
      }
  }
  
  userEvents.on('chatMessage', (args, id) => { 
    io.to(args.room).emit('message', formatMessage(profiles[id].name, args.msg)); 
  });

  io.on('connection', socket => {
    var id = null;
    socket.join('General');
    socket.on('tx', async (data) => {
      const out = verify.verify(data);
      id = data.k;
      console.log(await action(out));
      userEvents.emit(out['t'].a, out['t'].i, id.toString('hex'));
    })
  });
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  loaded();
})()
