import http from "http";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { Registry } from "./registry";
import glob from "glob";

export class Framework {
  private config: any;
  private dom: JSDOM;

  constructor() {
    this.dom = new JSDOM('<!DOCTYPE html>');
    this.loadConfig();
    this.autoLoadComponentsAndTemplates();
    this.registerPages();
  }

  private loadConfig() {
    try {
      // Busca o arquivo na raiz do projeto
      this.config = yaml.load(fs.readFileSync("config.page.yaml", "utf8"));
    } catch (error) {
      console.error("Error loading configuration:", error);
      this.config = {
        useServer: true,
        html: {
          lang: "pt-BR",
          head: { title: "My Site", meta: [] },
          links: [],
          scripts: []
        },
        pages: {}
      };
    }
  }
  
  private autoLoadComponentsAndTemplates() {
    try {
      // Auto-load all component files
      const componentFiles = glob.sync('src/components/**/*.ts');
      componentFiles.forEach(file => {
        try {
          require(path.resolve(file));
          console.log(`✅ Component loaded: ${file}`);
        } catch (err) {
          console.error(`❌ Error loading component from ${file}:`, err);
        }
      });
      
      // Auto-load all template files
      const templateFiles = glob.sync('src/templates/**/*.ts');
      templateFiles.forEach(file => {
        try {
          require(path.resolve(file));
          console.log(`✅ Template loaded: ${file}`);
        } catch (err) {
          console.error(`❌ Error loading template from ${file}:`, err);
        }
      });
      
      console.log(`✅ Total: Loaded ${componentFiles.length} components and ${templateFiles.length} templates`);
    } catch (error) {
      console.error("Error during auto-loading components and templates:", error);
    }
  }
  
  private registerPages() {
    // Primeiro, registra as rotas do YAML
    if (this.config.pages) {
      const yamlRoutes = Object.keys(this.config.pages);
      Registry.setYamlRoutes(yamlRoutes);
      
      console.log(`✅ Rotas do YAML registradas: ${yamlRoutes.join(', ')}`);
      
      // Depois, carrega os arquivos que contêm os decoradores
      Object.entries(this.config.pages).forEach(([route, filePath]: [string, string]) => {
        try {
          // Import the page file
          require(path.resolve(filePath as string));
          console.log(`✅ Arquivo de página carregado: ${route} -> ${filePath}`);
        } catch (error) {
          console.error(`❌ Erro ao carregar página ${route} de ${filePath}:`, error);
          throw new Error(`Falha ao carregar página ${route}: ${error.message}`);
        }
      });
      
      // Finalmente, verifica se todas as rotas do YAML foram decoradas
      try {
        Registry.validateAllYamlRoutes();
        console.log(`✅ Todas as rotas do YAML foram decoradas corretamente.`);
      } catch (error) {
        console.error(`❌ Erro de validação de rotas:`, error.message);
        throw error; // Re-lança o erro para interromper a execução
      }
    }
  }

  // Mudei o nome do parâmetro de 'path' para 'routePath' para evitar conflito
  private renderPage(routePath: string): string {
    const document = this.dom.window.document;
    document.documentElement.innerHTML = ''; // Clear document
    
    // Set HTML attributes
    document.documentElement.lang = this.config.html.lang || "pt-BR";
    
    // Create head element
    const head = document.createElement('head');
    document.documentElement.appendChild(head);
    
    // Add meta tags
    if (this.config.html.head && this.config.html.head.meta) {
      this.config.html.head.meta.forEach((meta: any) => {
        const metaTag = document.createElement('meta');
        Object.entries(meta).forEach(([key, value]: [string, string]) => {
          metaTag.setAttribute(key, value);
        });
        head.appendChild(metaTag);
      });
    }
    
    // Add title
    const title = document.createElement('title');
    title.textContent = this.config.html.head?.title || "My Site";
    head.appendChild(title);
    
    // Add global CSS links
    if (this.config.html.links) {
      this.config.html.links.forEach((link: any) => {
        const linkTag = document.createElement('link');
        linkTag.rel = link.rel;
        linkTag.href = link.href;
        head.appendChild(linkTag);
      });
    }
    
    // Create body
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
    
    // Get page from registry
    const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    const page = Registry.getPage(normalizedPath);
    
    if (page) {
      // Add page-specific CSS if defined
      if (page.css) {
        const pageCssLink = document.createElement('link');
        pageCssLink.rel = 'stylesheet';
        pageCssLink.href = page.css;
        head.appendChild(pageCssLink);
      }
      
      // Render page content
      const pageContent = page.render();
      body.appendChild(this.generateDOM(pageContent, document));
      
      // Add page-specific script if defined
      if (page.script) {
        const pageScript = document.createElement('script');
        pageScript.src = page.script;
        body.appendChild(pageScript);
      }
    } else {
      // Not found page
      const notFoundDiv = document.createElement('div');
      notFoundDiv.className = 'not-found';
      
      const h1 = document.createElement('h1');
      h1.textContent = 'Page Not Found';
      notFoundDiv.appendChild(h1);
      
      const p = document.createElement('p');
      p.textContent = 'The page you are looking for does not exist.';
      notFoundDiv.appendChild(p);
      
      const a = document.createElement('a');
      a.href = '/';
      a.textContent = 'Back to Home';
      notFoundDiv.appendChild(a);
      
      body.appendChild(notFoundDiv);
    }
    
    // Add global scripts
    if (this.config.html.scripts) {
      this.config.html.scripts.forEach((script: any) => {
        const scriptTag = document.createElement('script');
        scriptTag.src = script.src;
        body.appendChild(scriptTag);
      });
    }
    
    return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
  }
  
  private generateDOM(element: any, document: Document): Node {
    // If element is a string, create text node
    if (typeof element === 'string') {
      return document.createTextNode(element);
    }
    
    // If element is an array, process each item
    if (Array.isArray(element)) {
      const fragment = document.createDocumentFragment();
      element.forEach(item => {
        fragment.appendChild(this.generateDOM(item, document));
      });
      return fragment;
    }
    
    // Process object representing HTML element
    const entries = Object.entries(element);
    if (entries.length === 0) return document.createDocumentFragment();
    
    const [tagName, props] = entries[0];
    
    // Check if this is a custom component
    if (tagName.includes('-') && Registry.getComponent(tagName)) {
      const component = Registry.getComponent(tagName);
      const instance = new component();
      return this.generateDOM(instance.render(props), document);
    }
    
    // Create regular DOM element
    const domElement = document.createElement(tagName);
    
    // Set attributes and properties
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'content') {
          // Handle content property
          if (value) {
            const contentValue = Array.isArray(value) ? value : [value];
            contentValue.forEach(item => {
              domElement.appendChild(this.generateDOM(item, document));
            });
          }
        } else if (key === 'events') {
          // Events will be handled in browser context
          // We could add data attributes to facilitate client-side event binding
          if (typeof value === 'object') {
            Object.entries(value as object).forEach(([eventName, handlerName]) => {
              domElement.setAttribute(`data-event-${eventName}`, String(handlerName));
            });
          }
        } else {
          // Regular attributes
          domElement.setAttribute(key, String(value));
        }
      });
    }
    
    return domElement;
  }

  // Também atualizado aqui para manter consistência
  public renderRoute(routePath: string): string {
    return this.renderPage(routePath);
  }

  public startServer() {
    if (!this.config.useServer) {
      console.log("🔧 Server mode disabled.");
      return;
    }
  
    try {
      const server = http.createServer((req, res) => {
        const url = req.url || "/";
        
        // Check if requesting a static file
        if (url.match(/\.(css|js|jpg|jpeg|png|gif|ico)$/i)) {
          const filePath = path.join(process.cwd(), url);
          
          if (fs.existsSync(filePath)) {
            const contentType = this.getContentType(url);
            const content = fs.readFileSync(filePath);
            
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
            return;
          }
          
          // File not found
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File not found");
          return;
        }
        
        // Handle HTML routes
        let routePath;
        if (url === "/") {
          // Procura primeiro pela rota "/" no registro
          if (Registry.getPage("/")) {
            routePath = "/";
          } else {
            // Se não encontrar, procura "/home"
            if (Registry.getPage("/home")) {
              routePath = "/home";
            } else {
              // Se nem "/" nem "/home" estiverem registrados
              res.writeHead(404, { "Content-Type": "text/html" });
              res.end("<h1>Página inicial não encontrada</h1><p>A rota '/' ou '/home' não está registrada.</p>");
              return;
            }
          }
        } else {
          routePath = url;
        }
        
        try {
          const html = this.renderPage(routePath);
          
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        } catch (error) {
          console.error(`❌ Erro ao renderizar página ${routePath}:`, error);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(`<h1>Erro ao renderizar página</h1><p>${error.message}</p>`);
        }
      });
  
      const port = this.config.port || 3000;
      server.listen(port, () => {
        console.log(`🚀 Server running on port http://localhost:${port}`);
      });
    } catch (error) {
      console.error("❌ Erro fatal ao iniciar o servidor:", error);
      process.exit(1); // Encerra a aplicação em caso de erro crítico
    }
  }
  
  private getContentType(url: string): string {
    const extension = path.extname(url).toLowerCase();
    const types: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon'
    };
    
    return types[extension] || 'application/octet-stream';
  }
}