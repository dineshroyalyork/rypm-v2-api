import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@/shared/shared.module';
import { AccountInformationModule } from './modules/account-information/account-information.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { MapModule } from './modules/map/map.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ZohoModule } from './modules/zoho/zoho.module';
import { TourSchedulingModule } from './modules/tour-scheduling/tour-scheduling.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AccountInformationModule,
    AuthModule,
    LocationModule,
    MapModule,
    PropertiesModule,
    TenantsModule,
    WishlistModule,
    ZohoModule,
    TourSchedulingModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
