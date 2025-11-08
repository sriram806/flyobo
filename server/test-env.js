import "dotenv/config";
import { MONGO_URI } from "./config/env.js";

console.log("MONGO_URI from config/env.js:", MONGO_URI);
console.log("MONGO_URI from process.env:", process.env.MONGO_URI);