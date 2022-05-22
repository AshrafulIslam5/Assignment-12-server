const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


// middletier
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.db_User}:${process.env.db_Pass}@assignmentcluster.ajcrt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect()

        const toolsCollection = client.db('Helpers').collection('tools')
        

        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().toArray()
            res.send(tools)
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