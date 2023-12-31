# How to build an agent with the Node.js SDK

**This tutorial does not make use of the new beta assistants API but it uses the chat completions API**.

[Models you can use](https://platform.openai.com/docs/models/gpt-3-5) for this tutorial:

- model: "gpt-3.5-turbo-1106". The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens.
- model: "gpt-3.5-turbo-16k". Currently points to gpt-3.5-turbo-0613. Will point to gpt-3.5-turbo-1106 starting Dec 11, 2023.
- model: "gpt-4". Improved function calling support
- model: "gpt-4-vision-preview". Ability to understand images, in addition to all other GPT-4 Turbo capabilties. Returns a maximum of 4,096 output tokens. This is a preview model version and not suited yet for production traffic

Start reading the branch [simple-input](https://github.com/ULL-prompt-engineering/cookbook-location-and-weather-per-harald/tree/simple-input) of this repository.

## References

* [How to build an agent with the Node.js SDK](https://cookbook.openai.com/examples/how_to_build_an_agent_with_the_node_sdk) by Per Harald Borgen at <https://cookbook.openai.com/> Oct 2023
  * See [openai/openai-cookbook/blob/main/examples/](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_build_an_agent_with_the_node_sdk.mdx) at GitHub
* [scrimba.com](https://scrimba.com/) a platform for learning development
* The app can run in the browser, so you only need a code editor and, e.g., VS Code Live Server to follow along locally. Alternatively, you can write your code directly in the browser via [this code playground at Scrimba](https://scrimba.com/scrim/c6r3LkU9) (Scrimba is a platform for learning development).
* If you prefer watching screencasts over reading, then you can check out [this video, which walks through the code line-by-line](https://scrimba.com/scrim/co0044b2d9b9b7f5bf16e0391) which explains the initial version of the code.

## Introduction

Prompt Engineers [can now](https://openai.com/blog/function-calling-and-other-api-updates) use models like `gpt-4-0613` and `gpt-3.5-turbo-0613` to describe the signature of functions. These models have been fine-tuned to identify when a function call is needed based on user input and to produce JSON that matches the function's signature. This allows for more reliable retrieval of structured data. 

Examples include 

- turning a request to email someone into a `send_email` function call or 
- converting a question about the weather into a `get_current_weather` function call
- a query about top customers can be transformed into an API call like `get_customers_by_revenue`
- a question about a company's orders into a SQL query
- book tickets on behalf of your users
  
In this tutorial, we will build an app that uses OpenAI functions along using the Node.js SDK: 

```
✗ npm ls openai
cookbook-location-and-weather-per-harald@1.0.0 /Users/casianorodriguezleon/campus-virtual/2223/learning/openai-learning/assistant-api/cookbook-location-and-weather-per-harald
└── openai@4.20.1
```

## What you will build

Our app is a simple agent that helps you find activities in your area.
It has access to two functions, 

- `getLocation()` and 
- `getCurrentWeather(latitude, longitude)`.
  
which means it can figure out where you’re located and what the weather
is at the moment.

**The LLM doesn't execute any code for you. It just tells your app which functions it should use in a given scenario, and then leaves it up to your app to invoke them**.

Once our agent knows your location and the weather, it'll use GPT’s
internal knowledge to suggest suitable local activities for you.

## Importing the SDK and authenticating with OpenAI

We start by importing the OpenAI SDK at the top of our JavaScript file and authenticate with our API key, which we have stored as an environment variable.

```js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

## Creating our two functions

Next, we'll create the two functions. The first one - `getLocation` -
uses the [IP API](https://ipapi.co/) to get the location of the
user.

```js
async function getLocation() {
  const response = await fetch("https://ipapi.co/json/");
  const locationData = await response.json();
  return locationData;
}
```

The IP API returns a bunch of data about your location, including your
latitude and longitude, which we’ll use as arguments in the second
function `getCurrentWeather`. It uses the [Open Meteo
API](https://open-meteo.com/) to get the current weather data, like
this:

```js
async function getCurrentWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
  const response = await fetch(url);
  const weatherData = await response.json();
  return weatherData;
}
```

## Describing our functions for OpenAI

For OpenAI to understand the purpose of these functions, we need to
describe them using a specific schema. We'll create an array called
`functionDefinitions` that contains one object per function. Each object
will have three keys: `name`, `description`, and `parameters`.

```js
const functionDefinitions = [
  {
    name: "getCurrentWeather",
    description: "Get the current weather in a given location",
    parameters: {
      type: "object",
      properties: {
        longitude: {
          type: "string",
        },
        latitude: {
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
```

Search the  documentation at [/api-reference/assistants/object](https://platform.openai.com/docs/api-reference/assistants/object). Inside the `parameters` section says:

> To describe a function that accepts no parameters, provide the value `{"type": "object", "properties": {}}` which is what we are doing here for `getLocation()`.

## Setting up the messages array

We also need to define a `messages` array. This will keep track of all of the messages back and forth between our app and OpenAI.

The first object in the array should always have the `role` property set to `"system"`, which tells OpenAI that this is how we want it to behave.

```js
const messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Only use the functions you have been provided with.",
  },
];
```

## Creating the agent function

We are now ready to build the logic of our app, which lives in the
`agent` function. It is asynchronous and takes one argument: the
`userInput`.

We start by pushing the `userInput` to the messages array. This time, we set the `role` to `"user"`, so that OpenAI knows that this is the input from the user.

```js
async function agent(userInput) {
  messages.push([
    {
      role: "user",
      content: userInput,
    },
  ]);
 
  const response = await openai.chat.completions.create({
    model: models[0], 
    messages: messages,
    functions: functionDefinitions,
  });
  console.log(response);
}
```

Next, we'll send a request to the Chat completions endpoint via the
`chat.completions.create()` method in the Node SDK. This method takes a
configuration object as an argument. In it, we'll specify three
properties:

- `model` - Decides which AI model we want to use. One supporting Chat Completions like
    "gpt-3.5-turbo-16k",   "gpt-3.5-turbo-1106", "gpt-4"
- `messages` - The entire history of messages between the user and the
  AI up until this point. Messages must be an array of message objects, where each object has a role (either "`system`", "`user`", or "`assistant`") and `content`. 
  Conversations can be as short as one message or many back and forth turns.
- `functions` - A description of the functions our app has access to.
  Here, we'll we use the `functionDefinitions` array we created
  earlier.

See [the full API reference documentation for the Chat API](https://platform.openai.com/docs/api-reference/chat)

## Running our app with a simple input

Let's try to run the `agent` with an input that requires a function call to give a suitable reply.

```js
agent("Where am I located right now?");
```

When we run the code above, we see the response from OpenAI logged out
to the console like this:

```
➜  cookbook-location-and-weather-per-harald git:(simple-input) node index.mjs 
```
```js
response: {
  id: 'chatcmpl-8PvIJavoe15J1swANh6jY58XwXH0Y',
  object: 'chat.completion',
  created: 1701189131,
  model: 'gpt-3.5-turbo-16k-0613',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: null,
        function_call: { name: 'getLocation', arguments: '{}' }
      },
      finish_reason: 'function_call'
    }
  ],
  usage: { prompt_tokens: 99, completion_tokens: 6, total_tokens: 105 }
}
```

This response tells us that we should call one of our functions, as it contains the following key: `finish:_reason: "function_call"`.

The name of the function can be found in the
`response.choices[0].message.function_call.name` key, which is set to
`"getLocation"`.

## Turning the OpenAI response into a function call

If you are in the `simple-input` branch, you can switch now to the [function-call branch](https://github.com/ULL-prompt-engineering/cookbook-location-and-weather-per-harald/tree/function-call) of this repository to see the how the code follows.

Now that we have the name of the function as a string, we'll need to
translate that into a function call. To help us with that, we'll gather
both of our functions in an object called `availableFunctions`:

```js
const availableFunctions = {
  getCurrentWeather,
  getLocation,
};
```

This is handy because we'll be able to access the `getLocation` function
via bracket notation and the string we got back from OpenAI, like this:
`availableFunctions["getLocation"]`.

```js
async function agent(userInput) {
    messages.push({
        role: "user",
        content: userInput,
    });

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k", // "gpt-4",
        messages: messages,
        functions: functionDefinitions,
    });
    const { finish_reason, message } = response.choices[0];
 
    if (finish_reason === "function_call") {
      const functionName = message.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(message.function_call.arguments);
      const functionArgsArr = Object.values(functionArgs);
      const functionResponse = await functionToCall.apply(null, functionArgsArr);
      return functionResponse;
    }

    return null;
}
```

Every response will include a `finish_reason`. The possible values for `finish_reason` are:

- `stop`: API returned complete message, or a message terminated by one of the stop sequences provided via the [stop](https://platform.openai.com/docs/api-reference/chat/create#chat/create-stop) parameter
- `length`: Incomplete model output due to [max_tokens](https://platform.openai.com/docs/api-reference/chat/create#chat/create-max_tokens) parameter or token limit
- `function_call`: The model decided to call a function
- `content_filter`: Omitted content due to a flag from OpenAI content filters
- `null`: API response still in progress or incomplete

Depending on input parameters, the model response may include different information.

We're also using the `message` object from `response.choices[0]`. It will look like this:

```js
{
  role: 'assistant',
  content: null,
  function_call: {
    name: 'getCurrentWeather',
    arguments: '{\n"latitude": "28.4803712",\n"longitude": "-16.315"\n}'
  }
}
```

for grabbing ahold of any arguments the LLM wants us to pass into
the function: `message.function_call.arguments`.

However, we won't need any arguments for this first function call.

If we run the code again with the same input
```js
const response = await agent("Where am I located right now?");
console.log("Chosen function:", deb(response));
```

we'll see that `functionResponse` is an object filled with location about where the user is located right now. In my case, that is San Cristobal de La Laguna, Spain.

```
➜  cookbook-location-and-weather-per-harald git:(function-call) ✗ node index.mjs
```
```js
Chosen function: {
  ip: '193.145.124.209',
  network: '193.145.124.128/25',
  version: 'IPv4',
  city: 'San Cristóbal de La Laguna',
  region: 'Canary Islands',
  region_code: 'CN',
  country: 'ES',
  country_name: 'Spain',
  country_code: 'ES',
  country_code_iso3: 'ESP',
  country_capital: 'Madrid',
  country_tld: '.es',
  continent_code: 'EU',
  in_eu: true,
  postal: '38108',
  latitude: 28.4657,
  longitude: -16.3086,
  timezone: 'Atlantic/Canary',
  utc_offset: '+0000',
  country_calling_code: '+34',
  currency: 'EUR',
  currency_name: 'Euro',
  languages: 'es-ES,ca,gl,eu,oc',
  country_area: 504782,
  country_population: 46723749,
  asn: 'AS766',
  org: 'Entidad Publica Empresarial Red.es'
}
```

We'll add this data to a new item in the `messages` array, where we also
specify the name of the function we called.

```js
...
const functionResponse = await functionToCall.apply(null, functionArgsArr);
messages.push({
  role: "function",
  name: functionName,
  content: `The result of the last function was this: ${JSON.stringify(
    functionResponse
  )}
  `,
});
```

At this point you can return to the [function-call branch]([function-call branch](https://github.com/ULL-prompt-engineering/cookbook-location-and-weather-per-harald/tree/function-call)) of this repository to see the incoming code.

Notice that the `role` is set to `"function"`. This tells OpenAI
that the `content` parameter **contains the result of the function call**
and not the input from the user.

At this point, we need to send a new request to OpenAI with this updated
`messages` array. 

Our agent is going to need to go back and forth between itself and
GPT several times until the LLM  finds the final answer.

This can be solved in several different ways, e.g. 

- recursion, 
- a while-loop, or 
- a for-loop. 

We'll use a good old for-loop for the sake of
simplicity.

## Creating the loop question-function tool-new question

Switch now to the [main branch](https://github.com/ULL-prompt-engineering/cookbook-location-and-weather-per-harald/tree/main).

At the top of the `agent` function, we'll create a loop that lets us run
the entire procedure up to five times.

If we get back `finish_reason: "function_call"` from GPT, we'll just
push the result of the function call to the `messages` array and jump to
the next iteration of the loop, triggering a new request.

If we get `finish_reason: "stop"` back, then GPT has found a suitable
answer, so we'll return the function and cancel the loop.

```js
let round = 0;
let maxConversationRounds = 5;
async function agent(userInput) {
    messages.push({ role: "user", content: userInput, });

    for (round = 0; round < maxConversationRounds; round++) {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k", // Currently points to gpt-3.5-turbo-0613. Will point 
            messages: messages,
            functions: functionDefinitions,
        });

        const { finish_reason, message } = response.choices[0];

        if (finish_reason === "function_call") {
            const functionName = message.function_call.name;
            const functionToCall = availableFunctions[functionName];
            const functionArgs = JSON.parse(message.function_call.arguments);
            const functionArgsArr = Object.values(functionArgs);
            const functionResponse = await functionToCall.apply(null, functionArgsArr);
            console.error(`${functionName}(${functionArgsArr})`)

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
    return `The maximum number of iterations ${maxConversationRounds} has been met without a suitable answer
${deb(messages)}. 
Please try again with a more specific input.`;
}
```

If we don't see a `finish_reason: "stop"` within our `maxConversationRounds` iterations,
we'll return a message saying we couldn’t find a suitable answer.

## Running the final app

At this point, we are ready to try our app! I'll ask the agent to
suggest some activities based on my location and the current weather.

```js
const response = await agent(
  "Please suggest some activities based on my location and the current weather."
);
console.log(response);
```

Here's what we see in the console:

```
➜  cookbook-location-and-weather-per-harald git:(main) node index.mjs 
response: Based on your location in San Cristóbal de La Laguna in the Canary Islands, Spain and the current weather, here are some activity suggestions:

1. Explore the historical sites: San Cristóbal de La Laguna, a UNESCO World Heritage site, has plenty of architectural gems to admire and historical sites to visit. Visit the 16th century Cathedral of La Laguna or enjoy a stroll in the city's old town. 

2. Go for a hike: The weather is rather pleasant, providing the perfect conditions for a hike. Visit the nearby Anaga Rural Park for its beautiful and scenic hiking trails.

3. Visit a museum: If you're more into indoor activities, the Museum of Science and the Cosmos would be an interesting visit. 

4. Enjoy local cuisine: With an abundance of restaurants and cafes around, it's a good time to sample some local Spanish and Canary Islands cuisine. 

5. Relax on the beach: Though it's not too hot, the temperature is still pleasant enough to visit the local beaches like Las Teresitas.

Remember to adhere to public health guidelines if you go out. Enjoy your time!
```

If we peak under the hood, and log out `response.choices[0].message` in
each iteration of the loop, we'll see that GPT has instructed us to use
both our functions before coming up with an answer.

First, it tells us to call the `getLocation` function. Then it tells us
to call the `getCurrentWeather` function with
`"longitude": "-16.3", "latitude": "28.5"` passed in as the
arguments. This is data it got back from the first function call we did.

```js
{role: "assistant", content: null, function_call: {name: "getLocation", arguments: "{}"}}
{role: "assistant", content: null, function_call: {name: "getCurrentWeather", arguments: " { "longitude": "-16.3", "latitude": "28.5" }"}}
```

If you're looking for an extra challenge, consider enhancing this app. For example, you could add a function that fetches up-to-date information on events and activities in the user's location. See for instance <https://docs.predicthq.com/getting-started/api-quickstart>


See the code at [main branch](https://github.com/ULL-prompt-engineering/cookbook-location-and-weather-per-harald/tree/main) in repo `ULL-prompt-engineering/cookbook-location-and-weather-per-harald` at GitHub.