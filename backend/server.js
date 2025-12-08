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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));