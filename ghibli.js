const http = require('http');

function getJSON(options, cb) {
    var req = http.request(options, function(res) {
        var api_response = '';
        
        res.on("data", function(chunk) {
            api_response += chunk;
        });
        
        res.on("end", function() {
            api_response = JSON.parse(api_response);
            cb(null, api_response);
        });
        
        res.on('error', cb);
    })
    .on('error', cb)
    .end()
    
}

var options = {
    host: 'ghibliapi.herokuapp.com',
    port: 80,
    path: '/films',
    method: 'GET'
}

getJSON(options, function(err, result) {
    if (err) {
        return console.log('Error while trying to access API');
    }

    console.log(result);
})