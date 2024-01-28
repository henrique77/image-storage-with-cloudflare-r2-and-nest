import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ){}

  async create(createBookDto: CreateBookDto) {
    try {
      const book = await this.bookRepository
        .createQueryBuilder()
        .insert()
        .into(Book)
        .values({
          title: createBookDto.title,
          summary: createBookDto.summary,
          author: createBookDto.author,
          year: createBookDto.year,
          status: createBookDto.status,
        })
        .execute();

      const bookCreated = await this.bookRepository
        .createQueryBuilder('books')
        .where('books.id = :id', { id: book.identifiers[0].id })
        .getOne();

      return bookCreated;
    } catch (error) {
      throw new HttpException(
        'O livro não foi criado',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(): Promise<Book[]> {
    try {
      const books = await this.bookRepository
        .createQueryBuilder('books')
        .getMany();

      if (books.length === 0) {
        throw new HttpException('Nenhum livro encontrado!', HttpStatus.NO_CONTENT);
      }

      return books;
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  async findOne(id: string): Promise<Book> {
    try {
      const book = await this.bookRepository
        .createQueryBuilder('books')
        .where('books.id = :id', {id: id})
        .getOne();

      if (!book) {
        throw new HttpException('Livro não encontrado!', HttpStatus.NO_CONTENT);
      }

      return book;
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      const book = await this.bookRepository
        .createQueryBuilder('books')
        .where('books.id = :id', {id: id})
        .getOne();

      if (!book) {
        throw new HttpException('Livro não encontrado!', HttpStatus.NO_CONTENT);
      }

      const bookUpdate = await this.bookRepository
        .createQueryBuilder()
        .update(Book)
        .set({ 
          title: updateBookDto.title || book.title,
          summary: updateBookDto.summary || book.summary,
          author: updateBookDto.author || book.author,
          year: updateBookDto.year || book.year,
          status: updateBookDto.status || book.status, 
        })
        .where('id = :id', { id: id })
        .execute();

      if (!bookUpdate) {
        throw new HttpException('O livro não foi atualizado', HttpStatus.BAD_REQUEST);
      }

      const newBookUpdate = await this.bookRepository
        .createQueryBuilder('books')
        .where('books.id = :id', {id: id})
        .getOne();

      return newBookUpdate

    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  async remove(id: string) {
    try {
      const book = await this.bookRepository
        .createQueryBuilder('books')
        .where('books.id = :id', {id: id})
        .getOne();

      if (!book) {
        throw new HttpException('Livro não encontrado!', HttpStatus.NO_CONTENT);
      }

      await this.bookRepository
      .createQueryBuilder()
      .delete()
      .from(Book)
      .where("id = :id", { id: id })
      .execute()

      throw new HttpException('Livro deletado!', HttpStatus.OK);

    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }
}
