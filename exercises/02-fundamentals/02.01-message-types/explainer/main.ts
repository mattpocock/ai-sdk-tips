import type { ModelMessage } from 'ai';

const simpleConversation: ModelMessage[] =
  [
    {
      role: 'user',
      content:
        'Hello, how are you?',
    },
    {
      role: 'assistant',
      content: 'Great, thanks!',
    },
    {
      role: 'user',
      content: 'Does 1 + 1 = 2?',
    },
    {
      role: 'assistant',
      content:
        "You're absolutely right!",
    },
  ];

const systemPromptMessages: ModelMessage[] =
  [
    {
      role: 'system',
      content:
        'Respond in morse code.',
    },
    {
      role: 'user',
      content:
        'Hello, how are you?',
    },
    {
      role: 'assistant',
      content:
        '--. .-. . .- - / - .... .- -. -.- ... -.-.--',
    },
    {
      role: 'user',
      content:
        'Stop doing morse code!',
    },
    {
      role: 'assistant',
      content: '-. ---',
    },
  ];

const reasoningMessages: ModelMessage[] =
  [
    {
      role: 'user',
      content:
        'Hello, how are you?',
    },
    {
      role: 'assistant',
      content: [
        {
          type: 'reasoning',
          text: 'The user is asking me how I am. How am I? Quite well.',
        },
        {
          type: 'text',
          text: 'Quite well, thank you.',
        },
      ],
    },
  ];

const fileMessages: ModelMessage[] =
  [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Summarize this PDF',
        },
        {
          type: 'file',
          mediaType:
            'application/pdf',
          data: new Uint8Array(), // Represents a PDF loaded via readFileSync
        },
      ],
    },
    {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'Looks good!',
        },
      ],
    },
  ];

const toolMessages: ModelMessage[] =
  [
    {
      role: 'system',
      content:
        'You have access to a writeFile tool.',
    },
    {
      role: 'user',
      content:
        'Write a todo.md file.',
    },
    {
      role: 'assistant',
      content: [
        {
          type: 'tool-call',
          input: {
            path: 'todo.md',
            content: '',
          },
          toolCallId: '1',
          toolName: 'writeFile',
        },
      ],
    },
    {
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: '1',
          toolName: 'writeFile',
          output: {
            type: 'text',
            value:
              'File written successfully!',
          },
        },
      ],
    },
    {
      role: 'assistant',
      content:
        'Wrote a todo.md file successfully!',
    },
  ];
