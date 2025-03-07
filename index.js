require('dotenv').config();
const dns = require("dns");
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded( { extended: true })) //MiddleWare for form data

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// URl Shortener
let urlDatabase = {}

app.post("/api/shorturl", function(req,res){
  let { url } = req.body;

  
  let domain = url.replace(/^https?:\/\//,"").split("/")[0] // Replace the protocol part of the url with "". Split it at / and store it in an array. assign [0] to domain.

  dns.lookup(domain, (err, address) => {
    if(err || !address){
      return res.json( { error: 'invalid url' } )
    }

    let shortUrl = Object.keys.length(urlDatabase) + 1 // return  an array with the amount of keys in the urlDatabase object and + 1  
    urlDatabase[shortUrl] = url // at this point the parsed url is valid and is assigned to a new index in the url Database Object.

    res.json({ original_url : url, short_url : shortUrl} )

  })

  app.get("/api/shorturl/:short_url", function(req,res){  
    let shortUrl = req.params.short_url   //when a GET request is made the value of Short_url is used
    let originalUrl = urlDatabase[shortUrl]; // as an index in urlDatabase to find the associated originalUrl.

    if(originalUrl){
      return res.redirect(originalUrl) //if the originalUrl is in urlDatabase the user is redirected to it.
    }else{
      return res.json( {"No short URL found"} )
    }


  })

})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
