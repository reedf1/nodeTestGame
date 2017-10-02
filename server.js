var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

server.lastPlayderID = 0; 

io.on('connection',function(socket){
    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,1600),
            y: randomInt(100,1200)
        };
    socket.emit('allplayers',getAllPlayers());

    socket.broadcast.emit('newplayer',socket.player);

   	socket.emit('playerfocus',socket.player.id);

    socket.on('click',function(data){
        console.log('click to '+data.x+', '+data.y);
        socket.player.x = data.x;
        socket.player.y = data.y;
        io.emit('move',socket.player);
    });

     socket.on('disconnect',function(){
        io.emit('remove',socket.player.id);
    });
    });
})
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}
