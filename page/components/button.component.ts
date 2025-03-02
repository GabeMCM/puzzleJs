import { component } from "../../src/decorators"

@component("myButton")
class ButtonComponent {
  render() {
    return {
      button: {
        class: "btn",
        content: "Clique Aqui"
      }
    };
  }

  handleClick() {
    console.log("Botão clicado!");
  }
}

export default ButtonComponent;