const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7vwvj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    // create database collection
    const roomsCollection = client.db('seaHaven').collection('rooms');
    const bookedRoomsCollection = client.db('seaHaven').collection('bookedRooms');
    const reviewsCollection = client.db('seaHaven').collection('reviews')

    // rooms related api start
    // get rooms
    app.get('/rooms', async(req, res) => {
      const cursor = roomsCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // get specific room
    app.get('/rooms/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await roomsCollection.findOne(query);

      res.send(result);
    });

    // update room status
    app.patch('/rooms/:id', async(req, res) => {
      const id = req.params.id;
      const {is_booked} = req.body;
      const query = {_id: new ObjectId(id)};
      const updatedRoom = {
        $set: {
          is_booked
        }
      };

      const result = await roomsCollection.updateOne(query, updatedRoom);

      res.send(result);
    });
    // rooms related api end

    // booked related api start
    // stor booking details
    app.post('/booked-room', async(req, res) => {
      const {newBooking} = req.body;
      const result = await bookedRoomsCollection.insertOne(newBooking);

      res.send(result);
    });

    
    // booked rooms read
    app.get('/booked-room', async(req, res) => {
      const email = req.query.email;

      const bookings = await bookedRoomsCollection.find({email}).toArray();
      const roomsIds = bookings.map(bookingDetail => new ObjectId(bookingDetail.roomId))

      const filter = {
        _id: {
          $in: roomsIds
        }
      };

      const rooms = await roomsCollection.find(filter).toArray();
      res.send({bookings, rooms})
    });
    // booked related api end

    // review related api start
    // post reveiw
    app.post('/review-room', async(req, res) => {
      const {newReview} = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      
      res.send(result);
    });
    // review related api end
  




    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Sea Server is running...');
});

app.listen(port, () => {
    console.log(`Sea Haven server is running on port: ${port}`);
});