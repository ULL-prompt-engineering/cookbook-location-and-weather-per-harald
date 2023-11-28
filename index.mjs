import deb from "./deb.mjs";
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
    messages.push([{ "role": "user", "content": userInput }]);
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        functions: functionDefinitions,
    });
    console.log(deb(response));
}

await agent("Where am I located right now?");

