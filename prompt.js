const mongoose = require('mongoose')
const promptSchema = new mongoose.Schema({
    PROMPT:  {type: String },
    Description: {type:String},
    Type: {type:String },
    Category : {type:String }
})

const promptsModel = mongoose.model('Prompts',promptSchema)
module.exports=promptsModel;