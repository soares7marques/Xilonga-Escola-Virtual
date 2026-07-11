# Preparação para Deploy e Aprendizado do Projeto Xilonga

## Objetivo deste documento

Este documento explica, de forma detalhada, o que foi implementado no projeto para prepará-lo para deploy, quais tecnologias foram usadas, como elas se encaixam na arquitetura da aplicação e por que cada decisão técnica foi tomada.

A ideia é que este material possa servir para:

- apresentar ao professor a solução de forma organizada;
- justificar as escolhas tecnológicas;
- mostrar o que foi feito para permitir acesso por URL pública;
- registrar o aprendizado obtido durante a preparação do deploy.

---

## Visão geral da aplicação

O projeto foi construído com uma arquitetura em três camadas principais:

1. **Frontend**: interface do utilizador em React + Vite.
2. **Backend**: API REST em Spring Boot.
3. **Banco de dados**: PostgreSQL.

Além dessas partes, o projeto também usa:

- **JWT** para autenticação;
- **Spring Security** para proteção dos endpoints;
- **CORS** para permitir comunicação entre frontend e backend em domínios diferentes;
- **GitHub Actions** para automatizar o deploy do frontend;
- **GitHub Pages** como hospedagem do frontend estático;
- **variáveis de ambiente** para evitar dependências fixas em `localhost`.

---

## O que foi implementado para preparar o deploy

### 1. Centralização da URL da API no frontend

Antes, várias partes do frontend chamavam o backend com `http://localhost:8080` diretamente. Isso funciona apenas em desenvolvimento local, mas quebra quando a aplicação é publicada.

Foi criada uma configuração central em `Front/src/services/api.js`:

- `API_BASE_URL` passa a ler `import.meta.env.VITE_API_BASE_URL`;
- se a variável não existir, o sistema usa `http://localhost:8080` como fallback local.

**Por que isso é importante:**

- permite apontar o frontend para uma API pública sem alterar código;
- facilita mudança entre ambiente local, homologação e produção;
- reduz erros e repetição de configuração.

---

### 2. Correção das chamadas diretas ao backend

Algumas telas ainda faziam `fetch()` diretamente com `localhost`:

- login;
- cadastro;
- recuperação de senha.

Essas chamadas foram ajustadas para usar a variável `API_BASE_URL`.

**Resultado:**

- o frontend deixa de depender do computador local;
- a mesma build pode ser publicada em qualquer host estático;
- o ambiente de produção fica configurável sem editar o código.

---

### 3. Ajuste do roteamento para ambiente estático

O projeto usava `BrowserRouter`, que é excelente em servidor com rewrite configurado, mas em hospedagem estática como GitHub Pages pode gerar erro ao atualizar páginas diretamente via URL.

Foi feita a troca para `HashRouter` em `Front/src/App.jsx`.

**Motivo técnico:**

- o `HashRouter` usa a parte após `#` da URL;
- isso evita problemas de refresh em hospedagem estática;
- funciona bem em GitHub Pages sem precisar configurar servidor com regras de fallback.

**Exemplo de URL final:**

```text
https://usuario.github.io/projeto/#/login
```

Isso é mais simples para publicação sem infraestrutura adicional.

---

### 4. Ajuste da configuração do Vite para build estático

No arquivo `Front/vite.config.js`, foi definido:

```js
base: './'
```

**O que isso faz:**

- faz o Vite gerar caminhos relativos nos assets;
- ajuda a aplicação a funcionar corretamente em subdiretórios;
- melhora a compatibilidade com GitHub Pages.

**Importância prática:**

Sem isso, arquivos CSS, JS e imagens podem quebrar quando a aplicação não está na raiz do domínio.

---

### 5. Preparação do backend para ambiente de produção

No Spring Boot, a configuração foi ajustada para usar variáveis de ambiente:

- `DATABASE_URL`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `PORT`

Isso foi feito em `back/demo/src/main/resources/application.properties`.

**Vantagens dessa abordagem:**

- não deixa credenciais expostas no código;
- facilita deploy em Render, Railway, EC2, Docker ou outro host;
- permite reutilizar o mesmo artefato em vários ambientes.

---

### 6. Ajuste de CORS para permitir frontend hospedado fora do backend

No arquivo `SecurityConfig.java`, foi revisada a configuração CORS.

Agora o backend aceita origens como:

- `http://localhost:5173`
- `http://localhost:4173`
- `https://*.github.io`

**O que isso resolve:**

- o frontend publicado consegue chamar a API;
- evita bloqueio de navegador por política de mesma origem;
- mantém compatibilidade com desenvolvimento local.

**Conceito importante:**

CORS é uma política de segurança do navegador. Sem ele, o navegador bloqueia chamadas entre origens diferentes, mesmo que a API esteja funcionando corretamente.

---

### 7. Automação do deploy com GitHub Actions

Foi criado o workflow `.github/workflows/deploy-front.yml`.

Esse workflow faz o seguinte:

1. detecta mudanças no frontend;
2. faz checkout do código;
3. instala dependências com `npm ci`;
4. compila o frontend com `npm run build`;
5. publica os arquivos estáticos no GitHub Pages.

**Por que usar GitHub Actions:**

- automatiza o processo de publicação;
- evita build manual toda vez;
- reduz chances de erro humano;
- deixa o projeto com cara mais profissional.

---

### 8. Preparação de ambiente por variáveis

Foi criado também o arquivo `Front/.env.example`.

Ele serve como exemplo para configurar a URL da API pública.

**Exemplo:**

```env
VITE_API_BASE_URL=https://sua-api-publica.com
```

**Importância didática:**

- mostra como separar configuração de código;
- ensina boas práticas de deploy;
- facilita troca de ambiente sem alterar a aplicação.

---

## Tecnologias usadas e como elas foram aplicadas

### React

O React foi usado para construir a interface do utilizador com componentes reutilizáveis.

**Onde aparece no projeto:**

- páginas de login, cadastro, perfil e aulas;
- componentes como navbar, footer e rotas protegidas;
- contexto de autenticação.

**No deploy:**

- React gera a interface que será empacotada como arquivos estáticos;
- esses arquivos são publicados no GitHub Pages.

---

### Vite

O Vite foi usado como ferramenta de build e ambiente de desenvolvimento frontend.

**Funções principais no projeto:**

- servidor local de desenvolvimento;
- bundling otimizado para produção;
- geração da pasta `dist` para deploy.

**No deploy:**

- `npm run build` gera a versão final da aplicação;
- a pasta `dist` é enviada ao GitHub Pages pelo workflow.

---

### React Router

Foi usado para navegação entre páginas do sistema.

**O que mudou para o deploy:**

- troca de `BrowserRouter` para `HashRouter`;
- isso torna a aplicação mais confiável em hospedagem estática.

**Aprendizado importante:**

A escolha do router depende do tipo de hospedagem. Em servidor tradicional, `BrowserRouter` é ótimo. Em host estático, `HashRouter` costuma ser mais simples.

---

### Spring Boot

O Spring Boot foi usado para construir a API do sistema.

**Responsabilidades principais:**

- autenticação;
- cadastro de utilizadores;
- perfis de aluno e professor;
- gestão de aulas e disciplinas;
- envio e leitura de dados do banco.

**No deploy:**

- o backend é separado do frontend;
- precisa estar acessível por uma URL pública;
- deve usar variáveis de ambiente para dados sensíveis.

---

### Spring Security

O Spring Security foi usado para proteger a aplicação.

**O que ele faz no projeto:**

- controla acesso a rotas;
- valida autenticação por JWT;
- permite liberar endpoints públicos como login e cadastro;
- mantém as rotas protegidas apenas para utilizadores autenticados.

**No deploy:**

- continua sendo essencial, porque a API estará exposta pela internet;
- sem segurança, qualquer pessoa poderia acessar dados protegidos.

---

### JWT

O JWT foi usado para autenticação baseada em token.

**Como funciona no projeto:**

- o utilizador faz login;
- o backend devolve um token;
- o frontend salva o token na sessão;
- chamadas futuras incluem o token no cabeçalho `Authorization`.

**Vantagem no deploy:**

- o frontend pode permanecer estático;
- o backend continua identificando o utilizador com segurança;
- não é necessário manter sessão tradicional no servidor.

---

### PostgreSQL

O PostgreSQL foi usado como banco relacional para armazenar dados do sistema.

**Tipo de dados armazenados:**

- utilizadores;
- professores;
- alunos;
- disciplinas;
- trimestres;
- materiais/aulas;
- progresso do aluno.

**No deploy:**

- precisa estar num servidor acessível pela API;
- idealmente deve ficar em serviço gerido;
- em produção, não é recomendado depender de banco local.

---

### CORS

O CORS foi configurado no backend para permitir que frontend e backend estejam em domínios diferentes.

**Exemplo real do projeto:**

- frontend no GitHub Pages;
- backend em outro host;
- navegador exige permissão explícita para as chamadas funcionarem.

---

### GitHub Actions

O GitHub Actions foi usado para criar o fluxo automático de build e deploy.

**O que ele automatiza:**

- instalação de dependências;
- build do frontend;
- publicação em GitHub Pages.

**Benefício didático:**

Mostra no projeto um cenário real de integração contínua e deploy contínuo.

---

## Fluxo prático do deploy preparado

### Frontend

1. O código é enviado para o GitHub.
2. O workflow roda automaticamente.
3. O Vite gera a build.
4. A build é publicada no GitHub Pages.
5. O utilizador acessa a URL pública.

### Backend

1. O backend é publicado em uma plataforma própria.
2. As variáveis de ambiente são definidas no host.
3. A API fica disponível publicamente.
4. O frontend chama essa URL por `VITE_API_BASE_URL`.

### Banco de dados

1. O PostgreSQL deve estar acessível pelo backend.
2. As credenciais são configuradas por ambiente.
3. A aplicação passa a persistir dados fora da máquina local.

---

## O que foi aprendido com esse processo

### 1. Aplicação local não é o mesmo que produção

Funcionar em `localhost` não significa estar pronta para internet. Em produção, entram em cena:

- URL pública;
- CORS;
- variáveis de ambiente;
- segurança;
- roteamento diferente;
- persistência de dados.

### 2. Configuração deve ser separada do código

É uma boa prática não deixar URLs, senhas e segredos fixos no código.

Isso facilita:

- manutenção;
- troca de ambiente;
- segurança;
- reutilização da aplicação.

### 3. O tipo de hospedagem influencia a tecnologia

O tipo de router, o build do frontend e a estratégia de deploy dependem da infraestrutura escolhida.

### 4. Segurança continua importante mesmo no deploy

Publicar a aplicação não significa retirar proteção. Pelo contrário:

- JWT continua sendo necessário;
- CORS precisa estar certo;
- credenciais não devem ficar no código;
- o banco deve estar protegido.

### 5. Automatizar economiza tempo e reduz erros

Com GitHub Actions, o deploy fica mais confiável e profissional.

---

## Como explicar isso ao professor

Uma forma simples e correta de apresentar o trabalho é dizer:

> “O projeto foi preparado para produção separando frontend e backend, usando React com Vite no frontend e Spring Boot no backend. O frontend foi ajustado para funcionar em hospedagem estática com GitHub Pages, o backend passou a usar variáveis de ambiente e CORS para aceitar a origem externa, e o deploy do frontend foi automatizado com GitHub Actions.”

Se quiser aprofundar, você pode destacar:

- o uso de JWT para autenticação;
- o uso de PostgreSQL para persistência;
- o uso de CORS para integração entre domínios;
- o uso de variáveis de ambiente para segurança;
- o uso de GitHub Actions para automação.

---

## Pontos que ainda dependem de configuração externa

Mesmo com o projeto preparado, o deploy completo ainda exige:

- uma URL pública para o backend;
- criação do banco PostgreSQL em ambiente acessível;
- definição da variável `VITE_API_BASE_URL` no GitHub;
- ativação do GitHub Pages no repositório;
- validação final do domínio e do CORS.

---

## Conclusão

A preparação para deploy trouxe melhorias importantes ao projeto:

- eliminou dependência de `localhost` no frontend;
- tornou a aplicação compatível com hospedagem estática;
- reforçou a configuração segura do backend;
- separou claramente desenvolvimento e produção;
- introduziu automação com GitHub Actions;
- criou uma base muito melhor para apresentação acadêmica e evolução futura.

Este documento resume não só o que foi feito, mas também o porquê de cada decisão.

---

## Próximo passo recomendado

O próximo passo natural é publicar o backend em um serviço com URL pública e depois apontar o frontend para essa URL via `VITE_API_BASE_URL`.

---

## Preciso fazer rebuild depois de cada atualização?

Depende de qual parte da aplicação foi alterada.

### Frontend publicado no GitHub Pages

Se a alteração estiver dentro da pasta `Front/` e o repositório estiver com o workflow do GitHub Actions ativo, o rebuild acontece automaticamente quando você faz `push` para a branch configurada, normalmente `main`.

Nesse cenário, você **não precisa fazer rebuild manualmente no GitHub**. Basta enviar as alterações para o repositório, e o workflow executa:

1. instalação das dependências;
2. build com Vite;
3. publicação da nova versão no GitHub Pages.

### Quando ainda é necessário rebuild manual

Você pode precisar executar `npm run build` localmente quando:

- quiser testar se a aplicação compila antes de subir;
- estiver a desenvolver localmente e quiser verificar o resultado final;
- o workflow do GitHub Actions estiver desativado ou com erro;
- tiver alterado algo que precisa validar antes do commit.

### Alterações que exigem atenção especial

Algumas mudanças podem exigir novo build do frontend porque são lidas no momento da compilação:

- alteração de `VITE_API_BASE_URL` no GitHub;
- mudança na URL pública da API;
- alteração de variáveis de ambiente usadas no frontend;
- mudanças no roteamento ou base da aplicação.

### Backend

Se a alteração for no backend, o frontend só precisa de rebuild se a interface com a API tiver mudado de forma que afete o código React. Caso contrário, o backend pode ser publicado separadamente.

### Resposta curta

- **Mudou o frontend?** o GitHub Actions faz o rebuild automaticamente após o push.
- **Mudou só o backend?** rebuild do frontend normalmente não é necessário.
- **Mudou variável de ambiente do frontend?** precisa de novo build.

Em resumo: no fluxo que foi preparado, a ideia é que a atualização fique automática no frontend após o envio do código para o GitHub, desde que o workflow esteja funcionando corretamente.

