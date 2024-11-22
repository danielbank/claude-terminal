# anthropod

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.36. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```

const weatherTool: Tool = {
  name: "getWeather",
  description: "Get the current weather in a given location",
  input_schema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city and state, e.g. San Francisco, CA",
      },
      unit: {
        type: "string",
        enum: ["celsius", "fahrenheit"],
        description:
          "The unit of temperature, either 'celsius' or 'fahrenheit'",
      },
    },
    required: ["location"],
  },
};

const tools: Tool[] = [weatherTool];

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { request } = await req.json();

    const messages = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      system:
        "You are a Terminal UI Assistant.  The user will ask you in plain English to perform a task in the terminal.  You will respond with a valid bash command that can be executed to achieve the desired result.",
      tools,
      messages: [
        {
          role: "user",
          content: request,
        },
      ],
    });

    if (messages.stop_reason === "tool_use") {
      // Get the weather

      const location = messages.content.filter((m) => m.type === "tool_use")[0]
        .input?.location;

      const response = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${location}&aqi=no`
      );

      if (!response.ok) {
        return new Response("Failed to get weather data", {
          status: response.status,
        });
      }

      const weather = await response.json();

      const currentTemp = weather.current.temp_c;

      console.log(`Current temperature in ${location}: ${currentTemp}°F`);

      return new Response(
        `The current temperature in ${location} is ${currentTemp}°F`
      );
    }

    return new Response("Hello, world!");
  },
});

console.log(`Server started at http://localhost:${PORT}`);

```
