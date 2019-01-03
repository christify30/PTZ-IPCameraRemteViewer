const express = require('express');
var socket=require('socket.io');
const app = express();
var rtsp = null;
'use strict';
  process.chdir(__dirname);
var onvif = null;

try {
	rtsp = require('rtsp-live555');
} catch (e) {
	rtsp = require('./lib/rtsp-live555.js');
}

 
try {
	onvif1 = require('./lib/node-onvif.js');
	console.log('yes');
} catch(e) {
	onvif = require('node-onvif');
	
	console.log('No');
}

var onvif = require('onvif');
var Cam = require('onvif').Cam;

let device = new onvif1.OnvifDevice({
	xaddr: 'http://192.168.8.100:5400/onvif/device_service',
	user : '',
	pass : ''
  });


  // Initialize the OnvifDevice object
 /*device.init().then(() => {
	// Move the camera
	return device.ptzMove({
	  'speed': {
		x: 0.0, // Speed of pan (in the range of -1.0 to 1.0)
		y: -1.0, // Speed of tilt (in the range of -1.0 to 1.0)
		z: 0.0  // Speed of zoom (in the range of -1.0 to 1.0)
	  },
	  'timeout': 1// seconds
	});
  }).then(() => {
	console.log('Done!');
  }).catch((error) => {
	console.error(error);
  });*/


rtsp.prebuild(function (err) {
	if (err.result) {
		var server = app.listen(process.env.PORT || 5200 ,'0.0.0.0', function () {
			
			var port = server.address().port;
			console.log('listening at port:%s', port);
		});



		var io=socket(server);
		
		io.on('connection',(socket)=>{
			device.init().then(() => {
			console.log('made socket conection',socket.id);
			socket.on('x',(data)=>{
				return device.ptzMove({
					'speed': {
					  x: 3.0, // Speed of pan (in the range of -1.0 to 1.0)
					  y: 0.0, // Speed of tilt (in the range of -1.0 to 1.0)
					  z: 0.0  // Speed of zoom (in the range of -1.0 to 1.0)
					},
					'timeout': 1// seconds
				  });

			});
			socket.on('y',(data)=>{
				console.log('y');
				return device.ptzMove({
					'speed': {
					  x: 0.0, // Speed of pan (in the range of -1.0 to 1.0)
					  y: 3.0, // Speed of tilt (in the range of -1.0 to 1.0)
					  z: 0.0  // Speed of zoom (in the range of -1.0 to 1.0)
					},
					'timeout': 1// seconds
				  });
			 });
			
			 socket.on('-x',(data)=>{
			   
				console.log('-x');
				return device.ptzMove({
					'speed': {
					  x: -3.0, // Speed of pan (in the range of -1.0 to 1.0)
					  y: 0.0, // Speed of tilt (in the range of -1.0 to 1.0)
					  z: 0.0  // Speed of zoom (in the range of -1.0 to 1.0)
					},
					'timeout': 1// seconds
				  });
			 });
			 socket.on('-y',(data)=>{
				console.log('-y');
				return device.ptzMove({
					'speed': {
					  x: 0.0, // Speed of pan (in the range of -1.0 to 1.0)
					  y: -3.0, // Speed of tilt (in the range of -1.0 to 1.0)
					  z: 0.0  // Speed of zoom (in the range of -1.0 to 1.0)
					},
					'timeout': 1// seconds
				  });

			  });
		  }).then(() => {
			console.log('Done!');
		  }).catch((error) => {
			console.error(error);
		  });

		});
	




		app.get('/stream', (req, res) => {
			var _url = req.query.url;
			console.log(_url);
			var _isfirst = true;
			var _falsetime = 0;
			if (_url) {
				console.log(_url,'wow');
				res.writeHead(200, {
					'Access-Control-Allow-Origin': '*',
					'Connection': 'Keep-Alive',
					'Content-Type': 'video/x-flv'
				});
				var stream = new rtsp.Live555Client({ input: _url });
				stream.on('start', () => {
					console.log(_url + ' started');
				});
				stream.on('stop', () => {
					console.log(_url + ' stopped');
				});
				stream.on('data', (data) => {
					var _success = res.write(data);
					if (_success) {
						_falsetime = 0;
					} else {
						_falsetime++;
						if (_falsetime > 100) {
							stream.stop();
							res.end();
						}
					}
					
				});
			} else {
				res.end();
			}
		});

		app.use(express.static('html'));
	} else {
		console.log('build failed,err code:', err.code);
	}
});