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
const client = (0, redis_1.createClient)();
client.on("error", (err) => console.error("Redis Client Error: ", err));
const PORT = 3000;
// Mocked User Database
const userDatabase = {
    1: { id: 1, name: "Nithin", age: 35 },
    2: { id: 2, name: "Akhil", age: 30 },
    3: { id: 3, name: "KJ", age: 39 },
    4: { id: 4, name: "JK", age: 19 },
    5: { id: 5, name: "Arjun", age: 18 },
    6: { id: 6, name: "Rahul", age: 19 },
    7: { id: 7, name: "Ram", age: 17 },
    8: { id: 8, name: "Charan", age: 56 },
    9: { id: 9, name: "Karthik", age: 42 },
    10: { id: 10, name: "Krish", age: 35 },
};
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Redis Connected");
        }
        catch (err) {
            console.log("Failed to Connect Redis: ", err);
        }
    });
}
app.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const cachedUser = yield client.get(`user:${userId}`);
        if (cachedUser) {
            console.log("Cache Hit...");
            return res.json({
                data: JSON.parse(cachedUser),
            });
        }
        console.log("Cache Miss...");
        // If cache is missed, get from DB, so DB call...
        // Simulating DB call...
        const user = userDatabase[userId];
        if (!user) {
            return res.status(404).json({
                error: "User not Found",
            });
        }
        yield client.setEx(`user:${userId}`, 60, JSON.stringify(user)); // setEx, means to set expiry...
        return res.json({
            data: user,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectRedis();
    console.log(`Server is Up at http://localhost:${PORT}`);
}));
