// Exportações do framework
export * from './framework';
export * from './registry';
export * from './decorators';
export * from './helpers';

// Inicialização quando chamado diretamente
import { Framework } from './framework';

if (require.main === module) {
  const framework = new Framework();
  framework.startServer();
}