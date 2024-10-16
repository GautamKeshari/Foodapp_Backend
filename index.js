const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3001;
require('dotenv').config()

// username -> gkeshari124
// password -> hdSXT8zdr68peHg0

// middlewares
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://gkeshari124:hdSXT8zdr68peHg0@cluster0.gmyqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&ssl=true`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected");
        
        // databases and collections
        const menuCollections = client.db("foodappdb").collection("menus");
        const cartCollections = client.db("foodappdb").collection("cartItems");
        
        // all menu items  (mongodb crud operations)
        app.get("/menu",async(req,res)=>{
            const result = await menuCollections.find().toArray()
            res.send(result)
        })

        // all alerts operation
        app.post("/carts", async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollections.insertOne(cartItem);
            res.send(result);
        })
        
        // get carts according to specific use email
        app.get("/carts", async (req, res) => {
            // localhost:3001/carts?email=gkeshari124@gmail.com -> give carts item w.r.t this user email
            const email = req.query.email;
            const filter = { email: email };
            const result = await cartCollections.find(filter).toArray();
            res.send(result);
        });

        // get specific cart
        app.get("/carts/:id",async(req,res)=>{
            const id=req.params.id;
            const filter={ _id: new ObjectId(id) };
            const result= await cartCollections.findOne(filter);
            res.send(result);
        })

        // deleting item from cart
        app.delete("/carts/:id",async(req,res)=>{
            const id=req.params.id;
            const filter={ _id: new ObjectId(id)};
            const result=await cartCollections.deleteOne(filter);
            res.send(result);
        })

        // update cart quantity (https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/)
        app.put("/carts/:id",async(req,res)=>{
            const id=req.params.id;
            const { quantity }= req.body;
            const filter={ _id: new ObjectId(id) };
            // Set the upsert option to insert a document if no documents match the filter
            const options= {upsert:true}
            // console.log("Upsert");
            const updateDoc={
                $set:{
                    quantity: parseInt(quantity, 10),
                },
            };
            const result = await cartCollections.updateOne(filter, updateDoc, options);
        })
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get("/",(req,res)=>{
    res.send("hello world!")
})

// Print all registered routes
// console.log("Registered routes:", app._router.stack);

app.listen(PORT,()=>{
    console.log(`App is started on port: ${PORT}`)
})