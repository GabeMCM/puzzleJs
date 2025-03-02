// Importa o framework diretamente (não precisa mais do globals)
import { Framework } from "./framework";

// Inicializa o framework com servidor integrado
const app = new Framework();
app.startServer();

// Exibe informação de inicialização
console.log("🚀 Framework inicializado com sucesso!");