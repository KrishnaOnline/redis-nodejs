import express, { Request, Response } from "express";
import { createClient } from "redis";

const app = express();
// for Redis Cloud...
// const client = createClient({ 
//     url: "redis://[username:password@]host:port[/db-number]" 
// });
const client = createClient();

client.on("error", (err) => console.error("Redis Client Error: ", err));

const PORT = 3000;

// Mocked User Database
const userDatabase:{[key:string]:{id:number, name:string, age:number}} = {
    1: {id: 1, name: "Nithin", age: 35},
    2: {id: 2, name: "Akhil", age: 30},
    3: {id: 3, name: "KJ", age: 39},
    4: {id: 4, name: "JK", age: 19},
    5: {id: 5, name: "Arjun", age: 18},
    6: {id: 6, name: "Rahul", age: 19},
    7: {id: 7, name: "Ram", age: 17},
    8: {id: 8, name: "Charan", age: 56},
    9: {id: 9, name: "Karthik", age: 42},
    10: {id: 10, name: "Krish", age: 35},
}

async function connectRedis():Promise<void> {
    try {
        await client.connect();
        console.log("Redis Connected");
    } catch(err) {
        console.log("Failed to Connect Redis: ", err);
    }
}

app.get("/user/:id", async (req: Request, res: Response) => {
    const userId = req.params.id;
    try {
        const cachedUser = await client.get(`user:${userId}`);
        if(cachedUser) {
            console.log("Cache Hit for userId: ", userId);
            return res.json({
                data: JSON.parse(cachedUser),
            })
        }
        console.log("Cache Miss for userId: ", userId);
        // If cache is missed, get from DB, so DB call...
        // Simulating DB call...
        const user = userDatabase[userId];
        if(!user) {
            return res.status(404).json({
                error: "User not Found",
            })
        }
        await client.setEx(`user:${userId}`, 60, JSON.stringify(user));   // setEx, means to set expiry...
        return res.json({
            data: user,
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
        })
    }
})

app.listen(PORT, async () => {
    await connectRedis();
    console.log(`Server is Up at http://localhost:${PORT}`);
})