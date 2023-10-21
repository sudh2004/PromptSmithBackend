const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    resetToken: String,
    resetTokenExpiration: Date,
    submitTime : {
        type: Date,
        default: Date.now()
    }
})

const authModel = mongoose.model('auth',authSchema)
module.exports=authModel;