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

// Serve static files
app.use('/uploads', express.static('uploads'));

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// App Routes
app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// Socket.io Connection Handler
// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // --- WebRTC Signaling ---
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    // Send to the specific user's room
    io.to(`user_${userToCall}`).emit("incomingCall", { signal: signalData, from, name });
  });

  socket.on("answerCall", ({ to, signal }) => {
    io.to(`user_${to}`).emit("callAccepted", signal);
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(`user_${to}`).emit("ice-candidate", candidate);
  });

  socket.on("endCall", ({ to }) => {
    io.to(`user_${to}`).emit("callEnded");
  });
  // ------------------------

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Make io accessible globally or export it
export { io };

const PORT = 4000; // Forced to 4000 to avoid .env override and frontend mismatch
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  // process.exit(1);
});
// Server restarted for microservices callback