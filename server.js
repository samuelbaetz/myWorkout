const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require('path')
const PORT = process.env.PORT || 3005;
const Workout = require("./models/model");
const app = express();
app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/myworkout", {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true,useFindAndModify: false});



app.get("/api/workouts", (req, res) => {
    Workout.Workout.find({})
    .then(duration=>(Workout.Workout.aggregate([
      {
        $addFields:{
          totalDuration: {$sum:"$exercises.duration"}
        }
      }  
    ])))
      .then(r => {
        res.json(r);
      })
      .catch(err => {
        res.json(err);
      });  
  });
  app.post("/api/workouts", (req, res) => {
    Workout.Workout.create({}, (error, c) => {
      if (error) {
        res.send(error);
      } else {
        res.send(c);
      }
    })
  });
  app.put("/api/workouts/:id",({body,params},res)=>{
    Workout.Workout.findByIdAndUpdate(params.id,{$push:{exercises:body}},{runValidators: true})
    .then(w=>(res.json(w)))
  });
  app.get("/api/workouts/range",(req,res)=>{
    Workout.Workout.find({}).limit(7)
    .then(duration=>(Workout.Workout.aggregate([
      {
        $addFields:{
          totalDuration: {$sum:"$exercises.duration"}
        }
      }  
    ])))
    .then(data=>{
      res.json(data)
    })
  });

app.get('/exercise', (req,res)=> {
    res.sendFile(path.join(__dirname, "./public/exercise.html"));
})

app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname, "./public/index.html"));
})

app.get('/stats', (req,res)=> {
    res.sendFile(path.join(__dirname, "./public/stats.html"));
})

  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
  });