import { z } from "zod";

export const careRecipientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().optional(),
  age: z.coerce.number().min(0).max(150).optional().nullable(),
  gender: z.string().optional(),
  relationship: z.string().min(1, "Relationship is required"),
  conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
});

export type CareRecipientInput = z.infer<typeof careRecipientSchema>;

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  unit: z.string().default("MG"),
  frequency: z.string().min(1, "Frequency is required"),
  timeOfDay: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prescribedBy: z.string().optional(),
  pharmacy: z.string().optional(),
  refillDate: z.string().optional(),
  refillReminder: z.boolean().default(false),
});

export type MedicationInput = z.infer<typeof medicationSchema>;

export const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().default("checkup"),
  dateTime: z.string().min(1, "Date and time is required"),
  endDateTime: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  provider: z.string().optional(),
  providerPhone: z.string().optional(),
  notes: z.string().optional(),
  reminderBefore: z.coerce.number().default(60),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().default("MEDIUM"),
  dueDate: z.string().optional(),
  category: z.string().default("general"),
  assignedToId: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
