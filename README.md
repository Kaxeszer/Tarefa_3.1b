# Tarefa_3.1b — Prototipagem de Interfaces Web

Projeto desenvolvido no âmbito da unidade curricular **Programação Web Avançada**, do **Mestrado em Engenharia Informática e Tecnologia Web (UAb / UTAD)**.

## Objetivo

Planear e integrar duas novas entidades, **Sponsors** e **Experts**, na área de administração da plataforma **Animalec**, através da criação de *wireframes*, *mockups* e *protótipos* HTML5.

## Projeto de referência

Para a realização desta tarefa, foi descarregado o código do Animalec, integrado-o neste repositório como base de trabalho, com o front-end e o back-end organizados em pastas distintas.

## Estrutura do projeto

```text
Tarefa_3.1b/
├── Animalec/
│   ├── backend/       # API Node.js / Express
│   └── frontend/      # Aplicação Vue.js 2
├── .gitignore
└── README.md
```

## Tecnologias

- **Front-end:** Vue.js 2 e Vue CLI
- **Back-end:** Node.js e Express
- **Base de dados:** MongoDB / Mongoose
- **Gestão de dependências:** npm

## Instalação e execução

O projeto utiliza **Node.js 16** devido à compatibilidade com as dependências do Animalec. A versão utilizada foi a `16.20.2`, gerida através do **nvm**.

A partir da raiz do repositório, instalar as dependências:

**Back-end:**

```bash
cd Animalec/backend
npm install
```

**Front-end:**

```bash
nvm use 16
cd Animalec/frontend
npm install
```

Para iniciar a aplicação, utilizar dois terminais separados, ambos abertos na raiz do repositório.

**Terminal 1 — Back-end:**

```bash
nvm use 16
cd Animalec/backend
npm start
```

**Terminal 2 — Front-end:**

```bash
nvm use 16
cd Animalec/frontend
npm run serve
```

Endereços locais:

- **Front-end:** http://localhost:8081
- **Back-end:** http://localhost:8080

## Autor

**Nome:** Luís Carlos Crispim Pereira  
**N.º de estudante:** 2026106983