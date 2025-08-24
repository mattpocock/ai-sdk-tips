import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { MyMessage } from '../api/chat.ts';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch pb-48">
      {props.children}
    </div>
  );
};

export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyMessage['parts'];
}) => {
  const prefix = role === 'user' ? 'User: ' : 'AI: ';

  const text = parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }
      return '';
    })
    .join('');
  return (
    <div className="prose prose-invert my-6">
      <ReactMarkdown>{prefix + text}</ReactMarkdown>
    </div>
  );
};

export const ChatInput = ({
  input,
  onChange,
  onSubmit,
  suggestions,
}: {
  input: string;
  onChange: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  suggestions: string[] | undefined;
}) => (
  <form
    onSubmit={onSubmit}
    className="fixed bottom-0 mb-8 max-w-md w-full"
  >
    <div className="flex flex-col gap-2 items-start">
      {suggestions && (
        <div className="space-y-2 ">
          {suggestions.filter(Boolean).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="text-xs text-gray-400 text-left bg-gray-800 px-3 py-1 rounded block min-w-0"
              onClick={() => onChange(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <input
        className="w-full p-2 border-2 border-gray-700 rounded shadow-xl bg-gray-800"
        value={input}
        placeholder="Say something..."
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  </form>
);
