import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class WinstonLoggerService  implements NestLoggerService {
 private readonly logger: winston.Logger;


 constructor(private configService: ConfigService) {
   const appName = this.configService.get<string>('APP_NAME');


   this.logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json(),
     ),
     transports: [
       new winston.transports.Console(),
       new winston.transports.DailyRotateFile({
         dirname: 'logs', // Directory where logs will be stored
         filename: `${appName}-%DATE%.log`,
         datePattern: 'YYYY-MM-DD',
         zippedArchive: true,
         maxSize: '20m',
         maxFiles: '14d',
       }),
     ],
   });
 }


 log(message: string) {
   this.logger.info(message);
 }


 error(message: string, trace: string) {
   this.logger.error({ message, trace });
 }


 warn(message: string) {
   this.logger.warn(message);
 }


 debug(message: string) {
   this.logger.debug(message);
 }


 verbose(message: string) {
   this.logger.verbose(message);
 }
}


