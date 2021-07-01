const express = require("express");
const app = express();
const morgan = require('morgan');
const uuid = require('uuid');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

//Initializing dotenv
dotenv.config();

//Setting PORT
const PORT = process.env.PORT || 5000;
//Setting Connection String
const connectionString = "mongodb+srv://admin:"+process.env.DB_PASSWORD+"@cluster0.lxiho.mongodb.net/AnonConfDB?retryWrites=true&w=majority";
MongoClient.connect(connectionString, {
    useUnifiedTopology: true
})
.then(client => {
    console.log("Database Successsfully Connected!");
    const db = client.db("AnonConfDB");
    const blasts = db.collection('blasts');

    //Morgan
    app.use(morgan('tiny'));

    //View Engine
    app.set('view engine', 'ejs');

    //Static Folder
    app.use(express.static('public'));

    //Body Parser
    app.use(express.json());
    app.use(express.urlencoded({extended: true}))

    //Handling Page Routes
    app.get('/', (req,res)=>{
        blasts.find().toArray()
        .then(blasts => {
            console.log(blasts);
            res.render('index.ejs', {blasts})
        }).catch(err => console.error(err));
    });

    app.get('/add-blast', (req,res)=>{
        res.render('add_blast');
    });

    app.get('/', (req,res)=>{
        
    });

    //Handling API Routes

    //GET All Blasts
    app.get('/api/blasts', (req,res)=>{
        blasts.find().toArray()
        .then(blasts => {
            res.status(200).send(blasts);
        })
        .catch(err => console.log(err));
    });

    //GET One BLast By ID
    app.get('/api/blasts/:id', (req,res)=>{
        const id = req.params.id;
        blasts.find({
            id: id
        }).toArray()
        .then(blasts => {
            res.status(200).send(blasts);
        })
        .catch(err => console.log(err));
    });

    //POST One Blast
    app.post('/api/blasts', (req,res) => {
        if(!req.body.title){
            console.log("Empty Blast! Skipping...");
            res.redirect('/');
        } else {
            const newBlast = {
                id: uuid.v4(),
                title: req.body.title,
                text: req.body.text,
            }
            blasts.insertOne(newBlast)
            .then(results => {
                res.redirect('/')
            })
            .catch(err => console.log(err));
        }
    });

    //UPDATE One Blast
    app.put('/api/blasts/:id', (req,res) => {
        const id = req.params.id;
        blasts.findOneAndUpdate({
            id: id
        },
        {
            $set: req.body
        })
        .then(result=>{
            res.json("Blast Updated")
        })
        .catch(err=> console.log(err));
    });

    //DELETE One Blast
    app.delete('/api/blasts/:id', (req,res) => {
        const id = req.params.id;
        blasts.deleteOne({
            id: id
        })
        .then(result => {
            if(result.deletedCount === 0){
                res.json("Unexpected Error - Product Not Found")
            }
            res.json("Deleted Object");
        })
        .catch(err => console.error(err));
    });

    //Starting Server
    app.listen(PORT, ()=>{
        console.log("Server running at port",PORT);
    });
}).catch(err => {
    console.log(err.message || "Unknown Error - Custom");
});