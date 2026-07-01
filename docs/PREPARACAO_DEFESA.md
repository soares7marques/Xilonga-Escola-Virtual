# Preparacao Para Defesa - Xilonga

## 1. Visao geral do projeto

O Xilonga e uma plataforma web de apoio ao ensino. A aplicacao organiza classes, disciplinas, professores, alunos e aulas em video. O objetivo principal e permitir que o professor disponibilize conteudo de acordo com a sua classe, disciplina e semestre, enquanto o aluno acessa apenas as aulas da classe em que esta inscrito.

## 2. Problema resolvido

Muitas escolas precisam de uma forma simples de organizar conteudos digitais por nivel de ensino. O Xilonga resolve isso com:

- Cadastro centralizado de classes, disciplinas, semestres e professores.
- Associacao de cada professor a uma unica classe e uma unica disciplina.
- Upload de videos por disciplina e semestre.
- Area do aluno focada em assistir aulas.
- Controle de acesso por perfil de utilizador.

## 3. Perfis de utilizador

### Administrador

O administrador e responsavel pela configuracao academica do sistema.

Funcionalidades:

- Cadastrar classes.
- Cadastrar disciplinas associadas a uma classe.
- Cadastrar semestres globais, limitados a 3.
- Cadastrar professores.
- Associar professor a uma classe e disciplina.
- Consultar totais de alunos, professores, classes e semestres.

### Professor

O professor trabalha apenas com a sua propria classe e disciplina.

Funcionalidades:

- Acessar o dashboard do professor.
- Ver a sua classe e disciplina preenchidas automaticamente.
- Selecionar semestre cadastrado.
- Enviar video de aula com limite de 10 MB.
- Consultar materiais enviados.

Regra importante:

- Mesmo que o frontend seja manipulado, o backend usa a classe e disciplina do professor autenticado. Isso impede envio de video para disciplina indevida.

### Aluno

O aluno usa a plataforma para estudar.

Funcionalidades:

- Inscrever-se numa classe.
- Ver disciplinas da classe inscrita.
- Escolher disciplina e semestre.
- Assistir videos disponibilizados pelo professor.
- Acompanhar progresso local das aulas abertas.

## 4. Funcionalidades principais

### Cadastro de classe

O administrador cria uma classe com nome e descricao. Essa classe sera usada para organizar disciplinas, professores e inscricoes de alunos.

### Cadastro de disciplina

A disciplina e criada sempre associada a uma classe. Isso permite que a mesma disciplina possa existir em classes diferentes, mantendo a organizacao por nivel.

### Cadastro de semestre

Os semestres sao globais e servem para todas as classes e disciplinas. O sistema limita o total a 3 semestres, conforme a regra da aplicacao.

### Cadastro de professor

O professor recebe:

- Dados pessoais.
- Email e senha de acesso.
- Classe.
- Disciplina.

O sistema garante que o professor fica associado a apenas uma classe e uma disciplina.

### Upload de video

O professor envia uma aula em video informando titulo e semestre. O sistema valida:

- Se o ficheiro e video.
- Se o tamanho nao passa de 10 MB.
- Se o semestre existe.
- Se o professor esta autenticado.

O ficheiro fica guardado na maquina local e o banco guarda os metadados, incluindo caminho do ficheiro.

### Visualizacao de aulas

O aluno acessa somente aulas relacionadas a sua classe. Ao escolher disciplina e semestre, o sistema carrega os materiais do backend.

## 5. Segurança aplicada

### Autenticacao com JWT

O login gera um token JWT. Esse token e enviado nas requisicoes protegidas pelo frontend.

Vantagens:

- O backend nao precisa manter sessao em memoria.
- Cada requisicao pode ser validada pelo token.
- O sistema consegue identificar o utilizador autenticado.

### Senhas encriptadas

As senhas sao gravadas usando `BCryptPasswordEncoder`. Isso evita guardar senhas em texto claro no banco de dados.

### Rotas protegidas

O Spring Security protege as rotas do backend. Apenas algumas rotas publicas ficam liberadas, como cadastro inicial e login. As demais exigem token valido.

### Controle por perfil

O utilizador possui `role`, como ADMIN, PROFESSOR ou ALUNO. O frontend usa essa informacao para encaminhar o utilizador para sua area correta.

### Associacao segura do professor

No upload de video, o backend nao confia na classe/disciplina enviada pelo navegador. Ele consulta o perfil do professor autenticado e usa esses dados. Isso reduz risco de envio indevido.

### Validacao de upload

O upload possui:

- Limite de 10 MB no frontend.
- Limite de 10 MB no backend.
- Validacao de tipo MIME `video/*`.
- Nome de ficheiro salvo com UUID para reduzir conflito.

### CORS

O backend aceita requisicoes do frontend local configurado. Em producao, o CORS deve ser ajustado para o dominio real.

## 6. Banco de dados

O sistema usa PostgreSQL. As principais entidades sao:

- `utilizador`
- `admin`
- `aluno`
- `professor`
- `classe`
- `disciplina`
- `semestre`
- `inscricao`
- `material_aula`

Relacoes principais:

- Um utilizador pode ser administrador, professor ou aluno.
- Uma classe tem varias disciplinas.
- Um professor pertence a uma classe e uma disciplina.
- Um aluno pode inscrever-se numa classe.
- Um material de aula pertence a classe, disciplina e semestre definidos pelo professor.

## 7. Arquitetura tecnica

### Frontend

Tecnologias:

- React.
- Vite.
- React Router.

Responsabilidades:

- Interface do administrador, professor e aluno.
- Formularios de cadastro.
- Upload de video.
- Consumo da API.

### Backend

Tecnologias:

- Java 17.
- Spring Boot.
- Spring Security.
- Spring Data JPA.
- PostgreSQL.

Responsabilidades:

- Autenticacao.
- Regras de negocio.
- Persistencia de dados.
- Upload e leitura de videos.
- Protecao das rotas.

### Armazenamento de videos

O video fica na maquina local. O banco guarda o caminho e os metadados. Para producao com muitos utilizadores, recomenda-se evoluir para Amazon S3.

## 8. Pontos fortes para apresentar

- Separacao clara entre frontend e backend.
- Uso de autenticação JWT.
- Senhas protegidas com BCrypt.
- Upload com validacao de tamanho e tipo.
- Remocao de dados estaticos do frontend.
- Conteudos carregados do backend.
- Regra forte: professor nao escolhe livremente a disciplina no upload; o backend aplica a disciplina cadastrada para ele.
- Documentacao tecnica criada para configuracao, modelo relacional e deploy.

## 9. Limitacoes e melhorias futuras

- Migrar videos do filesystem local para Amazon S3.
- Melhorar autorizacao por role diretamente no backend com regras por endpoint.
- Criar testes automatizados para services e controllers.
- Transformar alguns campos textuais de `material_aula` em chaves estrangeiras.
- Criar painel de acompanhamento de progresso persistido no banco.
- Melhorar logs e monitoramento para producao.

## 10. Roteiro sugerido para apresentacao

1. Apresentar o problema.
2. Explicar a solucao proposta.
3. Mostrar os perfis: administrador, professor e aluno.
4. Demonstrar cadastro de classe, disciplina e semestre.
5. Demonstrar cadastro de professor.
6. Entrar como professor e enviar video.
7. Entrar como aluno e assistir aula.
8. Explicar seguranca: JWT, BCrypt, rotas protegidas e validacao de upload.
9. Explicar modelo relacional.
10. Concluir com melhorias futuras.

## 11. Respostas curtas para perguntas provaveis

### Por que JWT?

Porque permite autenticar requisicoes sem manter sessao no servidor, tornando a API mais simples para frontend separado.

### Por que BCrypt?

Porque evita armazenar senhas em texto puro e aplica hashing adequado para credenciais.

### Por que limitar upload a 10 MB?

Para proteger armazenamento, rede e desempenho da aplicacao durante os testes e uso inicial.

### Por que guardar video localmente?

Porque e uma solucao simples para a primeira versao. Para producao escalavel, a recomendacao e migrar para S3.

### Como garantir que o professor envia video para a disciplina correta?

O backend busca a classe e disciplina do professor autenticado e usa esses dados no cadastro do material, em vez de confiar no frontend.
