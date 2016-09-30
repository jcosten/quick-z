/*
 * OpenZWave Wrapper
 * Log the critical events but only return the relevant zwave node events
 */
'use strict'
const OpenZWave = require('openzwave-shared');
const os = require('os');
const util = require('util');

var EventEmitter = require('events').EventEmitter;

module.exports = ZwaveWrapper;

function ZwaveWrapper() {
    EventEmitter.call(this);
}
util.inherits(ZwaveWrapper, EventEmitter);

var queue = [];
var ready = false;

var zwave = new OpenZWave({
    ConsoleOutput: true,
    Logging: false,//save the sd card! don't log anything
    SaveConfiguration: false,
    DriverMaxAttempts: 3,
    PollInterval: 5000,//5seconds
    SuppressValueRefresh: true,
});
process.on('SIGINT', function () {
    console.log('disconnecting...');
    zwave.disconnect();
    process.exit();
});
var zwavedriverpaths = {
    "darwin": '/dev/cu.SLAB_USBtoUART',
    "linux": '/dev/ttyUSB0',//'/dev/ttyACM0', /* Newer Aoen Labs usb stick is ttyACM0 */
    "windows": '\\\\.\\COM3'
}


//wrapper to cleanly pass only node events
ZwaveWrapper.prototype.start = function () {
    
    var self = this;
    self.emit('event', 'Starting Zwave');
    self.nodes = [];
console.log("connecting to " + zwavedriverpaths[os.platform()]);
    zwave.on('connected', function (homeid) {
        console.log('=================== CONNECTED! ====================');
    });
    zwave.on('driver ready', function (homeid) {
        console.log('=================== DRIVER READY! ====================');
    });

    zwave.on('driver failed', function () {
        console.log('failed to start driver');
        //TODO retry with a different port
        zwave.disconnect();
        process.exit();
    });

    zwave.on('node added', function (nodeid) {
        self.nodes[nodeid] = {
            manufacturer: '',
            manufacturerid: '',
            product: '',
            producttype: '',
            productid: '',
            type: '',
            name: '',
            classes: {},
            lastupdate:'',
            ready: false,
        };
         console.log('NODE %d ADDED!',nodeid);
    });

    zwave.on('value added', function (nodeid, comclass, value) {
        if (!self.nodes[nodeid]['classes'][comclass])
            self.nodes[nodeid]['classes'][comclass] = {};
        self.nodes[nodeid]['classes'][comclass][value.index] = value;
        self.nodes[nodeid]['classes'][comclass][value.index].lastupdate = new Date();
    });

    zwave.on('value changed', function (nodeid, comclass, value) {
        if (self.nodes[nodeid]['ready'] && self.nodes[nodeid]['classes'][comclass][value.index]['value'] !== value['value']) {
            console.log('%s node%d: changed: %d:%s:%s->%s',new Date(), nodeid, comclass,
                value['label'],
                self.nodes[nodeid]['classes'][comclass][value.index]['value'],
                value['value']);
        self.nodes[nodeid]['classes'][comclass][value.index] = value;
        self.nodes[nodeid]['classes'][comclass][value.index].lastupdate = new Date();
        self.emit('node changed',self.nodes[nodeid]);
        }


    });

    zwave.on('value removed', function (nodeid, comclass, index) {
        if (self.nodes[nodeid]['classes'][comclass] &&
            self.nodes[nodeid]['classes'][comclass][index])
            delete self.nodes[nodeid]['classes'][comclass][index];
    });

    zwave.on('node ready', function (nodeid, nodeinfo) {
        self.nodes[nodeid]['node_id'] = nodeid;
        self.nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
        self.nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
        self.nodes[nodeid]['product'] = nodeinfo.product;
        self.nodes[nodeid]['producttype'] = nodeinfo.producttype;
        self.nodes[nodeid]['productid'] = nodeinfo.productid;
        self.nodes[nodeid]['type'] = nodeinfo.type;
        self.nodes[nodeid]['ready'] = true;
     
      
        
        try { //Buttons are going to be polled manually. they won't tell us their state otherwise
            for (var comclass in self.nodes[nodeid]['classes']) {
                if(comclass === '37' || comclass ==='38') {
                     // COMMAND_CLASS_SWITCH_BINARY
                     // COMMAND_CLASS_SWITCH_MULTILEVEL
                        zwave.enablePoll(nodeid, comclass,5000); //5seconds
                        console.log('polling enabled on node: '+nodeid +', class:'+comclass);
                     
                }
            }
        } catch (error) { console.log('erroring getting comclass') };
        
        //send to client nodeinfo incase they already loaded.
         self.emit('node ready', nodeinfo);
        
        //Log to server window
        console.log('node%d: %s, %s', 
        nodeid,nodeinfo.manufacturer ? nodeinfo.manufacturer : 'id=' + nodeinfo.manufacturerid,
        nodeinfo.product ? nodeinfo.product : 'product=' + nodeinfo.productid +', type=' + nodeinfo.producttype);
        
    });

    zwave.on('notification', function (nodeid, notif, help) {
        console.log('node%d: notification(%d): %s', nodeid, notif, help);
        var log = ('node%d: notification(%d): %s', nodeid, notif, help);
        self.emit('notification', log);
    });

    zwave.on('scene event', function (nodeid, sceneid) {
        console.log("scene event: nodeid:" + nodeid + " scene:" + sceneid);
    });

    zwave.on('node event', function (nodeid, event, valueId) {
        console.log("node event: " + event + " on nodeid: " + nodeid + " with value " + valueId);
    });

    zwave.on('scan complete', function () {
        console.log('Scan Completed');

        self.emit('ready', 'Ready to accept commands!');
    });



    //Initialize the connection
    zwave.connect(zwavedriverpaths[os.platform()]);

}
//Zwave node setter
ZwaveWrapper.prototype.setValue = function (nodeId, nodeClass, arg3, arg4, value) {
    zwave.setValue(nodeId, nodeClass, arg3, arg4, value);
} 