import { Registry } from "./registry";

// Funções de utilidade para componentes e templates
export function renderComponent(name: string, props: any = {}) {
  const ComponentClass = Registry.getComponent(name);
  if (!ComponentClass) {
    console.error(`Component "${name}" not found!`);
    return null;
  }
  const component = new ComponentClass();
  return component.render(props);
}

export function createTemplate(name: string, ...args: any[]) {
  const TemplateClass = Registry.getTemplate(name);
  if (!TemplateClass) {
    console.error(`Template "${name}" not found!`);
    return null;
  }
  return new TemplateClass(...args);
}