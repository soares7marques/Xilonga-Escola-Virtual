# Modelo Relacional - Xilonga

## Entidades

### utilizador

Representa a conta de acesso ao sistema.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| nome | VARCHAR(100) | Obrigatorio |
| email | VARCHAR(255) | Obrigatorio; deve ser unico no fluxo de cadastro |
| senha | VARCHAR(255) | Senha encriptada |
| genero | VARCHAR(50) | Obrigatorio |
| telefone | VARCHAR(30) | Obrigatorio |
| role | VARCHAR(50) | ADMIN, PROFESSOR ou ALUNO |

### admin

Representa o administrador da plataforma.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| cargo | VARCHAR(100) | Valor padrao: GestorSite |
| id_utilizador | BIGINT | Chave estrangeira para utilizador.id |

Relacao: um administrador pertence a um utilizador.

### aluno

Representa o perfil academico do aluno.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| pontuacao | VARCHAR(50) | Valor padrao: 0 |
| id_utilizador | BIGINT | Chave estrangeira para utilizador.id |

Relacao: um aluno pertence a um utilizador.

### professor

Representa o professor e a sua atribuicao academica.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| id_utilizador | BIGINT | Chave estrangeira para utilizador.id |
| id_classe | BIGINT | Chave estrangeira para classe.id |
| id_disciplina | BIGINT | Chave estrangeira para disciplina.id |

Regras:

- Um professor deve ter apenas uma classe.
- Um professor deve ter apenas uma disciplina.
- Um utilizador com role PROFESSOR deve ter no maximo um registo em professor.
- A disciplina selecionada deve pertencer a classe selecionada.

### classe

Representa uma classe ou nivel de estudo.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| nome | VARCHAR(100) | Nome da classe |
| descricao | VARCHAR(255) | Descricao da classe |

### disciplina

Representa uma disciplina associada a uma classe.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| nome | VARCHAR(100) | Nome da disciplina |
| id_classe | BIGINT | Chave estrangeira para classe.id |

Relacao: uma classe pode ter varias disciplinas; cada disciplina pertence a uma classe.

### trimestre

Representa os trimestres globais usados por todas as classes e disciplinas.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| nome | VARCHAR(100) | Nome unico, exemplo: 1º Trimestre |

Relacao: trimestre e uma tabela global. Ele nao pertence a uma classe especifica.

Regra: o sistema permite no maximo 3 trimestres globais.

### inscricao

Representa a inscricao do aluno numa classe.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| id_aluno | BIGINT | Referencia aluno.id |
| id_classe | BIGINT | Referencia classe.id |

No codigo atual, `id_aluno` e `id_classe` sao campos numericos simples. No modelo relacional fisico, recomenda-se transforma-los em chaves estrangeiras formais.

### material_aula

Representa uma aula em video disponibilizada pelo professor.

| Campo | Tipo sugerido | Observacao |
| --- | --- | --- |
| id | BIGINT | Chave primaria |
| classe | VARCHAR(100) | Nome da classe no momento do upload |
| disciplina | VARCHAR(100) | Nome da disciplina no momento do upload |
| trimestre | VARCHAR(100) | Nome do trimestre cadastrado |
| titulo | VARCHAR(255) | Titulo da aula |
| nome_arquivo | VARCHAR(255) | Nome original do ficheiro |
| nome_arquivo_salvo | VARCHAR(255) | Nome gerado para armazenamento local |
| caminho_arquivo | VARCHAR(500) | Caminho local do video |
| content_type | VARCHAR(100) | Tipo MIME do video |
| tamanho_arquivo | BIGINT | Tamanho em bytes |
| professor_email | VARCHAR(255) | Email do professor que enviou |
| criado_em | TIMESTAMP | Data de criacao |

Regra de armazenamento:

- O banco guarda metadados e caminho.
- O video fica no filesystem configurado em `app.upload.aulas-dir`.
- O tamanho maximo do video e 10 MB.

## Relacoes principais

- `utilizador 1 -> 1 admin`
- `utilizador 1 -> 1 aluno`
- `utilizador 1 -> 1 professor`
- `classe 1 -> N disciplina`
- `classe 1 -> N inscricao`
- `aluno 1 -> N inscricao`
- `classe/disciplina/trimestre -> material_aula` por valores textuais gravados no upload

## Diagrama textual

```text
utilizador
  |-- admin
  |-- aluno -- inscricao -- classe -- disciplina
  |-- professor ----------- classe
             \------------ disciplina

trimestre
  \-- usado globalmente por material_aula

material_aula
  |-- classe
  |-- disciplina
  |-- trimestre
  |-- professor_email
  \-- caminho_arquivo
```

## Melhorias recomendadas para evolucao

- Transformar `material_aula.classe`, `material_aula.disciplina` e `material_aula.trimestre` em chaves estrangeiras para evitar divergencia de texto.
- Transformar `inscricao.idAluno` e `inscricao.idClasse` em relacoes JPA `ManyToOne`.
- Criar indice unico em `disciplina(id_classe, nome)`.
- Criar indice unico em `professor(id_utilizador)`.
