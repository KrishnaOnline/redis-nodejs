import express from "express";
import { createClient } from "redis";

const app = express();
app.use(express.json());

const client = createClient();
const subscriber = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

app.post("/submit", async (req, res) => {
	const {problemId, code, language} = req.body;

	try {
		await client.lPush(
			"problems",
			JSON.stringify({ code, language, problemId })
		);
		// Store in the database
		res.status(200).send("Submission received and stored.");
	} catch(error) {
		console.error("Redis error:", error);
		res.status(500).send("Failed to store submission.");
	}
});

async function startServer() {
	try {
		await client.connect();
		console.log("Connected to Redis (client)");

        await subscriber.connect();
        console.log("Connected to Redis (subscriber)")
        
        // Subscrbing to "problem_done" channel...
        await subscriber.subscribe("problem_done", (message) => {
            const data = JSON.parse(message);
            console.log("Problem Done: ", data);
        })

		app.listen(3000, () => {
			console.log("Server is running on port 3000");
		});
	} catch(error) {
		console.error("Failed to connect to Redis", error);
	}
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