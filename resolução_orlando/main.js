import express from "express";

import DesafioRoutes from "./routes/desafio_Route.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/", DesafioRoutes);

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
