import * as csv from 'csvtojson';
import { Readable } from 'stream';

export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const buffers: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('data', data => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
};

export const parseCsvStringToJson = async (csvString: string): Promise<any[]> => {
  return csv().fromString(csvString);
};

export const transformCsvDataToFields = async (entry: any): Promise<any[]> => {
  return Object.entries(entry).map(([key, value]) => ({
    key,
    value,
  }));
};

export const convertToString = (value: string): string => {
  const num = parseFloat(value);
  return num.toString();
};
