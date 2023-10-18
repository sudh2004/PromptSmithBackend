const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.port
const mongodburl = process.env.mongodburl
const promptsModel = require('./prompt')
app.use(cors())
app.use(express.json())

mongoose.connect(mongodburl,{useNewUrlParser:true,useUnifiedTopology:true}) 
.then(()=>console.log("Connect"))
.catch((err)=>console.log(err))

app.get('/api/response/prompt', async (req, res) => {
  const searchText = req.query.text || '';

  try {
    // Use a regular expression to perform a case-insensitive search on the Description field
    const regex = new RegExp(searchText, 'i');
    const suggestions = await promptsModel.find({ Description: regex });

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port,()=>{
    console.log("Connect To database",port)
})