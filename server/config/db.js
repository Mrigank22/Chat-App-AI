const mongoose = require("mongoose")

const connectDB = ()=>{
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log('MongoDB connected');
      }).catch((error) => {
        console.log('MongoDB connection failed:', error);
      });
}


module.exports=connectDB;