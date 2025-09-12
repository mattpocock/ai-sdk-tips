Here's a pattern for validating incoming requests to your LLM application to make sure that they're safe. We're in TypeScript and we're using the AI SDK.

## The Fast Model Approach

The juiciest nugget is inside the `checkIsRequestSafe` function. The idea here is that we use a very, very fast model, in this case Gemini 2.0 Flash Lite.

```ts
const checkIsRequestSafe = async (
  modelMessages: ModelMessage[],
) => {
  const guardrailResult = await generateText({
    model: google('gemini-2.0-flash-lite'),
    system: GUARDRAIL_SYSTEM,
    messages: modelMessages,
  });

  // The text will either be '0' or '1'
  const text = guardrailResult.text.trim();

  // If text is exactly '1', the request is safe.

  if (text === '1') {
    return true;
  }

  return false;
};
```

We pass it all of the messages in the conversation history so far, and we get it to run extremely quickly by only returning a single token. This is done inside the guardrail system prompt.

```ts
## Response Format

Respond with just the number:

1

or

0
```

Because it's just returning a single token, this will run very, very quickly. And it means that we can do some imperative logic here, saying if the text is exactly `1`, then the request is safe, so we can return `true`.

## Alternative Approaches

Lots of folks pointed out in the comments it doesn't have to be `0` or `1`, you can use a single word. Since for the LLM it's actually generating tokens under the hood, numbers.

So it would take exactly the same amount of time for it to generate the word "safe" as it would to generate the word "one", but this is the implementation I landed on and it works pretty well.

## Streaming Text to the Frontend

Next we should look at this `streamTextToWriter` function. It's useful any time that you need to stream any arbitrary text to the front end.

```ts
const streamTextToWriter = (
  writer: UIMessageStreamWriter,
  message: string,
) => {
  const id = crypto.randomUUID();
  writer.write({
    type: 'text-start',
    id,
  });

  writer.write({
    type: 'text-delta',
    id,
    delta: message,
  });

  writer.write({
    type: 'text-end',
    id,
  });
};
```

Here we're streaming three parts, `textStart`, `textDelta` and `textEnd`, all with the same `id`. To be honest it's pretty verbose and I wish the AI SDK would make this a little bit easier, since all we need to do is really stream this message to the frontend.

## Continuing with Normal Streaming

Finally then we continue streaming with the writer and with the model messages.

```ts
const continueStreaming = (
  writer: UIMessageStreamWriter,
  modelMessages: ModelMessage[],
) => {
  const streamTextResult = streamText({
    model: google('gemini-2.0-flash'),
    messages: modelMessages,
  });

  writer.merge(streamTextResult.toUIMessageStream());
};
```

This is a normal `streamText` call where we're merging it into the writer.

## Applications of Fast LLM Responses

This logic of a very, very fast LLM response for the rest of your logic is something that we can map into lots of different use cases:

- We could use this as a router to route certain requests through a smarter LLM
- Or route simple ones to a stupid fast LLM, which would be an amazingly cost-saving measure
