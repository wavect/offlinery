import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {INestApplication, VersioningType} from "@nestjs/common";
import * as path from 'path'
import { writeFileSync } from 'fs';
import helmet from "helmet";
import {NotificationNavigateUserDTO} from "./DTOs/notification-navigate-user.dto";

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

  // @dev https://docs.nestjs.com/techniques/versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // security base line
  app.use(helmet());

  await app.listen(3000);
}

const VERSION = '1'
const BE_ENDPOINT = 'https://offlinery.onrender.com' // 'http://localhost:3000' // TODO: Adapt / dev env

const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
      .setTitle('Offlinery')
      .setDescription('API of Offlinery')
      .setVersion(VERSION)
      .addServer(`${BE_ENDPOINT}/v${VERSION}`) // will also be used in Frontend when generated
      .addTag('app')
      .build();
  const document = SwaggerModule.createDocument(app, config, {deepScanRoutes: true, extraModels: [NotificationNavigateUserDTO]});

  const outputPath = path.resolve(process.cwd(), 'swagger.json');
  writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' });


  SwaggerModule.setup('api', app, document);
}

bootstrap()
    .then(() => console.log('Backend started..'))
    .catch(console.error);
