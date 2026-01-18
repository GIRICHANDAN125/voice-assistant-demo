import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import qaRoutes from "./routes/qaRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", qaRoutes);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
