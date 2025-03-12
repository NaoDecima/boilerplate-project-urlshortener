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
mongoose.connect('mongodb+srv://decimanao:lDhFfSRDnTl2SQYz@cluster0.l133z.mongodb.net/fcc-UrlShortenerProject?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// URl Shortener

//create a new schema and model for Url's in order to be saved in MongoDb
let schema = new mongoose.Schema(
  {original_url: {type: String, required: true},
   short_url:{ type: Number, unique: true }})

schema.index({ short_url: 1 });                                 
let Url = mongoose.model("Url", schema)


//Handle post request

app.post("/api/shorturl", (req, res) =>{
  let urlBody = req.body.url;

  const isValidUrl = (urlBody) => {
    try{
      let parsedUrl = new URL(urlBody);
      return /^(http|https):\/\//.test(parsedUrl.href);
    }catch(error){
      return false;
    }
  } 
  if(!isValidUrl(urlBody)){
    res.json({ error: 'invalid url' })
  }else{

    Url.findOne().sort("-short_url").then(lastUrl => {
      let newShortUrl = lastUrl ? lastUrl.short_url + 1 : 1; // Start from 1

    const urlInstance = new Url({original_url: urlBody, short_url: newShortUrl})
    urlInstance.save()
      .then(data => res.json({original_url: data.original_url, short_url: data.short_url}))
      .catch(err => console.error(err))
    })
  }
})

app.get("/api/shorturl/:short_url?", (req, res) => {
  let shortUrl = req.params.short_Url;
  urlInstance.findOne({ short_url: shortUrl })
    .then(data => !data ?
                   res.json({error: "No short URL found"})
                  :res.redirect(data.original_url) )
    .catch(err => console.error(err))
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
