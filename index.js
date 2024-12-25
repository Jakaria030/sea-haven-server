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
    app.get('/rooms', async (req, res) => {
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || 10000;

      const query = {
        room_price: {
          $gte: minPrice,
          $lte: maxPrice,
        },
      };

      const cursor = roomsCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    // get specific room
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);

      res.send(result);
    });

    // update room status
    app.patch('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const { is_booked } = req.body;
      const query = { _id: new ObjectId(id) };
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
    app.post('/booked-room', async (req, res) => {
      const { newBooking } = req.body;
      const result = await bookedRoomsCollection.insertOne(newBooking);

      res.send(result);
    });


    // booked rooms read
    app.get('/booked-room', async (req, res) => {
      const email = req.query.email;

      const bookings = await bookedRoomsCollection.find({ email }).toArray();
      const roomsIds = bookings.map(bookingDetail => new ObjectId(bookingDetail.roomId))

      const filter = {
        _id: {
          $in: roomsIds
        }
      };

      const rooms = await roomsCollection.find(filter).toArray();
      res.send({ bookings, rooms })
    });

    app.get('/booked-room/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookedRoomsCollection.findOne({ roomId: id });

      res.send(result);
    })

    // dont allow same room added multiple time
    app.get('/single-room-get', async (req, res) => {
      const room_id = req.query.room_id;
      const user_email = req.query.user_email;

      const query = {
        roomId: room_id,
        email: user_email
      };

      const result = await bookedRoomsCollection.findOne(query);

      res.send(result);
    });

    // update booked room status
    app.patch('/booked-room/:booking_id', async (req, res) => {
      const booking_id = req.params.booking_id;
      const { isCancel } = req.body;
      const query = { _id: new ObjectId(booking_id) };
      const updatedRoom = {
        $set: {
          isCancel
        }
      };

      const result = await bookedRoomsCollection.updateOne(query, updatedRoom);

      res.send(result);
    });

    // updated check in date
    app.patch('/booked-room-release/:booked_id', async (req, res) => {
      const booked_id = req.params.booked_id;
      const { bookingDate, checkInDate, isCancel } = req.body;
      const query = { _id: new ObjectId(booked_id) };
      const updateDate = {
        $set: {
          bookingDate,
          checkInDate,
          isCancel,
        }
      };

      const result = await bookedRoomsCollection.updateOne(query, updateDate);

      res.send(result);
    });
    // booked related api end

    // review related api start
    // post reveiw
    app.post('/review-room', async (req, res) => {
      const { newReview } = req.body;
      const result = await reviewsCollection.insertOne(newReview);

      res.send(result);
    });

    // get reviews of specific room
    app.get('/reviews/:room_id', async (req, res) => {
      const room_id = req.params.room_id;
      const filter = { roomId: room_id };
      const result = await reviewsCollection.find(filter).toArray();

      res.send(result);
    });

    // count number of reviews
    app.get('/count-reviews/:id', async (req, res) => {
      const id = req.params.id;

      const count = await reviewsCollection.countDocuments({ roomId: id });

      res.send({ count });
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection
        .find({})
        .sort({ reviewDate: -1 })
        .limit(6)
        .toArray();

      res.send(reviews);
    });

    // review related api end


    // toop rooms for home page
    app.get('/top-rooms', async (req, res) => {

      const topRooms = await roomsCollection.aggregate([
        {
          $lookup: {
            from: "reviews",
            let: { roomId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$roomId", "$$roomId"] }
                }
              }
            ],
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: { $avg: "$reviews.rating" },
            totalReviews: { $size: "$reviews" },
          },
        },
        {
          $sort: { totalReviews: -1, averageRating: -1 },
        },
        {
          $limit: 6,
        },
        {
          $project: {
            _id: 1,
            room_image: 1,
            room_name: 1,
            room_price: 1,
            is_booked: 1,
            room_description: 1,
            totalReviews: 1,
          },
        },
      ]).toArray();

      res.send(topRooms);
    });



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