console.log("Home page script loaded");

// Função que será executada quando a página carregar
window.onload = function() {
  console.log("Home page fully loaded");
  
  // Encontra botões com data-event-click e associa eventos
  document.querySelectorAll('[data-event-click]').forEach(button => {
    button.addEventListener('click', function() {
      console.log('Button clicked!');
      alert("Obrigado por usar nosso framework!");
    });
  });
};