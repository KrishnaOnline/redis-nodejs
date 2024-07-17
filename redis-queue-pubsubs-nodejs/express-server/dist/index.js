"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const client = (0, redis_1.createClient)();
const subscriber = (0, redis_1.createClient)();
client.on("error", (err) => console.log("Redis Client Error", err));
app.post("/submit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { problemId, code, language } = req.body;
    try {
        yield client.lPush("problems", JSON.stringify({ code, language, problemId }));
        // Store in the database
        res.status(200).send("Submission received and stored.");
    }
    catch (error) {
        console.error("Redis error:", error);
        res.status(500).send("Failed to store submission.");
    }
}));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Connected to Redis (client)");
            yield subscriber.connect();
            console.log("Connected to Redis (subscriber)");
            // Subscrbing to "problem_done" channel...
            yield subscriber.subscribe("problem_done", (message) => {
                const data = JSON.parse(message);
                console.log("Problem Done: ", data);
            });
            app.listen(3000, () => {
                console.log("Server is running on port 3000");
            });
        }
        catch (error) {
            console.error("Failed to connect to Redis", error);
        }
    });
}
startServer();
// import express from "express";
// import {createClient} from "redis";
// const app = express();
// app.use(express.json());
// const client = createClient();
// client.connect();
// app.get("/", (req, res) => {
//     res.send("Server is Up and Running...");
// })
// app.post("/submit", async (req, res) => {
//     const {problemId, userId, code, language} = req.body;
//     // actually, need to push this to DB...
//     // use try-catch here...
//     try {
//         await client.lPush("submissions", JSON.stringify({problemId, userId, code, language}));
//         res.json({
//             message: "Submission Recieved :)",
//         })
//     } catch(err) {
//         res.json({
//             error: "Error"+err,
//             message: "Submission Failed :(",
//         })
//     }
// })
// app.listen(3000, () => {
//     console.log("Server started at: http://localhost:3000");
// })
