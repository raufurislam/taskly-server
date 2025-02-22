const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xi11k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection = client.db("tasklyDb").collection("users");
    const taskCollection = client.db("tasklyDb").collection("tasks");

    // 📌 Add a new task
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      try {
        const result = await taskCollection.insertOne(task);
        res.send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Error inserting task:", error);
        res.status(500).send("Failed to insert task");
      }
    });

    // 📌 Get tasks for a specific user (by email)
    app.get("/tasks", async (req, res) => {
      try {
        const email = req.query.email; // Get user email from query params
        if (!email) {
          return res.status(400).send("Email is required");
        }
        const tasks = await taskCollection.find({ email }).toArray();
        res.send(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Failed to fetch tasks");
      }
    });

    // 📌 Update a task
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;

      // Ensure _id is removed from the updatedTask before updating
      const { _id, ...updatedData } = updatedTask;

      try {
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData } // Use updatedData without _id
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: "Task not found or not updated" });
        }

        res.json({ message: "Task updated successfully" });
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // 📌 Delete a task
    app.delete("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await taskCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send("Failed to delete task");
      }
    });

    // 📌 Add a user (Signup)
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log("Received user data:", user); // Debugging line

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // 📌 Get all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
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
// ---------------------------------------------------------

// Server Check
app.get("/", (req, res) => {
  res.send("Taskly is running");
});

app.listen(port, () => {
  console.log(`Taskly running on port ${port}`);
});
