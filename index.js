
const express = require('express')
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
//middlewear
app.use(cors());
app.use(express.json());

// mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tpb52.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const productCollection = client.db('emaJohn').collection('product');
        
        app.get('/product', async(req, res) =>{
           console.log('query', req.query);
           const page = parseInt(req.query.page);
           const size = parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if(page || size){
                // 0 --> skip: 0 get : 0-10;
                // 1 --> skip: 1*10 get 11-20;
                // 2 --> skip: 2*10 get 21-30;
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.limit(10).toArray();
            }
            
            res.send(products);

        })

        app.get('/productcount', async(req, res) =>{
            //const query = {};
            //const cursor = productCollection.estimatedDocumentCount.find(query);
            const count = await productCollection.estimatedDocumentCount();
            res.send({count});
            //res.json(count);
        });
        
        // use post to get products by ids
        // app.post('/productByKeys', async(req, res) =>{
        //     const keys = req.body;
        //     console.log(keys);
        //     const ids = keys.map(id => ObjectId(id));
        //     const query = {_id: {$in:ids}};
        //     const cursor = productCollection.find(query);
        //     const products = await cursor.toArray();
        //     res.send(products);
        //     console.log(keys);
        // })

        app.post('/productByKeys', async(req, res) =>{
            const keys = req.body;
            const ids = keys.map(id => Object(id));
            const query = {_id: {$in: ids}}
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            console.log(keys);
            res.send(products);
        });


    }
    finally{ }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ema  ia waiting to run')
})

app.listen(port, () => {
    console.log(`Ema John running port : ${port}`);
});