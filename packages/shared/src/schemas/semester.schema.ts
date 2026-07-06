import { z } from 'zod';

export const createSemesterSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Semester name is required')
      .max(100, 'Name must be under 100 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z
      .string()
      .max(500, 'Description must be under 500 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: 'End date must be after or equal to the start date',
      path: ['endDate'],
    }
  );

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
