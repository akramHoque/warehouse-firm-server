const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000 ;
const app = express();
app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://dbUser3:LOHAcm0u3JUrLhgc@cluster0.b3o9khw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){

    try{
        await client.connect();
        const fruitCollection = client.db("wareHouse").collection("items"); 

        app.get('/items', async(req, res) => {
        const query = {};
        const cursor = fruitCollection.find(query);
        const items = await cursor.toArray(); 
        res.send(items);
        });


        app.get('/inventory/:id', async(req, res) =>{
          const id = req.params.id;
          // console.log(id);
          const query = {_id: ObjectId(id)};
          const item = await fruitCollection.findOne(query);
          res.send(item);
        })
        
        

      }
    finally{

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello this my warehousesdfg');
});

app.listen(port, () =>{
  console.log('listening to port')
})
