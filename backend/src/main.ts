import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {INestApplication} from "@nestjs/common";
import * as path from 'path'
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  });
  setupSwagger(app)

  await app.listen(3000);
}

const BE_ENDPOINT = 'http://localhost:3000' // TODO: Adapt / dev env

const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
      .setTitle('Offlinery')
      .setDescription('API of Offlinery')
      .setVersion('1.0')
      .addServer(BE_ENDPOINT) // will also be used in Frontend when generated
      .addTag('app')
      .build();
  const document = SwaggerModule.createDocument(app, config, {deepScanRoutes: true});

  const outputPath = path.resolve(process.cwd(), 'swagger.json');
  writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' });


  SwaggerModule.setup('api', app, document);
}

bootstrap()
    .then(() => console.log('Backend started..'))
    .catch(console.error);
