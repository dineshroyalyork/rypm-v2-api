import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // So you can use PrismaService without importing the module everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
