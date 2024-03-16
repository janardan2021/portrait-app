const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const ReviewSchema = new Schema({
    rating:{
        type: Number,
        required: false,
        unique: false
    },
    comment: {
        type: String,
        required: false,
        unique: false
    }
})

ReviewSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("Review", ReviewSchema);