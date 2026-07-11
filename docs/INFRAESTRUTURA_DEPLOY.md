# Infraestrutura e Deploy - Xilonga

## Arquitetura recomendada

A aplicacao possui tres partes:

- Frontend React/Vite.
- Backend Spring Boot.
- Banco de dados PostgreSQL.

Para producao, recomenda-se separar responsabilidades:

- Frontend servido por Nginx, S3/CloudFront ou outro servidor estatico.
- Backend executado em servidor Linux, container Docker, ECS, Elastic Beanstalk ou instancia EC2.
- PostgreSQL em servico gerido, preferencialmente Amazon RDS.
- Videos em volume persistente local ou, em evolucao futura, Amazon S3.

## Ambiente minimo em servidor Linux

Componentes:

- Ubuntu Server LTS.
- Java 17.
- Node.js apenas se o build do frontend for feito no servidor.
- Nginx como reverse proxy.
- PostgreSQL local ou RDS.
- Diretorio persistente para videos, por exemplo `/var/xilonga/uploads/aulas`.

Variaveis/configuracoes importantes:

```properties
spring.datasource.url=jdbc:postgresql://HOST:5432/xilongaBD
spring.datasource.username=USUARIO
spring.datasource.password=SENHA
app.jwt.secret=SEGREDO_FORTE_COM_MAIS_DE_32_CARACTERES
app.upload.aulas-dir=/var/xilonga/uploads/aulas
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

Permissoes:

```bash
sudo mkdir -p /var/xilonga/uploads/aulas
sudo chown -R appuser:appuser /var/xilonga
```

## Deploy com Docker recomendado

Criar imagens separadas:

- `xilonga-backend`: empacota o Spring Boot.
- `xilonga-frontend`: faz build Vite e serve `dist` via Nginx.

Servicos:

- `backend` exposto internamente na porta 8080.
- `frontend` exposto na porta 80/443.
- `postgres` apenas em ambiente local; em producao usar RDS quando possivel.
- volume persistente montado em `/var/xilonga/uploads/aulas`.

## Reverse proxy Nginx

Exemplo conceitual:

```nginx
server {
    listen 80;
    server_name exemplo.com;

    location / {
        root /var/www/xilonga;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Se usar `/api`, o frontend deve apontar `API_BASE_URL` para `/api` ou para o dominio do backend.

## Preparacao do GitHub

### Estrutura esperada

```text
/
  Front/
  back/demo/
  docs/
  docker-compose.yml
```

### Branches

- `main`: codigo pronto para producao.
- `develop`: integracao de funcionalidades.
- branches curtas para tarefas: `feature/trimestres`, `fix/upload-video`, etc.

### Secrets do GitHub Actions

Configurar em `Settings > Secrets and variables > Actions`:

- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `UPLOAD_DIR`
- `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN`, se publicar imagens.

Nunca commitar senhas reais no repositorio.

## Pipeline CI recomendado

Em cada push ou pull request:

1. Instalar dependencias do frontend.
2. Rodar `npm run build` em `Front`.
3. Rodar `./mvnw -DskipTests compile` em `back/demo`.
4. Opcional: subir PostgreSQL de teste e rodar `./mvnw test`.
5. Gerar artefatos ou imagens Docker.

## Pipeline CD recomendado

Ao fazer merge na `main`:

1. Buildar imagem do backend.
2. Buildar imagem do frontend.
3. Publicar imagens no registry.
4. Acessar servidor via SSH ou acionar ECS/Beanstalk.
5. Atualizar containers.
6. Executar health check.
7. Manter versao anterior disponivel para rollback.

## Exemplo de GitHub Actions CI

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Build frontend
        working-directory: Front
        run: |
          npm ci
          npm run build

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - name: Compile backend
        working-directory: back/demo
        run: ./mvnw -DskipTests compile
```

## Checklist antes do deploy

- Banco PostgreSQL criado e acessivel pelo backend.
- `app.jwt.secret` alterado para segredo forte.
- CORS ajustado para o dominio real do frontend.
- Pasta de upload criada e persistente.
- HTTPS configurado.
- Backups do banco ativos.
- Logs do backend armazenados e monitorados.
- Limite de upload validado em frontend, backend e proxy.

## Observacao sobre videos

Hoje a aplicacao guarda videos no filesystem local. Para ambiente com mais de um servidor, isso exige volume compartilhado ou migracao para S3. A recomendacao para escalar e guardar o ficheiro no S3 e manter no banco apenas a chave/caminho do objeto.
