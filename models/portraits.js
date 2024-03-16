const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PortraitSchema = new Schema({
   
    url: String,
            
    filename: String
    
    
});

module.exports= mongoose.model("Portrait", PortraitSchema);