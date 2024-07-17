import { createClient } from "redis";
const client = createClient();

async function processSubmission(submission: string) {
	const { problemId, code, language } = JSON.parse(submission);
	console.log(`Processing submission for problemId ${problemId}...`);
	console.log(`Code: ${code}`);
	console.log(`Language: ${language}`);
	// Here you would add your actual processing logic
	// Simulate processing delay
	await new Promise((resolve) => setTimeout(resolve, 10000));
	console.log(`Finished processing submission for problemId ${problemId}.\n`);
    // Publishing it to the Redis...
    client.publish("problem_done", JSON.stringify({ problemId, status: "Executed" }));
}

async function startWorker() {
	try {
		await client.connect();
		console.log("Worker connected to Redis.");

		// Main loop
		while(true) {
			try {
				const submission = await client.brPop("problems", 0);
				// @ts-ignore
				await processSubmission(submission.element);
			} catch (error) {
				console.error("Error processing submission:", error);
				// Implement your error handling logic here. For example, you might want to push
				// the submission back onto the queue or log the error to a file.
			}
		}
	} catch(error) {
		console.error("Failed to connect to Redis", error);
	}
}

startWorker();




// import { createClient } from "redis";

// const client = createClient();

// async function main() {
//     await client.connect();
//     while(1) {
//         const response = await client.brPop("submissions", 0);
//         console.log(response);
//         // mocking execution time of the user's code...
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         // Send it to the PubSub...
//         console.log("Processed User Submission");
//     }
// }

// main();
