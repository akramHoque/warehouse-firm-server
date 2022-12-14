const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000 ;
const app = express();
app.use(cors());
app.use(express.json());

// verify jwt

function verifyJWT (req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: "unauthorized access"})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error, decoded) =>{
    if(error){
      return res.status(403).send({message: 'Forbidden access'})
    }
    console.log('show decoded', decoded)
    req.decoded = decoded ;
  })
      // console.log('verify jwt' , authHeader);
      next();
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b3o9khw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){

    try{
        await client.connect();
        const fruitCollection = client.db("wareHouse").collection("items"); 
        const newOrderCollection = client.db('fruitHouse').collection('order');


        // AUTH
        app.post('/token', async(req, res) => {
          const email = req.body;
          console.log(email);
          const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET , {
              expiresIn: '1d'
          });
          res.send({ accessToken });
          console.log(accessToken)
      })


        app.get('/items', async(req, res) => {
        const query = {};
        const cursor = fruitCollection.find(query);
        const items = await cursor.toArray(); 
        res.send(items);
        });


        app.post('/items', async(req, res) => {
          const items = req.body ;
          console.log(items);
          const result = await fruitCollection.insertOne(items);
          res.send(result);
        } );
    





        app.get('/inventory/:id', async(req, res) =>{
          const id = req.params.id;
          // console.log(id);
          const query = {_id: ObjectId(id)};
          const item = await fruitCollection.findOne(query);
          res.send(item);
        })
        
        //update decrease quantity by 1

    app.put('/inventory/:id', async(req, res) =>{
      const id = req.params.id;
     
      const quantityFinal = req.body ;
      
      const findWithFilter = {_id:ObjectId(id)}
     
      const options = {upsert: true};
      // console.log(options);
      const updatedDoc = {
        $set: {
          quantity:quantityFinal.newQuantity
        }
      };
      console.log(updatedDoc);
      const result = await fruitCollection.updateOne(findWithFilter, updatedDoc, options );
      res.send(result);
    });

     // manageInventories api create

     app.get('/manageInventories', async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      const manageInventories = await cursor.toArray();
      res.send(manageInventories);
    });


    
           // Delete item from manageInventory page
    app.delete('/manageInventories/:id' , async(req, res) =>{
      const id = req.params.id ;
      const query = {_id: ObjectId(id)} ;
      const result = await fruitCollection.deleteOne(query) ;
      res.send(result);
    });

// create order api to add new item
app.post('/order', async (req, res) => {
  const order = req.body;
  const result = await newOrderCollection.insertOne(order);
  res.send(result);
  });
    
  // test heroku

  // myItem



 // create order from database and show in ui
 app.get('/order', async(req, res) =>{
  const email = req.query.email ;
  
      // console.log(email)
  const query = {email:email};
  const cursor = newOrderCollection.find(query);
  const orders = await cursor.toArray();
  res.send(orders);

  
})

app.delete('/order/:id' , async(req, res) =>{
  const id = req.params.id ;
  const query = {_id: ObjectId(id)} ;
  const result = await newOrderCollection.deleteOne(query) ;
  res.send(result);
});
 


      }
    finally{

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello this my warehousesdfg');
});
app.get('/hero', (req, res) => {
  res.send('Hello this my hero');
});

app.listen(port, () =>{
  console.log('listening to port')
})
