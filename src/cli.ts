import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export class FrameworkCLI {
  static createProject(projectName: string) {
    const projectPath = path.join(process.cwd(), projectName);
    
    // Verifica se o diretório já existe
    if (fs.existsSync(projectPath)) {
      console.error(`❌ Project ${projectName} already exists!`);
      return;
    }

    // Cria estrutura de diretórios
    fs.mkdirSync(projectPath);
    fs.mkdirSync(path.join(projectPath, "src"));
    fs.mkdirSync(path.join(projectPath, "src", "pages"));
    fs.mkdirSync(path.join(projectPath, "src", "components"));
    fs.mkdirSync(path.join(projectPath, "src", "templates"));
    fs.mkdirSync(path.join(projectPath, "styles"));
    fs.mkdirSync(path.join(projectPath, "scripts"));

    // Cria configuração YAML na raiz
    const configContent = `useServer: true
html:
  lang: "pt-BR"
  head:
    title: "My Framework Site"
    meta:
      - charset: "UTF-8"
      - name: "viewport"
        content: "width=device-width, initial-scale=1.0"
  links:
    - rel: "stylesheet"
      href: "styles/global.css"
  scripts:
    - src: "scripts/global.js"
pages:
  home: "src/pages/home-page.ts"
  about: "src/pages/about-page.ts"`;

    fs.writeFileSync(
      path.join(projectPath, "config.page.yaml"),
      configContent
    );

    // Cria package.json
    const packageJson = {
      name: projectName,
      version: "1.0.0",
      description: "A site built with my-framework",
      scripts: {
        start: "ts-node src/index.ts",
        build: "tsc",
        dev: "nodemon --exec ts-node src/index.ts"
      },
      dependencies: {
        "my-framework": "^1.0.0",
        "jsdom": "^22.1.0",
        "js-yaml": "^4.1.0",
        "glob": "^8.1.0"
      },
      devDependencies: {
        "@types/js-yaml": "^4.0.5",
        "@types/jsdom": "^21.1.6",
        "@types/node": "^20.3.1",
        "@types/glob": "^8.1.0",
        "nodemon": "^3.0.1",
        "ts-node": "^10.9.1",
        "typescript": "^5.1.3"
      }
    };

    fs.writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Cria tsconfig.json
    const tsconfigJson = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        declaration: true,
        outDir: "./dist",
        rootDir: "./src",
        strict: false,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"]
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsconfigJson, null, 2)
    );

    // Cria arquivo index.ts
    const indexContent = `import { Framework } from "my-framework";

// Inicializa o framework
const framework = new Framework();
framework.startServer();`;

    fs.writeFileSync(
      path.join(projectPath, "src", "index.ts"),
      indexContent
    );

    // Cria uma página inicial de exemplo
    const homePageContent = `import { route } from "my-framework";

@route("/home", { css: "styles/home.css", script: "scripts/home.js" })
export class HomePage {
  render() {
    return {
      div: {
        class: "home-container",
        content: [
          { h1: { content: "Welcome to My Framework!" } },
          { p: { content: "This is your new project created with My Framework." } },
          { a: { href: "/about", content: "About page" } }
        ]
      }
    };
  }
}`;

    fs.writeFileSync(
      path.join(projectPath, "src", "pages", "home-page.ts"),
      homePageContent
    );

    // Cria uma página about de exemplo
    const aboutPageContent = `import { route } from "my-framework";

@route("/about", { css: "styles/about.css" })
export class AboutPage {
  render() {
    return {
      div: {
        class: "about-container",
        content: [
          { h1: { content: "About My Framework" } },
          { p: { content: "This framework allows you to build web applications using a declarative object syntax." } },
          { a: { href: "/home", content: "Back to Home" } }
        ]
      }
    };
  }
}`;

    fs.writeFileSync(
      path.join(projectPath, "src", "pages", "about-page.ts"),
      aboutPageContent
    );

    // Cria um CSS global básico
    const globalCssContent = `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  line-height: 1.6;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}`;

    fs.writeFileSync(
      path.join(projectPath, "styles", "global.css"),
      globalCssContent
    );

    // Cria CSS para a página home
    const homeCssContent = `.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 5px;
}

h1 {
  color: #333;
}`;

    fs.writeFileSync(
      path.join(projectPath, "styles", "home.css"),
      homeCssContent
    );

    // Cria CSS para a página about
    const aboutCssContent = `.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
}

h1 {
  color: #444;
}`;

    fs.writeFileSync(
      path.join(projectPath, "styles", "about.css"),
      aboutCssContent
    );

    // Cria um JavaScript global básico
    const globalJsContent = `console.log('Global script loaded');`;

    fs.writeFileSync(
      path.join(projectPath, "scripts", "global.js"),
      globalJsContent
    );

    // Cria um JavaScript para a página home
    const homeJsContent = `console.log('Home page script loaded');`;

    fs.writeFileSync(
      path.join(projectPath, "scripts", "home.js"),
      homeJsContent
    );

    console.log(`✅ Project ${projectName} created successfully!`);
    console.log(`Run the following commands to start your project:`);
    console.log(`cd ${projectName}`);
    console.log(`npm install`);
    console.log(`npm start`);
  }
  
  static run(args: string[]) {
    const command = args[0];
    const params = args.slice(1);
    
    switch (command) {
      case 'createProject':
        if (params.length === 0) {
          console.error('❌ Project name is required!');
          console.log('Usage: npm run create-project <project-name>');
          process.exit(1);
        }
        this.createProject(params[0]);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Available commands:');
        console.log('  createProject <project-name> - Create a new project');
        process.exit(1);
    }
  }
}

// Execute se for chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  FrameworkCLI.run(args);
}