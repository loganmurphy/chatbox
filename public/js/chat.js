var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
ctx.strokeStyle = 'black';
ctx.lineCap = 'round';
ctx.lineJoin = 'bevel';
ctx.lineWidth = 5;

var mouse_down = false;
var past;
var current;

canvas.addEventListener('mousedown', function (event) {
  mouse_down = true;
  console.log('down', event.offsetX, event.offsetY);
});
canvas.addEventListener('mouseup', function (event) {
  mouse_down = false;
  past = null;
  console.log('up', event.offsetX, event.offsetY);
});
canvas.addEventListener('mousemove', function (event) {
  if (mouse_down) {
    console.log('move', event.offsetX, event.offsetY);

    current = [event.offsetX, event.offsetY];
    if (past) {
      send_draw(past, current);
    }

    past = [event.offsetX, event.offsetY];
  }
});

var player = videojs("myVideo", {
    controls: true,
    width: 320,
    height: 240,
    fluid: false,
    plugins: {
        record: {
            audio: true,
            video: true,
            maxLength: 10,
            debug: true
        }
    }
});
// error handling
player.on('deviceError', function() {
    console.log('device error:', player.deviceErrorCode);
});

player.on('error', function(error) {
    console.log('error:', error);
});

// user clicked the record button and started recording
player.on('startRecord', function() {
    console.log('started recording!');
});

// user completed recording and stream is available
player.on('finishRecord', function() {
    // the blob object contains the recorded data that
    // can be downloaded by the user, stored on server etc.
    console.log('finished recording: ', player.recordedData);
    // Try to save
    var blob = player.recordedData;
    var vid_src = blob.video;
    var v = document.createElement('video');
    v.src = window.URL.createObjectURL(blob.video);
    $('#send_video').show();
    $('#send_video').click(function(){
      // $('#messages').append(v);

      // stuff for transfering video

      socket.emit('video message', );
      // console.log('here is a v', vid_src);
      });
      socket.on('video message', function(vid_src){
      console.log('here is a v', vid_src);

      let v = document.createElement('video');
      v.src = window.URL.createObjectURL(blob.video);
      $('#messages').append(v);
      v.loop = true;
      v.play();
      // var play = false;
      // play = !play
      // if(play == true){
      //   v.loop = true;
      //   v.play();
      //   // return play = true;
      // } else {
      //   v.loop = false;
      //   v.pause();
      //   // return play = false;
      // }

      // $('video').click(function(){
      //   play = !play;
      //   // return play = true;
      // })
      });

  });

  var socket = io();
  var handles = [];
  function send_draw (past, current) {
    socket.emit('draw', [past, current]);
  }

  socket.on('do-draw', function (coords) {
    draw(coords[0], coords[1]);
  });

  function draw (past, current) {
    ctx.beginPath()
    $('#black').click(function(){
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 5;
    });
    $('#red').click(function(){
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
    });$('#green').click(function(){
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 5;
    });$('#blue').click(function(){
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 5;
    });
    $('#erase').click(function(){
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 50;
    });
    ctx.moveTo(past[0], past[1]);
    ctx.quadraticCurveTo(
      past[0], past[1],
      current[0], current[1]
    );
    ctx.stroke();
    ctx.closePath();
  }
  $(function () {
    // var socket = io();
  $('.handle_form').submit(function(){
    socket.emit('handle', {id: socket.id, handle: $('#user_handle').val()});
    $('#user_handle').val('');
    return false;
  });
  socket.on('handles', function(data){
    var html = '';
    data.handles.forEach(function (h) {
      html += `<li>${h}</li>`;
    });
    $('#current_users').html(html);
  });


  $(function () {
    $('.form').submit(function(){
      socket.emit('chat message', $('#m').val());
      if($('#m').val() != ''){
        $('#typing').val('User is typing...')
      }
      $('#m').val('');
      $('#typing').val('');
      return false;
    });
    socket.on('chat message', function(handle, msg){
      $('#messages').append($('<li>').text(`${handle}: ${msg}`));
    });
  });
});
