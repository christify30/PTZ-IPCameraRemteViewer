var socket=io.connect('http://192.168.1.102:5200');
var socket2=io.connect('https://rocky-mountain-19211.herokuapp.com');

function startsearch() {
    $('#search').attr("disabled", "disabled");
    $('#cameras').attr("disabled", "disabled");
    $('#play').attr("disabled", "disabled");
    $.get('search', function (data) {
        if (data.length > 0) {
            $('#select-default').remove();
            for (var t in data) {
                var p = data[t];
                var tmp = '<option value=\"' + p.uri + '\">' + p.hostname + "</option>";
                //console.log(tmp);
                $('#cameras').append(tmp);
            }
            $('#play').removeAttr("disabled");
            $('#search').removeAttr("disabled");
            $('#cameras').removeAttr("disabled");
        } else {
            $('#search').removeAttr("disabled");
            $('#cameras').removeAttr("disabled");
        }
    });
}
function getRTSPlink(params) {
    var _url = params.uri;
    var _user = params.username;
    var _pass = params.password;
    if (_user != '' && _user != undefined) {
        var _replaced_url = _url.replace('rtsp://', '');
        return 'rtsp://' + _user + ':' + _pass + '@' + _replaced_url;
    } else
        return _url;
}

function jsbridge(playerId, event, data) {
    switch (event) {
        case "onJavaScriptBridgeCreated":
            listStreams(teststreams, "streamlist");
            break;
        case "timeChange":
        case "timeupdate":
        case "progress":
            break;
        default:
            console.log(event, data);
    }
}
function playvideo() {
    document.getElementById('play').style.display='none';
    document.getElementById('cameras').style.display='none';
    setTimeout(() => {
        
        document.getElementById('videoElement').style.position='fixed';
        document.getElementById('videoElement').style.top='0px';
        document.getElementById('videoElement').controls=true;

        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var video = document.getElementById('videoElement');


        setInterval(() => {
            context.drawImage(video, 0, 0, 1000, 500);
            //image=document.getElementById("img1");
            document.getElementById("img1").src=canvas.toDataURL("image/webp");

          
                socket2.emit('image',  document.getElementById("img1").src);
        
    
    
            //convertCanvasToImage(canvas,image);
        }, 1000/60);

    }, 1000);

    
    var version = swfobject.getFlashPlayerVersion();
    console.log('flash version:', version.major);
    if (version.major > 0) {
        playswf();
    } else {
        flv_load();
    }
}
function x(){
    socket.emit('x',{  
    });
  console.log('working');
}

function y(){
    socket.emit('y',{  
    });
  console.log('working');
}
function mx(){
    socket.emit('-x',{  
    });
  console.log('working');
}
function my(){
    socket.emit('-y',{  
    });
  console.log('working');
}

function playswf() {
    var _rtsplink = $("#cameras").val();
    var _username = $('#username').val();;
    var _password = $('#password').val();;
    console.log(_rtsplink, ',', _username, ',', _password);
    $('#videocontainer').append('<div id=\"VideoElement\"></div>')
    var parameters = {
        src: location.origin + "/stream?url=" + getRTSPlink({ uri: _rtsplink, username: _username, password: _password }),
        autoPlay: "true",
        // controlBarAutoHide: "false",
        controls:"true",
        // controlBarPosition: "bottom",
        poster: "images/poster.png",
        javascriptCallbackFunction: "jsbridge"
    };
    console.log(parameters);
    // Embed the player SWF:
    swfobject.embedSWF(
        "GrindPlayer.swf"
        , "VideoElement"
        , 1000
        , 480
        , "10.2"
        , "expressInstall.swf"
        , parameters
        ,
        {
            allowFullScreen: "true",
            wmode: "transparent"
        }
        , {
            name: "GrindPlayer"
        }
    );
}
function flv_load() {
    console.log('isSupported: ' + flvjs.isSupported());
    var _rtsplink = $("#cameras").val();
    var _username = $('#username').val();;
    var _password = $('#password').val();;
    mediaDataSource = {
        "type": "flv",
        "url": "/stream?url=" + getRTSPlink({ uri: _rtsplink, username: _username, password: _password }),
        "hasAudio": false
    };
    console.log(mediaDataSource.url);
    $('#videocontainer').append('<video controls id=\"videoElement\" name=\"videoElement\"  autoplay width=100% height=480>Your browser is too old which doesn\'t support HTML5 video.</video>')
    var element = document.getElementsByName('videoElement')[0];
    element.controls = false;
    if (typeof player !== "undefined") {
        if (player != null) {
            player.unload();
            player.detachMediaElement();
            player.destroy();
            player = null;
        }
    }
    player = flvjs.createPlayer(mediaDataSource, {
        enableWorker: false,
        enableStashBuffer: false,
        isLive: true
    });
    player.attachMediaElement(element);
    player.load();

    setInterval(function () {
        var element = document.getElementsByName('videoElement')[0];
        var bufferedlen = element.buffered.length;
        if (bufferedlen > 0) {
            var time = element.buffered.end(0) - element.currentTime;
            console.log(time);
            /*
            if (time < 0) {
                player.pause();
                //player.unload();
                player.detachMediaElement();
                player.unload();
                player = null;
                player = flvjs.createPlayer(mediaDataSource, {
                    enableWorker: false,
                    enableStashBuffer: false,
                    isLive: true
                });
                player.attachMediaElement(element);
                player.load();
            }
            */
        }
    }, 1000);

}
function flv_start() {
    player.play();
}

function flv_pause() {
    player.pause();
}

function flv_destroy() {
    player.pause();
    player.unload();
    player.detachMediaElement();
    player.destroy();
    player = null;
}

function flv_seekto() {
    var input = document.getElementsByName('seekpoint')[0];
    player.currentTime = parseFloat(input.value);
}

function getUrlParam(key, defaultValue) {
    var pageUrl = window.location.search.substring(1);
    var pairs = pageUrl.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var keyAndValue = pairs[i].split('=');
        if (keyAndValue[0] === key) {
            return keyAndValue[1];
        }
    }
    return defaultValue;
}
/*
var urlInputBox = document.getElementsByName('urlinput')[0];
var url = decodeURIComponent(getUrlParam('src', urlInputBox.value));
urlInputBox.value = url;
*/
