// Tiny event bus so any button on the page can open the agent, optionally with a prompt.
export const AGENT_OPEN = "agent:open";

export function openAgent(prompt?: string) {
  window.dispatchEvent(new CustomEvent(AGENT_OPEN, { detail: { prompt: prompt ?? "" } }));
}
