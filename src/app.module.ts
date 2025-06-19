import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
//import { UsersModule } from "./modules/users/users.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { MapModule } from "./modules/map/map.module";
import { LocationModule } from "./modules/location/location.module";
import { ZohoModule } from "./modules/zoho/zoho.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "@/shared/prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes env config available everywhere
      envFilePath: ".env", // Default .env file
    }),
    AuthModule,
    //UsersModule,
    PropertiesModule,
    MapModule,
    LocationModule,
    ZohoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
