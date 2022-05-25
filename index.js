const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();


// middletier
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.db_User}:${process.env.db_Pass}@assignmentcluster.ajcrt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect()

        const toolsCollection = client.db('Helpers').collection('tools');
        const userCollection = client.db('Helpers').collection('users');
        const reviewCollection = client.db('Helpers').collection('reviews');
        const purchaseCollection = client.db('Helpers').collection('purchase');


        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().toArray()
            res.send(tools)
        });

        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews)
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const addedReview = await reviewCollection.insertOne(review);
            res.send(addedReview)
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email, role: 'user' };
            const user = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(query, updatedDoc, options);
            const token = jwt.sign({ email: email }, process.env.JSONWEBTOKEN)
            res.send({ result, token });
        });

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send(user)
        });

        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: user.name,
                    location: user.location,
                    pfp: user.pfp,
                    number: user.number
                }
            }
            const updatedUser = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(updatedUser)
        })

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool)
        });

        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result)
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Tool baba on Fire')
})

app.listen(port, () => {
    console.log(`Tool baba`, port)
})