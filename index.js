require('dotenv').config();
const dns = require("dns");
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded( { extended: true })) //MiddleWare for form data

// connect to MongoDatabase
mongoose.connect('mongodb+srv://decimanao:lDhFfSRDnTl2SQYz@cluster0.l133z.mongodb.net/fcc-UrlShortenerProject.URLDatabase?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// URl Shortener

//create a new schema and model for Url's in order to be saved in MongoDb
let schema = new mongoose.schema({url: {type: String, required: true}})
let Url = mongoose.model("Url", schema)


function isValidUrl(url){
  try{
    let parsedUrl = new URL(url);
    return /^(http|https):\/\/www\./.test(parsedUrl.href);
  }catch(error){
    return false;
  }
}

app.post("/api/shorturl", (req,res) => {
  let { url } = req.body;

  if(!isValidUrl(url)){
    return res.json( {"error":'Invalid URL'} )
  }else{
    for(let key in urlDatabase){
      if(urlDatabase[key] === url){
        return res.json({ original_url : url, short_url : key} )
      }
    }
  }
  const urlInstance = new Url({url: url})
  urlInstance.save()
    .then( data => ({original_url: data.url, short_url: data.id}))
    .catch(err => console.error(err))

  /*let shortUrl = Object.keys(urlDatabase).length + 1 // return  an array with the amount of keys in the urlDatabase object and + 1  
  urlDatabase[shortUrl] = url // at this point the parsed url is valid and is assigned to a new index in the url Database Object.
  console.log(`url: ${url}, shortUrl: ${shortUrl}`)*/
  res.json({ original_url : data.url, short_url : data.id} )
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
