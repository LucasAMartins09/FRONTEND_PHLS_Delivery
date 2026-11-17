/* PHLS Delivery - cadastro.js
   Cadastro: máscaras, validação dos campos e criação da conta. */

// Máscaras: CPF e telefone aceitam só números; nome aceita só letras
ligarMascara('nome', somenteLetras);
ligarMascara('cpf', mascaraCPF);
ligarMascara('telefone', mascaraTelefone);

// Confere cada campo. Retorna o texto do erro ou '' se estiver certo.
function erroNome(valor) {
  if (valor.trim() === '') return 'Informe seu nome completo.';
  if (!valor.trim().includes(' ')) return 'Digite nome e sobrenome.';
  return '';
}

function erroEmail(valor) {
  if (valor === '') return 'Informe seu e-mail.';
  if (!valor.includes('@') || !valor.includes('.')) return 'E-mail inválido. Ex.: nome@email.com';
  for (const usuario of pegarUsuarios()) {
    if (usuario.email === valor) return 'Este e-mail já está cadastrado.';
  }
  return '';
}

// O CPF não pode se repetir (no banco, a coluna cpf é UNIQUE)
function erroCPF(valor) {
  if (somenteNumeros(valor).length !== 11) return 'CPF incompleto. Use o formato 000.000.000-00';
  for (const usuario of pegarUsuarios()) {
    if (usuario.cpf === valor) return 'Este CPF já está cadastrado.';
  }
  return '';
}

function erroTelefone(valor) {
  if (somenteNumeros(valor).length < 10) return 'Telefone incompleto. Use (00) 00000-0000';
  return '';
}

function erroSenha(valor) {
  if (valor.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  return '';
}

function erroConfirmacao(valor, senha) {
  if (valor === '') return 'Confirme sua senha.';
  if (valor !== senha) return 'As senhas não coincidem.';
  return '';
}

function criarConta(evento) {
  evento.preventDefault();

  // Pega os campos do formulário
  const nome = document.getElementById('nome');
  const email = document.getElementById('email');
  const cpf = document.getElementById('cpf');
  const telefone = document.getElementById('telefone');
  const senha = document.getElementById('senha');
  const confirmar = document.getElementById('confirmar-senha');
  email.value = email.value.trim().toLowerCase();

  // Confere cada campo e conta quantos estão com erro
  let quantidadeErros = 0;
  quantidadeErros += verificar(nome, erroNome(nome.value));
  quantidadeErros += verificar(email, erroEmail(email.value));
  quantidadeErros += verificar(cpf, erroCPF(cpf.value));
  quantidadeErros += verificar(telefone, erroTelefone(telefone.value));
  quantidadeErros += verificar(senha, erroSenha(senha.value));
  quantidadeErros += verificar(confirmar, erroConfirmacao(confirmar.value, senha.value));

  const resumo = document.getElementById('resumo-erros');
  if (quantidadeErros > 0) {
    resumo.innerHTML = '<b>Corrija os campos destacados</b>' + quantidadeErros + ' campo(s) precisam de atenção antes de criar a conta.';
    resumo.hidden = false;
    return;
  }
  resumo.hidden = true;

  // Tudo certo: salva o novo usuário (mesmos campos da tabela usuario) e já faz o login
  const usuarios = pegarUsuarios();
  const novoUsuario = {
    id_usuario: proximoId(usuarios, 'id_usuario'),
    nome: nome.value.trim(),
    email: email.value,
    cpf: cpf.value,
    telefone: telefone.value,
    senha: senha.value, // DEMONSTRAÇÃO: senha em texto, NÃO é seguro. No banco real vai só o hash.
    tipo: 'CLIENTE',
    criado_em: dataAtualMySQL()
  };
  usuarios.push(novoUsuario);
  salvarLocal('phls_usuarios', usuarios);
  salvarLocal('phls_sessao', novoUsuario.id_usuario);

  mostrarAviso('Conta criada com sucesso! Agora cadastre seu endereço.');
  setTimeout(function () {
    window.location.href = 'perfil.html#enderecos';
  }, 1500);
}

// "Voltar ao login": abre a janela de login nesta mesma página
function irParaLogin(evento) {
  evento.preventDefault();
  abrirLogin();
}

document.getElementById('form-cadastro').addEventListener('submit', criarConta);
document.getElementById('voltar-login').addEventListener('click', irParaLogin);
document.getElementById('link-login').addEventListener('click', irParaLogin);
