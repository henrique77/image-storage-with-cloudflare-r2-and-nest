# API NestJS + PostgreSQL + Docker + TypeORM + Cloudflare R2

Este projeto é uma API desenvolvida utilizando o framework [NestJs](https://docs.nestjs.com/), conectada a um banco de dados [PostgreSQL](https://www.postgresql.org/docs/), executada em um ambiente [Docker](https://www.docker.com/) e usando o [TypeORM](https://typeorm.io/) para realização das consultas ao banco de dados. A API também integra-se com o [Cloudflare R2](https://developers.cloudflare.com/r2/) para armazenamento e gerenciamento de imagens. As imagens armazenadas no Cloudflare R2 pode ter sua url definida como pública posibilitando o acesso em qualquer navegador.

## Pré-requisitos

Certifique-se de ter o seguinte instalado em sua máquina local:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Execução do Projeto

Copie o repositório para sua máquina local:

```

https://github.com/henrique77/image-storage-with-cloudflare-r2-and-nest.git
```
Crie um bucket no Cloudflare R2 para armazenar as imagens ([doc](https://developers.cloudflare.com/r2/buckets/)) e Gere um token de autenticação no Cloudflare para ser usado na API ([doc](https://developers.cloudflare.com/r2/api/s3/tokens/))

Crie um arquivo **.env** na raiz do projeto e adicione as variáveis de ambiente necessárias. Você pode usar **.env.example** como referência

Posteriormente a criação e inserção das informações necessárias no **.env**, execute:
```

docker compose up
```
Assim que os contêineres estiverem instalados e funcionando, podemos acessar o aplicativo NestJS visitando [http://localhost:3000](http://localhost:3000) e pgAdmin visitando [http://localhost:5050](http://localhost:5050) em nosso navegador.
Faça login no pgAdmin usando o e-mail e a senha que especificamos no arquivo **docker-compose.yml** e Configurando o pgAdmin e o servidor PostgreSQL conforme as informações do arquivo **docker-compose.yml**

Agora a API pode ser testada usando o [Postman](https://www.postman.com/) ou outra ferramenta de sua preferência.

As rotas disponiveis são:
```

POST: http://localhost:3000/books
GET: http://localhost:3000/books
GET: http://localhost:3000/books/ID_BOOK
DELETE: http://localhost:3000/books/ID_BOOK
```


## For more information

- Author - [Henrique Caires](https://www.linkedin.com/in/henrique-caires/)

Open for questions or suggestions
