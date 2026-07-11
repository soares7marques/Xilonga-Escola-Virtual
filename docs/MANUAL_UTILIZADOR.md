# Manual do Utilizador - Xilonga

## Visao geral

O Xilonga e uma plataforma de apoio ao estudo onde:

- O administrador cadastra classes, disciplinas e professores.
- O professor disponibiliza aulas em video para a sua classe e disciplina.
- O aluno inscreve-se numa classe e assiste as aulas disponiveis.

## Acesso ao sistema

1. Abra o frontend no navegador.
2. Clique em "Login".
3. Informe email e senha.
4. Depois do login, o sistema encaminha o utilizador conforme o perfil: administrador, professor ou aluno.

## Administrador

### Cadastrar classe

1. Acesse o dashboard do administrador.
2. Selecione a opcao de cadastrar classe.
3. Informe o nome e a descricao da classe.
4. Confirme o cadastro.

### Cadastrar disciplina

1. No dashboard do administrador, abra o formulario de disciplina.
2. Escolha a classe.
3. Informe o nome da disciplina.
4. Confirme o cadastro.

### Cadastrar trimestre

1. No dashboard do administrador, abra a opcao "Criar Trimestre".
2. Informe o nome do trimestre, por exemplo: `1º Trimestre`.
3. Confirme o cadastro.
4. Os trimestres cadastrados ficam disponiveis para todas as classes e disciplinas.
5. O sistema permite no maximo 3 trimestres.

### Cadastrar professor

1. Abra o formulario de professor.
2. Preencha nome, email, senha, telefone e genero.
3. Selecione a classe e a disciplina do professor.
4. Confirme o cadastro.
5. Cada professor fica associado a uma unica classe e uma unica disciplina.

## Professor

### Disponibilizar aula em video

1. Acesse a area do professor.
2. A classe e a disciplina aparecem preenchidas automaticamente de acordo com o cadastro do professor.
3. Selecione o trimestre.
4. Informe o titulo da aula.
5. Escolha um ficheiro de video com tamanho maximo de 10 MB.
6. Clique em "Adicionar Video".
7. O sistema mostra o estado do envio: selecionado, enviando, sucesso ou erro.
8. O video fica associado automaticamente a classe e a disciplina do professor autenticado.

### Consultar materiais

1. Na area do professor, clique em "Materiais".
2. Use o filtro de trimestre se necessario.
3. Veja os videos cadastrados para a disciplina do professor.

## Aluno

### Inscrever-se numa classe

1. Acesse a area de estudo.
2. Pesquise ou escolha a classe desejada.
3. Clique em "Inscrever-se".
4. Depois da inscricao, faca login para acessar as aulas.

### Assistir aulas

1. Acesse a area de aulas.
2. O sistema apresenta as disciplinas da classe em que o aluno esta inscrito.
3. Escolha uma disciplina.
4. Escolha um trimestre com aulas disponiveis.
5. Clique numa aula para assistir ao video.
6. O progresso e atualizado conforme as aulas abertas.

## Observacoes

- A funcionalidade de provas foi removida. O aluno assiste apenas as aulas.
- Se uma lista aparecer vazia, confirme se o administrador cadastrou classe/disciplina e se o professor ja enviou videos.
- Videos acima de 10 MB sao recusados pelo sistema.
