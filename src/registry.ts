export class Registry {
  private static templates = new Map<string, any>();
  private static components = new Map<string, any>();
  private static pages = new Map<string, any>();
  private static registeredRoutes: Set<string> = new Set(); // Nova propriedade
  private static yamlRoutes: Set<string> = new Set();

  // Registradores padrão
  static registerTemplate(name: string, template: any) {
    this.templates.set(name, template);
  }

  static registerComponent(name: string, component: any) {
    this.components.set(name, component);
  }

  static registerPage(route: string, page: any) {
    this.pages.set(route, page);
  }

  // Métodos de acesso padrão
  static getTemplate(name: string) {
    return this.templates.get(name);
  }

  static getComponent(name: string) {
    return this.components.get(name);
  }

  static getPage(route: string) {
    return this.pages.get(route);
  }
  
  // Método para criar nova instância de template
  static createTemplate(name: string, ...args: any[]) {
    const templateClass = this.templates.get(name);
    if (!templateClass) {
      console.error(`Template "${name}" not found in registry!`);
      return null;
    }
    
    // Se for instância, retornamos uma cópia
    if (typeof templateClass !== 'function') {
      return templateClass;
    }
    
    // Se for classe, criamos uma nova instância
    return new templateClass(...args);
  }
  
  // Método para criar nova instância de componente
  static createComponent(name: string, ...args: any[]) {
    const componentClass = this.components.get(name);
    if (!componentClass) {
      console.error(`Component "${name}" not found in registry!`);
      return null;
    }
    
    // Retorna uma nova instância do componente
    return new componentClass(...args);
  }
  
  // Métodos para obter todos os itens
  static getAllTemplates() {
    return Array.from(this.templates.keys());
  }
  
  static getAllComponents() {
    return Array.from(this.components.keys());
  }
  
  static getAllPages() {
    return Array.from(this.pages.keys());
  }

  // Método para registrar uma rota via decorador
  static registerPageRoute(route: string, page: any) {
    // Normaliza a rota para garantir consistência
    const normalizedRoute = this.normalizeRoute(route);
    
    // Registra a página com sua rota
    this.pages.set(normalizedRoute, page);
    
    // Adiciona à lista de rotas registradas via decorador
    this.registeredRoutes.add(normalizedRoute.replace(/^\//, '')); // Remove a barra inicial
    
    // Verifica se a rota está registrada no YAML
    this.validateRouteWithYaml(normalizedRoute);
  }
  
  // Método para registrar rotas do YAML
  static setYamlRoutes(routes: string[]) {
    this.yamlRoutes = new Set(routes);
  }
  
  // Método para validação entre rotas e YAML
  static validateRouteWithYaml(route: string) {
    const normalizedRoute = route.replace(/^\//, ''); // Remove a barra inicial
    
    if (this.yamlRoutes.size > 0 && !this.yamlRoutes.has(normalizedRoute)) {
      throw new Error(
        `Rota "${normalizedRoute}" definida no decorador @route não corresponde a nenhuma chave no YAML.\n` +
        `Rotas registradas no YAML: ${[...this.yamlRoutes].join(', ')}`
      );
    }
    
    return true;
  }
  
  // Método para verificar se todas as rotas do YAML foram decoradas
  static validateAllYamlRoutes() {
    const missingRoutes = [...this.yamlRoutes].filter(
      yamlRoute => !this.registeredRoutes.has(yamlRoute)
    );
    
    if (missingRoutes.length > 0) {
      throw new Error(
        `Rotas definidas no YAML não foram decoradas com @route: ${missingRoutes.join(', ')}\n` +
        `Verifique se os decoradores @route foram aplicados corretamente.`
      );
    }
    
    return true;
  }
  
  // Função auxiliar para normalizar rotas
  private static normalizeRoute(route: string): string {
    // Remove barra no início se houver
    return route.startsWith('/') ? route : `/${route}`;
  }
}