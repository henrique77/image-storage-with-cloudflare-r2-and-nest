import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { DataSource, Repository } from 'typeorm';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Images } from 'src/images/entities/image.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Images)
    private imageRepository: Repository<Images>,
    private dataSource: DataSource,
  ){}

  async create(
    createBookDto: CreateBookDto,
    imagens: Express.Multer.File[],
    ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const book = await queryRunner.manager.save(Book, {
        title: createBookDto.title,
        summary: createBookDto.summary,
        author: createBookDto.author,
        year: Number(createBookDto.year),
        status: createBookDto.status,
      });

      if (!book) {
        throw new HttpException('Livro não criado', HttpStatus.BAD_REQUEST);
      }

      if (imagens) {
        await Promise.all(
          imagens.map(async (imagem) => {
            const { originalname, buffer } = imagem;
            const nomeImagem = Date.now() + '-' + originalname.replace(/\s/g, '_');

            const imageCriada = await queryRunner.manager.save(Images, {
              name: nomeImagem,
              url: 'https://pub-80e90dad79d647409945f766b3c3cbf6.r2.dev/images/' + nomeImagem ,
              book: book,
            });

            if (!imageCriada) {
              throw new HttpException('Imagem não criada', HttpStatus.BAD_REQUEST);
            }

            uploarImageR2(nomeImagem, imagem.mimetype, buffer);
          }),
        );
      }

      await queryRunner.commitTransaction();

      const newBook = await this.bookRepository
        .createQueryBuilder('books')
        .leftJoinAndSelect('books.images', 'images')
        .where('books.id = :id', {id: book.id})
        .getOne();

      return newBook;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Book[]> {
    try {
      const books = await this.bookRepository
        .createQueryBuilder('books')
        .leftJoinAndSelect('books.images', 'images')
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
        .leftJoinAndSelect('books.images', 'images')
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

  async delete(id: string) {
    try {
      const book = await this.bookRepository
        .createQueryBuilder('books')
        .leftJoinAndSelect('books.images', 'images')
        .where('books.id = :id', {id: id})
        .getOne();

      if (!book) {
        throw new HttpException('Livro não encontrado!', HttpStatus.NO_CONTENT);
      }

      if (book.images && Array.isArray(book.images)) {
        await Promise.all(
          book.images.map(async (image) => {

            await this.imageRepository
            .createQueryBuilder()
            .delete()
            .from(Images)
            .where("id = :id", { id: image.id })
            .execute()

            deleteImageR2(image.name);
          }),
        );
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

async function uploarImageR2(
  nomeImagem: string,
  contentType: string,
  buffer: Buffer,
) {
  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/images`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_KEY_ID,
    },
  });

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: nomeImagem,
      ContentType: contentType,
      Body: buffer,
    },
  });

  await upload.done();
}

async function deleteImageR2(nomeImagem: string) {
  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/images`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_KEY_ID,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: nomeImagem,
  });
  await r2Client.send(command);
}

// function deleteImageLocal(nomeImagem: string) {
//   const caminhoParaDeletar = path.join('./images/books', nomeImagem);

//   if (fs.existsSync(caminhoParaDeletar)) {
//     fs.unlinkSync(caminhoParaDeletar);
//   }
// }
