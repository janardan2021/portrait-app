const mongoose = require('mongoose');
const Review = require('../models/reviews');
const names = require('./names');
const codes = require('./codes');
const ratings = require('./ratings');
const comments = require('./comments');


mongoose.connect('mongodb://127.0.0.1:27017/portraits')
   .then(() => {
    console.log('MONGO CONNECTION OPEN')
   })
   .catch( err => {
    console.log('MONGO CONNECTION ERROR!!!')
    console.log(err);
   })
const db = mongoose.connection;
db.on('error', err => {
    console.log(err);
  });


const seedDB = async () => {
    await Review.deleteMany({});
    function randomNumber(x) {
        return  Math.floor(Math.random() * x);
    }
    for (let i = 0; i < 10; i++) {
        const review = new Review({
            name:`${names[randomNumber(5)].name}`,
            code:`${codes[randomNumber(5)].code}`,
            rating:`${ratings[randomNumber(5)].rating}`,
            comment:`${comments[randomNumber(5)].comment}`
        });
        await review.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})