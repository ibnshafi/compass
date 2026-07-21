import { describe, it, expect } from "vitest";
import {
  careRecipientSchema,
  medicationSchema,
  appointmentSchema,
  taskSchema,
} from "@/lib/validations";

describe("careRecipientSchema", () => {
  it("validates a valid input", () => {
    const result = careRecipientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      relationship: "mother",
      conditions: "Dementia, Diabetes",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing first name", () => {
    const result = careRecipientSchema.safeParse({
      lastName: "Doe",
      relationship: "mother",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.firstName).toBeDefined();
    }
  });

  it("rejects missing relationship", () => {
    const result = careRecipientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("coerces age to number", () => {
    const result = careRecipientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      relationship: "mother",
      age: "75",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(75);
    }
  });
});

describe("medicationSchema", () => {
  it("validates a valid medication", () => {
    const result = medicationSchema.safeParse({
      name: "Metformin",
      dosage: "500",
      frequency: "Twice daily",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = medicationSchema.safeParse({
      dosage: "500",
      frequency: "Twice daily",
    });
    expect(result.success).toBe(false);
  });

  it("defaults unit to MG", () => {
    const result = medicationSchema.safeParse({
      name: "Metformin",
      dosage: "500",
      frequency: "Twice daily",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unit).toBe("MG");
    }
  });
});

describe("appointmentSchema", () => {
  it("validates a valid appointment", () => {
    const result = appointmentSchema.safeParse({
      title: "Annual Checkup",
      dateTime: "2024-03-15T10:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = appointmentSchema.safeParse({
      dateTime: "2024-03-15T10:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing dateTime", () => {
    const result = appointmentSchema.safeParse({
      title: "Checkup",
    });
    expect(result.success).toBe(false);
  });
});

describe("taskSchema", () => {
  it("validates a valid task", () => {
    const result = taskSchema.safeParse({
      title: "Give medication",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = taskSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("defaults priority to MEDIUM", () => {
    const result = taskSchema.safeParse({
      title: "Give medication",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("MEDIUM");
    }
  });
});
