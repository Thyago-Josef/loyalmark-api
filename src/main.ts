import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: true, // Em produção, coloque a URL do seu front
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('LoyalMark API')
    .setDescription('Sistema de Fidelização e Ofertas para Lojistas')
    .setVersion('1.0')
    .addTag('offers')
    .addBearerAuth()
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT', // Opcional, apenas para documentação
    //     name: 'JWT',
    //     description: 'Insira o token JWT',
    //     in: 'header',
    //   },
    //   'access-token', // Este é o nome da referência de segurança
    // )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Ocupará a rota http://localhost:3000/api

  // Ativa a validação automática em todos os endpoints
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Remove campos que não estão no DTO
    forbidNonWhitelisted: true, // Erro se enviarem campos "estranhos"
    transform: true,            // Converte tipos automaticamente
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📄 Swagger documentation: ${await app.getUrl()}/api`);
}
bootstrap();
