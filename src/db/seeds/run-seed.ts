import { NestFactory } from '@nestjs/core';

import { DataSource } from 'typeorm';
import { runSeed } from './seed';
import { AppModule } from '@/app.module';

async function bootstrap() {
  // Cria o contexto da aplicação sem subir o servidor HTTP
  const app = await NestFactory.createApplicationContext(AppModule);

  // Pega a instância do DataSource que o Nest já configurou
  const dataSource = app.get(DataSource);

  try {
    await runSeed(dataSource);
    console.log('🌱 Seed finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao rodar o seed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
