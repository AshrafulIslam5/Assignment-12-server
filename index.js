const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.StripeKey)


// middletier
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.db_User}:${process.env.db_Pass}@assignmentcluster.ajcrt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' })
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JSONWEBTOKEN, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        await client.connect()

        const toolsCollection = client.db('Helpers').collection('tools');
        const userCollection = client.db('Helpers').collection('users');
        const reviewCollection = client.db('Helpers').collection('reviews');
        const purchaseCollection = client.db('Helpers').collection('purchase');
        const transictionIdCollection = client.db('Helpers').collection('transictionIds');


        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().toArray()
            res.send(tools)
        });

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool)
        });

        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const newQuantity = req.body;
            const updatedDoc = {
                $set: { quantity: newQuantity.FinalQuantity }
            };
            const result = await toolsCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
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

        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result)
        });

        app.get('/purchase', verifyJWT, async (req, res) => {
            const email = req?.query.email;
            const decodedEmail = req?.decoded?.email;
            if (email === decodedEmail) {
                const filter = { PurchaserEmail: email };
                const purchases = await purchaseCollection.find(filter).toArray();
                return res.send(purchases)
            } else {
                res.status(403).send({ message: 'forbidden access' })
            }
        });

        app.get('/purchase/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const order = await purchaseCollection.findOne(filter);
            res.send(order);
        });
        app.get('/purchase/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const order = await purchaseCollection.findOne(filter);
            res.send(order);
        });

        app.put('/purchase/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const transactionId = req.body.transactionId;
            console.log(req.body)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    paidStatus: true,
                    Status: 'pending',
                    transactionId: transactionId
                }
            }
            const PaidOrder = await purchaseCollection.updateOne(filter, updatedDoc, options);
            res.send(PaidOrder);
        })

        app.post('/createPaymentIntent', verifyJWT, async (req, res) => {
            const { price } = req.body;
            const payableMoney = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: payableMoney,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        })
        
        app.delete('/purchase/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(filter);
            res.send(result)
        });
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