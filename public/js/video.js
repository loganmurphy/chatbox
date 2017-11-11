// var player = videojs("myVideo", {
//     controls: true,
//     width: 320,
//     height: 240,
//     fluid: false,
//     plugins: {
//         record: {
//             audio: true,
//             video: true,
//             maxLength: 10,
//             debug: true
//         }
//     }
// });
//


// // error handling
// player.on('deviceError', function() {
//     console.log('device error:', player.deviceErrorCode);
// });
//
// player.on('error', function(error) {
//     console.log('error:', error);
// });
//
// // user clicked the record button and started recording
// player.on('startRecord', function() {
//     console.log('started recording!');
// });
//
// // user completed recording and stream is available
// player.on('finishRecord', function() {
//     // the blob object contains the recorded data that
//     // can be downloaded by the user, stored on server etc.
//     console.log('finished recording: ', player.recordedData);
//     // Try to save
//     var blob = player.recordedData;
//     console.log(blob);
//     // var blob = player.record().saveAs({'video': 'my-video-file-name.webm'});
//     // add_vid(blob)
//
// });
