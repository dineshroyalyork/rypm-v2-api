import { z } from 'zod';

export const importCsvSchema = z.object({
  csvData: z.string().min(1, 'CSV data is required'),
});

export type ImportCsvDto = z.infer<typeof importCsvSchema>;
