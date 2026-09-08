import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDb } from "./db.js";
import { api } from "./routes.js";
import { seed } from "./seed.js";
import { buildSnapshot, startSimulation } from "./simulation.js";

const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use("/api", api);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true },
});

io.on("connection", async (socket) => {
  socket.emit("network:update", await buildSnapshot());
});

await connectDb();
await seed();
startSimulation(io);

server.listen(PORT, () => {
  console.log(`[server] http://127.0.0.1:${PORT}`);
});
