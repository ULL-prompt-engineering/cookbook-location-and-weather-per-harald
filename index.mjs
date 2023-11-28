import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });

async function getLocation() {
    const response = await fetch("https://ipapi.co/json/");
    const locationData = await response.json();
    return locationData;
}

async function getCurrentWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
    const response = await fetch(url);
    const weatherData = await response.json();
    return weatherData;
}

const functionDefinitions = [
    {
        name: "getCurrentWeather",
        description:
            "Get the current weather in a given location given in latitude and longitude",
        parameters: {
            type: "object",
            properties: {
                latitude: {
                    type: "string",
                },
                longitude: {
                    type: "string",
                },
            },
            required: ["longitude", "latitude"],
        },
    },
    {
        name: "getLocation",
        description: "Get the user's location based on their IP address",
        parameters: {
            type: "object",
            properties: {},
        },
    },
];

const availableFunctions = {
    getCurrentWeather,
    getLocation,
};

const messages = [
    {
        role: "system",
        content: `You are a helpful assistant. Only use the functions you have been provided with.`,
    },
];

async function agent(userInput) {
    messages.push({
        role: "user",
        content: userInput,
    });

    for (let i = 0; i < 5; i++) {
        const response = await openai.chat.completions.create({
            //model: "gpt-3.5-turbo-1106",
            model: "gpt-3.5-turbo-16k", // Currently points to gpt-3.5-turbo-0613. Will point to gpt-3.5-turbo-1106 starting Dec 11, 2023.
            //model: "gpt-4",
            //model: "gpt-3.5-turbo-instruct", // gpt-3.5-turbo-instruct	Similar capabilities as text-davinci-003 but compatible with legacy Completions endpoint and not Chat Completions.
            // model: "text-davinci-003", // does not support chat completions API
            messages: messages,
            functions: functionDefinitions,
        });

        const { finish_reason, message } = response.choices[0];

        if (finish_reason === "function_call") {
            const functionName = message.function_call.name;
            const functionToCall = availableFunctions[functionName];
            const functionArgs = JSON.parse(message.function_call.arguments);
            const functionArgsArr = Object.values(functionArgs);
            const functionResponse = await functionToCall.apply(
                null,
                functionArgsArr
            );

            messages.push({
                role: "function",
                name: functionName,
                content: `
                The result of the last function was this: ${JSON.stringify(
                    functionResponse
                )}
                `,
            });
        } else if (finish_reason === "stop") {
            messages.push(message);
            return message.content;
        }
    }
    return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";
}

const response = await agent(
    "Please suggest some activities based on my location and the weather."
);

console.log("response:", response);