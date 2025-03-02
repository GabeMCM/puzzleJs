import { component } from "../decorators";

@component("header-component")
export class HeaderComponent {
  render(props: any = {}) {
    return {
      header: {
        class: "app-header",
        content: [
          { h1: { content: props.title || "Aplicação" } },
          {
            nav: {
              class: "navigation",
              content: [
                { a: { href: "/home", class: "nav-link", content: "Home" } },
                { a: { href: "/about", class: "nav-link", content: "Sobre" } },
                { a: { href: "/contact", class: "nav-link", content: "Contato" } }
              ]
            }
          }
        ]
      }
    };
  }
}