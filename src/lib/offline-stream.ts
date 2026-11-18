// Streams a reply from the deterministic offline responder.
// Used by the agent when Gemini is missing, errors or times out, and by the browser when the agent is unreachable.
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage, type UIMessageStreamWriter } from "ai";
import { offlineReply } from "./offline-agent";

export function lastUserText(messages: UIMessage[]) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return (
    last?.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join(" ")
      .trim() ?? ""
  );
}

// Writes the offline answer (text, then the matching tool card) into an open UI message stream.
export async function writeOfflineReply(writer: UIMessageStreamWriter, messages: UIMessage[], prefix = "") {
  const reply = offlineReply(lastUserText(messages));
  const id = `offline-text-${Date.now()}`;
  const text = prefix + reply.text;
  writer.write({ type: "text-start", id });
  const words = text.split(/(\s+)/);
  for (let i = 0; i < words.length; i += 6) {
    writer.write({ type: "text-delta", id, delta: words.slice(i, i + 6).join("") });
    await new Promise((r) => setTimeout(r, 18));
  }
  writer.write({ type: "text-end", id });
  if (reply.tool) {
    const toolCallId = `offline-${reply.tool.name}-${Date.now()}`;
    writer.write({ type: "tool-input-available", toolCallId, toolName: reply.tool.name, input: reply.tool.input });
    writer.write({ type: "tool-output-available", toolCallId, output: reply.tool.output });
  }
}

export function offlineStreamResponse(messages: UIMessage[], headers?: HeadersInit) {
  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: "start" });
      await writeOfflineReply(writer, messages);
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({ stream, headers });
}
