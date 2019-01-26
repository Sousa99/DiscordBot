const axios = require('axios');

axios.post('http://3d60e349.ngrok.io/leet', {leet:'Hello World, I see you!'})
    .then( response => { console.log(response.data.leet)})
    .catch( err => { console.log(err) })