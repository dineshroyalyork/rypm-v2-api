import { Module } from '@nestjs/common';
import { WishlistService } from './service/wishlist.service';
import { WishlistController } from './controller/wishlist.controller';
import { CompareController } from './controller/compare.controller';
import { CompareService } from './service/compare.service';
import { LikedController } from './controller/liked.controller';
import { LikedService } from './service/liked.service';

@Module({
  providers: [WishlistService, CompareService, LikedService],
  controllers: [WishlistController, CompareController, LikedController]
})
export class WishlistModule { }
