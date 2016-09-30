'use strict'
var express = require('express');
var cors = require('cors');
var app = express(); //init app
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;
var path = require("path");
var bodyParser = require("body-parser")
var ZwaveHandler = require('./zwave-handler.js');
var SocketCollection = require('./SocketCollection.js');
var ConnectedClients = new SocketCollection();
var zwave = new ZwaveHandler();
var path = require('path');
var args = require('yargs').argv;
var zwaveDisabled = args.disableZwave ? true : false;   



app.use(bodyParser.json()); //parse api payloads to json

// Routing
app.use('/dist', express.static(path.join(__dirname,'../dist')));
app.use('/app', express.static(path.join(__dirname,'../app')));
app.use('/images', express.static(path.join(__dirname,'../images')));
app.use('/fonts', express.static(path.join(__dirname,'../fonts')));


app.use(cors()); //enable cores
app.get('/api/zwave/allnodes', function (req, res) {
    res.send(zwave.nodes);
});
app.post('/api/zwave/sendcmd',function(req,res){
     var args = req.body;
     console.log(args);
    
     try {
            zwave.setValue(args.nodeid, args.cmdclass, 1, args.index, args.value);
        } catch (error) { 
            console.log(error) 
        }
})
app.get('/*', function (req, res) {
    //all other routes go directly to the app
    res.sendFile(path.join(__dirname, '../app/index.html'));
});

server.listen(port, function () {
    console.log('Server listening at port %d', port);
      if(!zwaveDisabled){
        zwave.start();
      }
});


io.on('connection', function (socketIn) {
   console.log('client '+socketIn.id +' has connected');
   ConnectedClients.add(socketIn)
   io.emit('client connected',socketIn.id);
});


zwave.on('ready', function (message) {
    io.emit('ready', message);
});
zwave.on('node ready', function (data) {
    io.emit('node ready', data);
});
zwave.on('node changed',function(data){
    ConnectedClients.emit('node changed',data.clientId)
    io.emit('node changed',data)
});
zwave.on('notification', function (message) {
    io.emit('notification', message);
});