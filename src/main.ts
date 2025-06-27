import { NestFactory } from '@nestjs/core';
import { AppModule } from "./app.module";
import { WinstonLoggerService } from '@/shared/logger/winston-logger.service';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import * as express from 'express';
import * as cluster from 'cluster';
import * as os from 'os';


async function bootstrap() {

  const numCPUs = os.cpus().length;

  if ((cluster as any).isPrimary) {
   console.log(`Primary process ${process.pid} is running on RYPM Service`);
   // Fork workers based on the available CPUs
   for (let i = 0; i < numCPUs; i++) {
     (cluster as any).fork();
   }


   (cluster as any).on(
     'exit',
     (worker: cluster.Worker, code: number, signal: string) => {
       console.error(
         `Worker ${worker.process.pid} died (${signal || code}). Restarting... in RYPM service`,
       );
       (cluster as any).fork();
     },
   );
 }
 else{
      const app = await NestFactory.create(AppModule);
      app.setGlobalPrefix('api');
      // Enable versioning 
      app.enableVersioning({
        type: VersioningType.URI,
      });
      const configService = app.get(ConfigService);
      const logger = app.get(WinstonLoggerService);
      const port = configService.get<number>('port') || 3000;
      try {

        await app.listen(port);
        logger.log(`🚀 RYPM V2 version is listening on port ${port}`);
      } catch (error) {
        console.log(error);
        logger.error('❌ Error starting RYPM V2 version:', error);
        process.exit(1);
      }


      const shutdown = async (signal: string) => {
        logger.log(
          `⚠️ ${signal} signal received: closing RYPM V2 version`,
        );
        try {
          await app.close();
          logger.log('💤 RYPM V2 version closed');
          process.exit(0);
        } catch (err) {
          logger.error('❌ Error RYPM V2 version during shutdown:', err);
          process.exit(1);
        }
      };
      // error handling
        process.on('uncaughtException', async (err) => {
          logger.error(`RYPM V2 Uncaught Exception: ${err.message}`, err?.stack ?? '');
          process.exit(1);
        });


      process.on('unhandledRejection', async (reason) => {
        if (reason instanceof Error) {
          logger.error(`RYPM V2 Unhandled Rejection: ${reason.message}`, reason.stack ?? '');
        } else {
          logger.error(`RYPM V2 Unhandled Rejection: ${String(reason)}`, '');
        }

        process.exit(1);
      });


      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
 }



}
bootstrap();