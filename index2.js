// async function run() {
//   // await client.connect();

//   const userCollection = client.db("tasklyDb").collection("users");

//   // USER RELATED API
//   app.post("/users", async (req, res) => {
//     const user = req.body;

//     // insert email if user doesn't exist (1.unique email, 2.upsert, 3.simple checking)
//     const query = { email: user.email };
//     const existingUser = await userCollection.findOne(query);
//     if (existingUser) {
//       return res.send({ message: "user already exist", insertedId: null });
//     }
//     const result = await userCollection.insertOne(user);
//     res.send(result);
//   });

//   app.get("/users", async (req, res) => {
//     //verifyToken, verifyAdmin,
//     // console.log(req.headers);
//     const result = await userCollection.find().toArray();
//     res.send(result);
//   });

//   console.log("Connected to MongoDB");
// }
// run();
// -----------------------------------------------------------------
