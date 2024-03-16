const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: false
    },
    subject: {
        type: String,
        required: true,
        unique: false
    }
})

module.exports= mongoose.model("Message", MessageSchema);