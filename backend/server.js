import dotenv from "dotenv";
dotenv.config();
import express from "express"
//const connectDB = require('./config/db');
import cors from "cors"
import routes from "./src/routes/index.js";
const app = express();
import mongoose from "mongoose";
//connectDB();
app.use(cors());
app.use(express.json());
//app.use('/api', require('./routes/auth'));
app.use("/api", routes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Make io accessible globally or export it
export { io };

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// Server restarted to clear EADDRINUSE