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

let UrlSchema = new mongoose.schema({    //create a new schema and model for Url's in order to be saved in MongoDb 
  url: {type: String, required: true}
})
let URLDatabase = mongoose.model("URLDatabase", UrlSchema)



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// URl Shortener


function isValidUrl(url){
  try{
    let parsedUrl = new URL(url);
    return /^(http|https):\/\/www\./.test(parsedUrl.href);
  }catch(error){
    return false;
  }
}
// MONGO Database CRUD functions
function CreateAndSaveUrl(url,done){
  
  let urlInstance = new URLDatabase({original_url: url })

  urlInstance.save(function errorCallback(err,data){
    if(err){
      console.error(err)
      return done(err,null)
      }
    done(null, data)
  })
}

async function findUrlInDatabase(url) {
  try {
    // Retrieve all documents from the collection
    const foundUrl = await URLDatabase.findOne({ original_url: url });
    if (foundUrl) {
      console.log("Found matching entry:", foundUrl);
      return foundUrl; // Return the found URL document
    }
    console.log("No matching entry found.");
    return null;
  } catch (err) {
    console.error("Error fetching URLs:", err);
    return null; // Return null on error
  }
}
    




// server side functions 
app.post("/api/shorturl", (req,res) => {
  let { url } = req.body;

  if(!isValidUrl(url)){
    return res.json( { "error": 'Invalid URL' } )
  }else {
    const existingUrl = findUrlInDatabase(url); // Use await here
    if (existingUrl) {
      return res.json({ original_url: existingUrl.original_url, short_url: existingUrl._id }); // Return existing URL data
    } else {
      CreateAndSaveUrl(url, (err, savedUrl) => {
        if (err) return res.json({ error: 'Could not save URL' });
        return res.json({ original_url: savedUrl.original_url, short_url: savedUrl._id }); // Return saved URL data
      });
    }
  }

  
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
