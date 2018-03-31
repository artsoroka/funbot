const http = require('http'); 
const request = require('request'); 
const config  = require('./config'); 

const sendMessage = (message, cb) => {
  request({
  	url: 'https://api.vk.com/method/messages.send', 
  	method: 'POST', 
    form: {
  	  v: '5.73', 
  	  access_token: config.apiKey, 
  	  user_id: message.userId, 
//  	  peer_id: message.userId, 
  	  message: message.text
  	}
  }, cb); 
}


const parseJson = (str) => {
  var result = null; 
  try{
  	result = JSON.parse(str)
  } catch(e){
  	return null; 
  }
  return result; 
}

const server = http
  .createServer((req,res) => {
    const data = []; 
    req
      .on('data', chunk => data.push(chunk))
      .on('end', () => {
      	const payload = data.join('').toString(); 
      	const message = parseJson(payload); 
      	console.log('Got message', message); 
      	
      	if( ! message ) return res.end('not ok'); 

      	if( message.type && message.type == 'confirmation'){
      	  return res.end(config.confirmKey); 
      	}

      	if(message.type == 'message_new'){
      	  console.log('Got new message from %d : %s', message.object.user_id, message.object.body); 
          console.log('===Detecting line break===');
          const arr = message.object.body.split('\n'); 
          console.log('Length: %d array: %s', arr.length, arr);
          console.log('===Detecting line break===');
      	  sendMessage({
            userId: message.object.user_id, 
            text: 'You said: ' + message.object.body
          }, (err, response, body) => {
            if( err ) return console.log('ERROR: %s', err); 
            console.log(body); 
          })
      	}

      	res.end('ok'); 
      
      }); 
  })
  .listen(config.port, () => {
    console.log('server started on port %d', server.address().port); 
  }); 