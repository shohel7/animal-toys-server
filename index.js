const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database connection
// const uri = "mongodb://localhost:27017";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clv72st.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const animalToysCollection = client
      .db("animalToysDB")
      .collection("animalToys");

    app.get("/allToys", async (req, res) => {
      const result = await animalToysCollection.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await animalToysCollection.findOne(query);
      res.send(result);
    });

    app.get("/myToys", async (req, res) => {
      console.log(req.query.sellerEmail);

      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const result = await animalToysCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/subCategory", async (req, res) => {
      // console.log(req.query.subCategory);

      let query = {};
      if (req.query?.subCategory) {
        query = { subCategory: req.query.subCategory };
      }
      const result = await animalToysCollection.find(query).toArray();
      res.send(result);
    });

    // search api
    app.get("/searchToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await animalToysCollection
        .find({
          $or: [{ toyName: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    // sorting api
    app.get("/myAllToys", async (req, res) => {
      // console.log(req.query.sort);
      const selectedOption = req.query.sort;
      let sortOption = {};

      if (selectedOption === "asc") {
        sortOption = { price: 1 }; // Sort by price ascending
      } else if (selectedOption === "desc") {
        sortOption = { price: -1 }; // Sort by price descending
      }

      const result = await animalToysCollection
        .find()
        .sort(sortOption)
        .toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await animalToysCollection.insertOne(body);
      res.send(result);
    });

    app.put("/updatedToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = {
        $set: {
          ...body,
        },
      };
      const result = await animalToysCollection.updateOne(
        filter,
        updatedToy,
        options
      );
      res.send(result);
    });

    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await animalToysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Animal Toys Server is running");
});

app.listen(port, () => {
  console.log(`Animal Toys server is running at ${port}`);
});
