const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground');
const{places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database connected")
});

const sample = (array)=> array[Math.floor(Math.random() * array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0; i<200; i++){
        const random1000= Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6876e4e9f2e5b5e58c55c6a6',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:  'Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, dicta impedit exercitationem esse at ad aperiam inventore a, dolorem nihil sit? Ullam veritatis cum iusto earum deleniti doloremque aliquid minima!',
            price,
            geometry: {
              type: "Point",
              coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/da84l8ko6/image/upload/v1754013360/YelpCamp/aqqbidrxzglvnitbu2vm.png',
                  filename: 'YelpCamp/aqqbidrxzglvnitbu2vm'
                },
                {
                  url: 'https://res.cloudinary.com/da84l8ko6/image/upload/v1753909806/YelpCamp/rvxxaxugnrwhlj1fx8sn.png',
                  filename: 'YelpCamp/rvxxaxugnrwhlj1fx8sn'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});

//`https://picsum.photos/400?random=${Math.random()}`