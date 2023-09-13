const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { connectDb } = require("./config/dbConnection");
const socketIo = require("socket.io");

const app = express();

app.use(express.json({ limit: "100mb", extended: true }));

const corsOptions = {
  origin: ["http://localhost:5173","https://www.spotopia.site"], 
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.options('/createCheckout', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ["http://localhost:5173","https://www.spotopia.site"]);
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).send();
});

app.use(express.static("public"));

const userRouter = require("./routes/users.js");
const turfRouter = require("./routes/turf.js");
const adminRouter = require("./routes/admin.js");

app.use("/", userRouter);
app.use("/turf", turfRouter);
app.use("/admin", adminRouter);



const PORT = process.env.MONGODB_PORT;

connectDb();

const server = app.listen(PORT, () =>
  console.log(`Server started on port: ${PORT}`)
);

const io = socketIo(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.of("/chat").on("connection", (socket) => {
  socket.on("joinRoom", (clubId) => {
    // Join the specific room based on the clubId
    socket.join(clubId);
    console.log(`Socket joined room: ${clubId}`);
  });

  socket.on("chatMessage", (receivedClubId, message) => {
    console.log(`Received message: ${message} in room: ${receivedClubId}`);
    // Emit the message to the specific room based on the clubId
    io.of("/chat").to(receivedClubId).emit("message", message, receivedClubId);
  });
  socket.on("error", (err) => {
    console.log("backend error ", err);
  });

  socket.on("disconnect", (ev) => {
    console.log("Socket disconnected", ev);
  });
});

//  Turf booking socket
let onBooking = {};

io.of("/booking").on("connection", (socket) => {
  socket.on("joinBooking", (turfId) => {
    // Join the specific room based on the turfId
    socket.join(turfId);
    io.of("/booking").to(turfId).emit("message", turfId, onBooking[turfId]);
    console.log(`Socket joined room: ${turfId}`);
  });

  socket.on("updateBooking", (receivedturfId, date, slot, user) => {
    if (!Object.keys(onBooking).includes(receivedturfId))
      onBooking[receivedturfId] = {};

    if (!onBooking[receivedturfId][date])
      onBooking[receivedturfId][date] = [{ slot: slot, user: user }];
    else onBooking[receivedturfId][date].push({ slot, user });

    console.log(`booking slot, ${slot}, on ${date} in: ${receivedturfId}`);
    console.log(onBooking);

    // Emit the message to the specific room based on the turfId
    io.of("/booking")
      .to(receivedturfId)
      .emit("message", receivedturfId, onBooking[receivedturfId]);
  });

  socket.on("removeBooking", (receivedturfId, date, slot, user) => {
    onBooking[receivedturfId][date].splice(
      onBooking[receivedturfId][date].indexOf({ slot, user }),
      1
    );

    
    // Emit the message to the specific room based on the turfId
    io.of("/booking")
      .to(receivedturfId)
      .emit("message", receivedturfId, onBooking[receivedturfId]);
  });

  socket.on("error", (err) => {
    console.log("backend error ", err);
  });

  socket.on("disconnect", (ev) => {
    console.log("Socket disconnected", ev);
  });
});
