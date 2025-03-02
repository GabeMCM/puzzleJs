import { Registry } from "./registry";

export function template(name: string, options: { css?: string } = {}) {
  return function (target: any) {
    // Armazena a classe no registro
    Registry.registerTemplate(name, target);
    
    // Adiciona propriedades à classe
    target.prototype.templateName = name;
    target.prototype.css = options.css;
    
    // Mantém o retorno da classe para uso posterior
    return target;
  };
}

export function component(name: string, options: { css?: string } = {}) {
  return function (target: any) {
    // Armazena a classe no registro
    Registry.registerComponent(name, target);
    
    // Adiciona propriedades à classe
    target.prototype.componentName = name;
    target.prototype.css = options.css;
    
    // Registrar como elemento customizado se em ambiente browser
    if (typeof window !== 'undefined' && 'customElements' in window) {
      if (!customElements.get(name)) {
        customElements.define(name, class extends HTMLElement {
          constructor() {
            super();
            // Cria shadow DOM para encapsulamento
            const shadow = this.attachShadow({ mode: "open" });
            const instance = new target();
            
            // Adiciona CSS do componente se fornecido
            if (options.css) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = options.css;
              shadow.appendChild(link);
            }
            
            // Renderiza componente
            const content = instance.render();
            shadow.appendChild(this.objectToDOM(content));
            
            // Associa eventos
            this.bindEvents(instance, shadow);
          }
          
          // Converte objeto para DOM
          objectToDOM(obj: any): Node {
            if (typeof obj === 'string') {
              return document.createTextNode(obj);
            }
            
            if (Array.isArray(obj)) {
              const fragment = document.createDocumentFragment();
              obj.forEach(item => {
                fragment.appendChild(this.objectToDOM(item));
              });
              return fragment;
            }
            
            const entries = Object.entries(obj);
            if (entries.length === 0) return document.createDocumentFragment();
            
            const [tagName, props] = entries[0];
            const element = document.createElement(tagName);
            
            if (props) {
              Object.entries(props).forEach(([key, value]) => {
                if (key === 'content') {
                  if (value) {
                    const contentValue = Array.isArray(value) ? value : [value];
                    contentValue.forEach(item => {
                      element.appendChild(this.objectToDOM(item));
                    });
                  }
                } else if (key === 'events') {
                  // Eventos serão vinculados separadamente
                } else {
                  element.setAttribute(key, String(value));
                }
              });
            }
            
            return element;
          }
          
          // Associa eventos do componente
          bindEvents(instance: any, root: ShadowRoot) {
            root.querySelectorAll('[data-event]').forEach(el => {
              const eventData = el.getAttribute('data-event');
              if (eventData) {
                try {
                  const [eventName, handlerName] = eventData.split(':');
                  if (eventName && handlerName && typeof instance[handlerName] === 'function') {
                    el.addEventListener(eventName, instance[handlerName].bind(instance));
                  }
                } catch (e) {
                  console.error('Error binding event:', e);
                }
              }
            });
          }
        });
      }
    }
    
    return target;
  };
}

export function route(path: string, options: { css?: string, script?: string } = {}) {
  return function (target: any) {
    const pageInstance = new target();
    
    // Adiciona propriedades à instância da página
    pageInstance.routePath = path;
    if (options.css) {
      pageInstance.css = options.css;
    }
    if (options.script) {
      pageInstance.script = options.script;
    }
    
    /// Usar o novo método que valida contra o YAML
    try {
      Registry.registerPageRoute(path, pageInstance);
      console.log(`✅ Rota registrada com sucesso: ${path}`);
    } catch (error) {
      console.error(`❌ Erro ao registrar rota ${path}:`, error.message);
      throw error; // Re-lança o erro para interromper a execução
    }
    
    return target;
  };
}