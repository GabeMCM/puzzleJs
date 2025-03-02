import { template } from '../../src/decorators';

@template("main-layout", { css: "./home.style.css" })
class HomeLayout {
  render(c: any) {
    return {
      div: {
        class: "main-layout",
        content: [
          { header: { class: "header", content: "Meu Site" } },
          { nav: { 
            class: "navbar",
            content: [
              { a: { href: "/home", content: "Home" } },
              { a: { href: "/about", content: "Sobre" } },
              { "myButon": {} }
            ]
          }},
          c,
          { footer: { class: "footer", content: "© 2025 Meu Site" } }
        ]
      }
    };
  }
}

export default HomeLayout;