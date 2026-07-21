import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  getInitials,
  getTimeAgo,
  getStatusColor,
  truncate,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("returns N/A for null", () => {
    expect(formatDate(null)).toBe("N/A");
  });

  it("returns N/A for undefined", () => {
    expect(formatDate(undefined)).toBe("N/A");
  });

  it("formats a Date object", () => {
    const date = new Date(2024, 0, 15);
    const result = formatDate(date);
    expect(result).toContain("15");
  });
});

describe("formatTime", () => {
  it("formats time from date string", () => {
    const result = formatTime("2024-01-15T14:30:00");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns empty string for null", () => {
    expect(formatTime(null)).toBe("");
  });
});

describe("formatDateTime", () => {
  it("formats date and time", () => {
    const result = formatDateTime("2024-01-15T14:30:00");
    expect(result).toContain("at");
  });

  it("returns N/A for null", () => {
    expect(formatDateTime(null)).toBe("N/A");
  });
});

describe("getInitials", () => {
  it("returns initials from first and last name", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
  });

  it("handles missing names", () => {
    expect(getInitials(null, "Doe")).toBe("D");
  });

  it("returns ? for empty names", () => {
    expect(getInitials(null, null)).toBe("?");
  });
});

describe("getTimeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(getTimeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(getTimeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(getTimeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(getTimeAgo(threeDaysAgo)).toBe("3d ago");
  });
});

describe("getStatusColor", () => {
  it("returns correct color for ACTIVE", () => {
    expect(getStatusColor("ACTIVE")).toContain("green");
  });

  it("returns correct color for COMPLETED", () => {
    expect(getStatusColor("COMPLETED")).toContain("green");
  });

  it("returns correct color for CANCELLED", () => {
    expect(getStatusColor("CANCELLED")).toContain("red");
  });

  it("returns fallback for unknown status", () => {
    expect(getStatusColor("UNKNOWN")).toContain("gray");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("does not truncate short strings", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });
});
