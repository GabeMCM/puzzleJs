import { route } from "../../src/decorators"

@route("/home")
class HomePage {
  render() {
    return MainLayout([
      { h1: "Bem-vindo à Home!" },
      { p: "Gerencie seu conteúdo facilmente." },
      { "custom-button": {} } // 🔥 O botão é chamado diretamente!
    ]);
  }
}


export default HomePage;