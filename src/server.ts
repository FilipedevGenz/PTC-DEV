import "dotenv/config";
import express from "express";
import routes from "./routes";
import { logger } from "./services/Logger";

const app = express();

app.use(express.json());
app.use(routes);

// Qualquer rota que não existe cai aqui
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

const port = process.env.SERVER_PORT || 3001;

app.listen(port, () => {
  logger.info("Server running", { port });
});
