// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
let mainWindow;
const fs = require('fs');
if (!fs.existsSync('files')) {
  fs.mkdirSync('files')
}
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 120,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
var serveIndex = require('serve-index');
var express = require('express');
var app = express();
app.listen(8081);
const DHT = require("@hyperswarm/dht");
const crypto = require("hypercore-crypto");
var net = require("net");
const node = new DHT({});
var b32 = require("hi-base32");
const salt = process.argv.length>1?process.argv[process.argv.length-1]:null;
const key = (salt&&salt.length)?crypto.data(Buffer.from(salt)):null;
const keyPair = crypto.keyPair(key);
const server = node.createServer();
server.on("connection", function(socket) {
  let open = { local:true, remote:true };
  var local = net.connect(8081, "localhost");

  local.on('data', (d)=>{socket.write(d)});
  socket.on('data', (d)=>{local.write(d)});

  const remoteend = () => {
    if(open.remote) socket.end();
    open.remote = false;
  }
  const localend = () => {
    if(open.local) local.end();
    open.local = false;
  }
  local.on('error', remoteend)
  local.on('finish', remoteend)
  local.on('end', remoteend)
  socket.on('finish', localend)
  socket.on('error', localend)
  socket.on('end', localend)
});
server.listen(keyPair);
app.use('/url', (req,res)=>{
	res.send(`<a target="_blank" href="https://${b32.encode(keyPair.publicKey).replace('====','').toLowerCase()+'.southcoast.ga'}">${b32.encode(keyPair.publicKey).replace('====','').toLowerCase()+'.southcoast.ga'}</a><br/>Copy flies to /files to share to this domain.`)
});
app.use('/', express.static('files'));
app.use('/', serveIndex('files'));
 
console.log();
mainWindow.loadURL('http://localhost:8081/url')
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
})

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  DHT.destroy();
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
