# Documentacao de Configuracao - Xilonga

## Requisitos

- Java 17
- Maven ou o wrapper `mvnw` incluido no backend
- Node.js compativel com Vite 7
- Docker e Docker Compose para executar o PostgreSQL

## Banco de dados

O projeto usa PostgreSQL. O arquivo `docker-compose.yml` cria o banco com:

- Banco: `xilongaBD`
- Usuario: `postgres`
- Senha: `xilonga123`
- Porta: `5432`

Para iniciar:

```bash
docker compose up -d
```

## Backend

Configuracao principal: `back/demo/src/main/resources/application.properties`.

Valores atuais:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/xilongaBD
spring.datasource.username=postgres
spring.datasource.password=xilonga123
spring.jpa.hibernate.ddl-auto=update
app.upload.aulas-dir=uploads/aulas
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

Para executar:

```bash
cd back/demo
./mvnw spring-boot:run
```

O backend sobe em `http://localhost:8080`.

## Frontend

Configuracao principal da API: `Front/src/services/api.js`.

O frontend espera o backend em:

```js
http://localhost:8080
```

Para instalar dependencias e executar:

```bash
cd Front
npm install
npm run dev
```

O Vite disponibiliza a aplicacao em `http://localhost:5173`.

## Armazenamento de videos

O upload de aulas segue esta regra:

- O video fica guardado na maquina local, na pasta configurada em `app.upload.aulas-dir`.
- O banco de dados guarda os metadados: classe, disciplina, semestre, titulo, nome original, nome salvo, caminho local, content type, tamanho e email do professor.
- O limite por ficheiro e 10 MB.

Em ambiente de producao, configure `app.upload.aulas-dir` para um diretorio persistente com permissao de escrita para o processo Java.

## Fluxo inicial recomendado

1. Iniciar PostgreSQL com Docker Compose.
2. Iniciar o backend.
3. Iniciar o frontend.
4. Cadastrar administrador, classes e disciplinas.
5. Cadastrar os semestres globais usados pelas aulas.
6. Cadastrar professores associados a uma classe e uma disciplina.
7. Cadastrar ou inscrever alunos.
8. Entrar como professor e enviar videos.
9. Entrar como aluno para assistir as aulas.

## Endpoints principais

- `POST /utilizador/login`: autenticacao.
- `POST /adminn/registerClasse`: cria classe.
- `GET /adminn/listaClasse`: lista classes.
- `POST /adminn/registerDisciplina`: cria disciplina.
- `GET /adminn/listaDisciplina`: lista disciplinas.
- `POST /adminn/registerSemestre`: cria semestre global, limitado a 3 registros.
- `GET /adminn/listaSemestre`: lista semestres.
- `POST /adminn/registerProfessor`: cria professor.
- `GET /professor/perfil`: retorna classe e disciplina do professor autenticado.
- `GET /professor/semestres`: lista semestres cadastrados.
- `POST /professor/materiais`: envia aula em video.
- `GET /professor/materiais`: lista aulas.
- `GET /professor/materiais/{id}/video`: reproduz video.
- `POST /aluno/inscricao`: inscreve aluno numa classe.
- `GET /aluno/perfil`: consulta perfil do aluno.
