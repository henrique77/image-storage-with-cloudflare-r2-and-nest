import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Images } from 'src/images/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Images])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
