import { Images } from "src/images/entities/image.entity";
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'books'})
@Index(['id'])
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    summary: string;

    @Column()
    author: string;

    @Column()
    year: number;

    @Column({ default: true})
    status: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Images, (images) => images.book)
    images: Images[];
}
