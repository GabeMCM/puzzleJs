import { route } from "../decorators";
import { createTemplate } from "../helpers";

@route("/home", { css: "styles/home.css", script: "scripts/home.js" })
export class HomePage {
  render() {
    // Usando template sem importação
    const mainLayout = createTemplate("main-layout");
    
    return mainLayout.render([
      {
        section: {
          class: "hero",
          content: [
            { h2: { class: "hero-title", content: "Bem-vindo ao Framework!" } },
            { 
              p: { 
                class: "hero-text",
                content: "Esta é uma página de demonstração criada usando objetos JavaScript para gerar HTML com manipulação DOM."
              }
            },
            {
              button: {
                class: "cta-button",
                content: "Saiba mais",
                events: {
                  click: "handleClick"
                }
              }
            }
          ]
        }
      },
      {
        section: {
          class: "features",
          content: [
            { h3: { content: "Recursos do Framework" } },
            {
              ul: {
                class: "feature-list",
                content: [
                  { li: { content: "Sintaxe declarativa com objetos" } },
                  { li: { content: "Manipulação DOM ao invés de strings HTML" } },
                  { li: { content: "Suporte a componentes reutilizáveis" } },
                  { li: { content: "Sistema de templates" } },
                  { li: { content: "Decoradores TypeScript" } }
                ]
              }
            }
          ]
        }
      }
    ]);
  }
  
  // Método que será associado ao evento de clique
  handleClick() {
    console.log("Botão clicado!");
    alert("Obrigado por usar nosso framework!");
  }
}