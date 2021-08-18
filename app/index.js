var serveIndex = require('serve-index');
const { app, BrowserWindow, ipcMain, dialog } = require( 'electron' );
const path = require( 'path' );
const fs = require('fs');
const DHT = require("@hyperswarm/dht");

// local dependencies
const io = require( './main/io' );

// open a window
const openWindow = () => {
    const win = new BrowserWindow( {
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    } );

    // load `index.html` file
    win.loadFile( path.resolve( __dirname, 'render/html/index.html' ) );

    /*-----*/
    
    return win; // return window
};

// when app is ready, open a window
app.on( 'ready', () => {
    const win = openWindow();

    // watch files
    io.watchFiles( win );
} );

// when all windows are closed, quit the app
app.on( 'window-all-closed', () => {
    node.destroy();
    if( process.platform !== 'darwin' ) {
        app.quit();
    }
} );

// when app activates, open a window
app.on( 'activate', () => {
    if( BrowserWindow.getAllWindows().length === 0 ) {
        openWindow();
    }
} );

var express = require('express');
var ap = express();
ap.listen(8081);
const crypto = require("hypercore-crypto");
var net = require("net");
const node = new DHT({});
var b32 = require("hi-base32");
const salt = null//process.argv.length>1?process.argv[process.argv.length-1]:null;
const key = (salt&&salt.length)?crypto.data(Buffer.from(salt)):null;
console.log(salt);
const keyPair = crypto.keyPair(key);
const server = node.createServer();
server.on("connection", function(socket) {
  console.log('con');
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
ap.use('/', express.static('render'));
ap.use('/', serveIndex('files'));
 
console.log();
//mainWindow.loadURL('http://localhost:8081/url')
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
})




/************************/

ipcMain.handle( 'app:get-hash', () => {
    return b32.encode(keyPair.publicKey).replace('====','').toLowerCase();
} );
// return list of files
ipcMain.handle( 'app:get-files', () => {
    return io.getFiles();
} );

// listen to file(s) add event
ipcMain.handle( 'app:on-file-add', ( event, files = [] ) => {
    io.addFiles( files );
} );

// open filesystem dialog to choose files
ipcMain.handle( 'app:on-fs-dialog-open', ( event ) => {
    const files = dialog.showOpenDialogSync( {
        properties: [ 'openFile', 'multiSelections' ],
    } );

    io.addFiles( files.map( filepath => {
        return {
            name: path.parse( filepath ).base,
            path: filepath,
        };
    } ) );
} );

/*-----*/

// listen to file delete event
ipcMain.on( 'app:on-file-delete', ( event, file ) => {
    io.deleteFile( file.filepath );
} );

// listen to file open event
ipcMain.on( 'app:on-file-open', ( event, file ) => {
    io.openFile( file.filepath );
} );

// listen to file copy event
ipcMain.on( 'app:on-file-copy', ( event, file ) => {
    event.sender.startDrag( {
        file: file.filepath,
        icon: path.resolve( __dirname, './resources/paper.png' ),
    } );
} );