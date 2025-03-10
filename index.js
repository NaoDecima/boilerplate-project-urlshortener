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

app.post("/api/shorturl", (req,res) => {
  let { url } = req.body;
  let domain = new URL(url).hostname; //extracts domain

  dns.lookup(domain, (err, address) => {
    if(err || !address){
      return res.json( {"error":'invalid URL'} )
    }

    for(let key in urlDatabase){
      if(urlDatabase[key] === url){
        res.json({ original_url : url, short_url : key} )
      }
    }
    let shortUrl = Object.keys(urlDatabase).length + 1 // return  an array with the amount of keys in the urlDatabase object and + 1  
    urlDatabase[shortUrl] = url // at this point the parsed url is valid and is assigned to a new index in the url Database Object.
    console.log(`url: ${url}, shortUrl: ${shortUrl}`)
    res.json({ original_url : url, short_url : shortUrl} )

  })

  
})

app.get("/api/shorturl/:short_url", (req,res) => {
  let shortUrl = req.params.short_url   //when a GET request is made the value of Short_url is used...
  let originalUrl = urlDatabase[shortUrl]; // ...as an index in urlDatabase to find the associated originalUrl.
  console.log(`originalUrl: `+ originalUrl)
  if(originalUrl){
    return res.redirect(originalUrl) //if the originalUrl is in urlDatabase the user is redirected to it.
  }else{
    return res.json( {error: "No short URL found"} )
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
