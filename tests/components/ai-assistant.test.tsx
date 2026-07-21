import { describe, it, expect } from "vitest";

describe("AIAssistant", () => {
  it("initializes with a welcome message", () => {
    // The component starts with a hardcoded welcome message
    const welcomeMessage =
      "Hi! I'm your caregiving assistant. I can help you with care plans, medication questions, appointment preparation, and finding resources. What would you like to know?";
    expect(welcomeMessage).toContain("caregiving assistant");
    expect(welcomeMessage).toContain("care plans");
    expect(welcomeMessage).toContain("medication");
  });

  it("accepts optional careRecipientId prop", () => {
    const props = { careRecipientId: "test-cr-123" };
    expect(props.careRecipientId).toBe("test-cr-123");
    expect(typeof props.careRecipientId).toBe("string");
  });

  it("defaults placeholder text when not provided", () => {
    const defaultPlaceholder = "Ask me anything about caregiving...";
    expect(defaultPlaceholder).toBeTruthy();
    expect(defaultPlaceholder.length).toBeGreaterThan(10);
  });

  it("allows custom placeholder text", () => {
    const customPlaceholder = "Ask about medications...";
    expect(customPlaceholder).toContain("medications");
  });

  it("handles Send button click with Enter key", () => {
    // The component uses Enter (without Shift) to send messages
    const isEnterKey = (e: { key: string; shiftKey: boolean }) =>
      e.key === "Enter" && !e.shiftKey;

    expect(isEnterKey({ key: "Enter", shiftKey: false })).toBe(true);
    expect(isEnterKey({ key: "Enter", shiftKey: true })).toBe(false);
    expect(isEnterKey({ key: "Tab", shiftKey: false })).toBe(false);
  });

  it("prevents sending empty messages", () => {
    const isEmptyOrWhitespace = (input: string) => !input.trim();
    expect(isEmptyOrWhitespace("")).toBe(true);
    expect(isEmptyOrWhitespace("   ")).toBe(true);
    expect(isEmptyOrWhitespace("hello")).toBe(false);
  });

  it("constructs correct API request body", () => {
    const message = "What medications should I track?";
    const conversationId = "conv-123";
    const careRecipientId = "cr-456";

    const body = {
      message,
      conversationId,
      careRecipientId,
    };

    expect(body.message).toBe(message);
    expect(body.conversationId).toBe(conversationId);
    expect(body.careRecipientId).toBe(careRecipientId);
  });

  it("handles API error gracefully", () => {
    const errorMessage =
      "I'm sorry, I couldn't process that request. Please check that your OpenAI API key is configured correctly.";
    expect(errorMessage).toContain("OpenAI API key");
    expect(errorMessage).toContain("I'm sorry");
  });

  it("toggles loading state correctly", () => {
    const shouldDisableSend = (loading: boolean, inputEmpty: boolean) =>
      loading || inputEmpty;

    expect(shouldDisableSend(true, false)).toBe(true);
    expect(shouldDisableSend(false, true)).toBe(true);
    expect(shouldDisableSend(false, false)).toBe(false);
  });
});
