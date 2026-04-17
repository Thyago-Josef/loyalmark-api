import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('LoyalMark API')
    .setDescription('Sistema de Fidelização e Ofertas para Lojistas')
    .setVersion('1.0')
    .addTag('offers')
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
