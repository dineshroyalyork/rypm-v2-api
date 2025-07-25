import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
//import { UsersModule } from "./modules/users/users.module";
import { SharedModule } from '@/shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from './modules/location/location.module';
import { MapModule } from './modules/map/map.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ZohoModule } from './modules/zoho/zoho.module';
import { AccountInformationModule } from './modules/account-information/account-information.module';
import { TourSchedulingModule } from './modules/tour-scheduling/tour-scheduling.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes env config available everywhere
      envFilePath: '.env', // Default .env file
    }),
    AuthModule,
    //UsersModule,
    PropertiesModule,
    MapModule,
    LocationModule,
    ZohoModule,
    WishlistModule,
    AccountInformationModule,
    TourSchedulingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
