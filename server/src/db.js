import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let memory;

export async function connectDb() {
  memory = await MongoMemoryServer.create();
  const uri = memory.getUri();
  await mongoose.connect(uri);
  console.log("[db] in-memory MongoDB ready");
}

export async function stopDb() {
  await mongoose.disconnect();
  if (memory) await memory.stop();
}
