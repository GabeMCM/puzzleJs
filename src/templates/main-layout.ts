import { template } from "../decorators";
import { renderComponent } from "../helpers";

@template("main-layout")
export class MainLayout {
  render(content: any) {
    return {
      div: {
        class: "container",
        content: [
          // Agora Components deve estar acessível
          renderComponent("header-component", { title: "EU SOU FODA" }),
          { 
            main: { 
              class: "content-area",
              content: content 
            } 
          },
          { 
            footer: { 
              class: "footer",
              content: "© 2025 GabeMCM- Criado com meu framework"
            } 
          }
        ]
      }
    };
  }
}