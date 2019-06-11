const HOST = "172.20.10.4"
const http = require('http')
const path = require('path')
const net = require('net')

const express = require('express')
const WebSocketServer = require('ws').Server
const debug = require('debug')('example')
const { Parser } = require('minicap')

const app = express()

let testImage = null;

const PORT = process.env.PORT || 9002
const MINICAP_PORT = process.env.MINICAP_PORT || 12345




app.use(express.static(path.join(__dirname, '/public')))

app.get('/config.js', (req, res) => {
  res.status(200)
    .type('js')
    .send(`var WSURL = "ws://localhost:${PORT}"`)
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })
var sessionId = ""
var isSetSessionId = 0;
var wwss = new WebSocketServer({ port: 9008 });
wwss.on('connection', function (ws) {
  console.log('client connected');
  ws.on('message', function (message) {
    console.log(message);

    var obj = JSON.parse(message)



    var options = {
      host: HOST,
      port: 8100,
      path: '/status',
      method: 'GET',

    };


    var post_options = {
      host: HOST,
      port: 8100,
      path: '/session/AADB190B-2252-4F40-AF61-5A0D3C412A91/wda/dragfromtoforduration',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': message.length
      }
    };


    console.log("\n");


    function getSessionId() {
      return new Promise(function (resolve, reject) {
        var req = http.request(options, function (res) {

          console.log("statusCode: ", res.statusCode);

          console.log("headers: ", res.headers);

          var _data = '';

          res.on('data', function (chunk) {

            _data += chunk;

          });

          res.on('end', function () {
            var tempJson = JSON.parse(_data)
            console.log("\n--->>\nresult:", _data)
            console.log(tempJson.sessionId)
            resolve(post_options.path)
            sessionId = tempJson.sessionId
            post_options.path = '/session/' + sessionId + '/wda/dragfromtoforduration'
            isSetSessionId = 1;
          });


        });
        req.end()

      });



    }

    if(obj.toX === obj.fromX && obj.toY === obj.fromY){

      var tap_data = {
        x:obj.toX,
        y:obj.toY
      };

      var tap =  JSON.stringify(tap_data);
      post_options.headers["Content-Length"] = tap.length;
      console.log(tap.length);

      (async function () {

        if(isSetSessionId === 1){
          console.log("11111111111111111111111111111111")
        }
        else {
          await getSessionId();
        }
        post_options.path = '/session/' + sessionId + '/wda/tap/perform'
       // await tap_getSessionId()
        console.log(post_options.path)

        var post_req = http.request(post_options, function (res) {

          console.log("statusCode: ", res.statusCode);

          console.log("headers: ", res.headers);

          var _data = '';

          res.on('data', function (chunk) {

            _data += chunk;

          });

          res.on('end', function () {

            console.log("\n--->>\nresult:", _data)

          });

        });
        post_req.write(tap)
        post_req.end();
      })();

    }else {

      (async function () {
        if(isSetSessionId === 1){
          console.log("11111111111111111111111111111111")
        }
        else {
          await getSessionId();
        }
        post_options.path = '/session/' + sessionId + '/wda/dragfromtoforduration'
        console.log(post_options.path)
        var post_req = http.request(post_options, function (res) {

          console.log("statusCode: ", res.statusCode);

          console.log("headers: ", res.headers);

          var _data = '';

          res.on('data', function (chunk) {

            _data += chunk;

          });

          res.on('end', function () {

            console.log("\n--->>\nresult:", _data)

          });

        });
        post_req.write(message)
        post_req.end();
      })();
    }



  });

});

wss.on('connection', (ws) => {
  console.info('Got a client')

  var  stream = net.connect({
    port: MINICAP_PORT
  })

  stream.on('error', (err) => {
    console.error(err)
    console.error('Be sure to run ios-minicap on port ' + MINICAP_PORT)
    process.exit(1)
  })

  function onBannerAvailable (banner) {
    debug('banner', banner)
  }

  function onFrameAvailable (frame) {
    ws.send(frame.buffer, {
      binary: true
    })
    testImage = frame.buffer
    //console.log(this.testImage)
  }

  const parser = new Parser({
    onBannerAvailable,
    onFrameAvailable
  })

  function tryParse () {
    for (let chunk; (chunk = stream.read());) {
      parser.parse(chunk)
    }
  }

  stream.on('readable', tryParse)


  ws.on('close', () => {
    console.info('Lost a client')
    stream.end()

    stream.destroy();
  })
})

server.listen(PORT)
console.info(`Listening on port ${PORT}`)









