/* PHLS Delivery - perfil.js
   Perfil: dados pessoais (editar e salvar) e endereços de entrega. */

let usuario = usuarioLogado();
let enderecoEmEdicao = 0; // 0 = novo endereço; outro número = id_endereco que está sendo editado


/* ---------- Dados pessoais ---------- */

function mostrarPerfil() {
  if (!usuario) {
    document.getElementById('sem-login').hidden = false;
    abrirLogin();
    return;
  }
  document.getElementById('perfil').hidden = false;
  document.getElementById('perfil-avatar').textContent = iniciais(usuario.nome);
  document.getElementById('perfil-nome').textContent = usuario.nome;
  document.getElementById('perfil-desde').textContent = 'Cliente desde ' + usuario.criado_em.slice(0, 4);

  document.getElementById('perfil-campo-nome').value = usuario.nome;
  document.getElementById('perfil-email').value = usuario.email;
  document.getElementById('perfil-cpf').value = usuario.cpf;
  document.getElementById('perfil-telefone').value = usuario.telefone;
  mostrarEnderecos();
}

// Libera os campos que podem ser alterados (e-mail e CPF não mudam)
function editarDados() {
  document.getElementById('perfil-campo-nome').readOnly = false;
  document.getElementById('perfil-telefone').readOnly = false;
  document.getElementById('btn-salvar').disabled = false;
  document.getElementById('perfil-campo-nome').focus();
}

function salvarDadosPessoais(evento) {
  evento.preventDefault();
  const nome = document.getElementById('perfil-campo-nome');
  const telefone = document.getElementById('perfil-telefone');

  let erroNome = '';
  if (!nome.value.trim().includes(' ')) erroNome = 'Digite nome e sobrenome.';
  let erroTelefone = '';
  if (somenteNumeros(telefone.value).length < 10) erroTelefone = 'Telefone incompleto.';

  marcarCampo(nome, erroNome);
  marcarCampo(telefone, erroTelefone);
  if (erroNome || erroTelefone) return;

  usuario.nome = nome.value.trim();
  usuario.telefone = telefone.value;
  atualizarUsuario(usuario);

  // Volta a travar os campos
  nome.readOnly = true;
  telefone.readOnly = true;
  nome.classList.remove('valido');
  telefone.classList.remove('valido');
  document.getElementById('btn-salvar').disabled = true;
  document.getElementById('perfil-nome').textContent = usuario.nome;
  document.getElementById('perfil-avatar').textContent = iniciais(usuario.nome);
  atualizarCabecalho();
  mostrarAviso('Dados atualizados!');
}


/* ---------- Endereços (tabela endereco) ---------- */

function mostrarEnderecos() {
  const enderecos = pegarEnderecosDoUsuario(usuario.id_usuario);
  const lista = document.getElementById('lista-enderecos');
  if (enderecos.length === 0) {
    lista.innerHTML = '<p class="suave">Nenhum endereço cadastrado. Adicione um para poder finalizar pedidos.</p>';
    return;
  }

  let html = '';
  for (const endereco of enderecos) {
    html = html + `
      <div class="endereco-item">
        <div class="endereco-texto">${htmlEndereco(endereco)}</div>
        <div class="endereco-botoes">
          <button onclick="abrirFormEndereco(${endereco.id_endereco})" aria-label="Editar endereço">
            <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
          </button>
          <button onclick="excluirEndereco(${endereco.id_endereco})" aria-label="Excluir endereço">
            <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
          </button>
        </div>
      </div>`;
  }
  lista.innerHTML = html;
}

// idEndereco = 0 para um endereço novo, ou o id do endereço a editar
function abrirFormEndereco(idEndereco) {
  enderecoEmEdicao = idEndereco;
  let endereco = { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' };
  if (idEndereco !== 0) endereco = buscarEndereco(idEndereco);

  document.getElementById('end-rua').value = endereco.rua;
  document.getElementById('end-numero').value = endereco.numero;
  document.getElementById('end-bairro').value = endereco.bairro;
  document.getElementById('end-cidade').value = endereco.cidade;
  document.getElementById('end-estado').value = endereco.estado;
  document.getElementById('end-cep').value = endereco.cep;

  document.getElementById('form-endereco').hidden = false;
  document.getElementById('btn-novo-endereco').hidden = true;
  document.getElementById('end-rua').focus();
}

function fecharFormEndereco() {
  document.getElementById('form-endereco').hidden = true;
  document.getElementById('btn-novo-endereco').hidden = false;
}

// Confere os campos do endereço e devolve quantos estão com erro
function validarEndereco() {
  let erros = 0;
  for (const id of ['end-rua', 'end-numero', 'end-bairro', 'end-cidade']) {
    const campo = document.getElementById(id);
    let mensagem = '';
    if (campo.value.trim() === '') mensagem = 'Campo obrigatório.';
    erros += verificar(campo, mensagem);
  }
  const estado = document.getElementById('end-estado');
  let erroEstado = '';
  if (estado.value.length !== 2) erroEstado = 'Use a sigla, ex.: MG';
  erros += verificar(estado, erroEstado);

  const cep = document.getElementById('end-cep');
  let erroCep = '';
  if (somenteNumeros(cep.value).length !== 8) erroCep = 'CEP incompleto. Use 00000-000';
  erros += verificar(cep, erroCep);
  return erros;
}

function salvarEndereco(evento) {
  evento.preventDefault();
  if (validarEndereco() > 0) return;

  const todos = lerLocal('phls_enderecos', []);
  const endereco = {
    id_endereco: enderecoEmEdicao,
    id_usuario: usuario.id_usuario,
    rua: document.getElementById('end-rua').value.trim(),
    numero: document.getElementById('end-numero').value.trim(),
    bairro: document.getElementById('end-bairro').value.trim(),
    cidade: document.getElementById('end-cidade').value.trim(),
    estado: document.getElementById('end-estado').value,
    cep: document.getElementById('end-cep').value
  };

  if (enderecoEmEdicao === 0) {
    // Novo endereço: recebe o próximo id
    endereco.id_endereco = proximoId(todos, 'id_endereco');
    todos.push(endereco);
  } else {
    // Edição: troca o endereço que tem o mesmo id
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].id_endereco === enderecoEmEdicao) todos[i] = endereco;
    }
  }
  salvarLocal('phls_enderecos', todos);
  fecharFormEndereco();
  mostrarEnderecos();
  mostrarAviso('Endereço salvo!');
}

// Um endereço usado em pedido não pode ser excluído (igual à chave estrangeira do banco)
function enderecoFoiUsado(idEndereco) {
  for (const pedido of lerLocal('phls_pedidos', [])) {
    if (pedido.id_endereco === idEndereco) return true;
  }
  return false;
}

function excluirEndereco(idEndereco) {
  if (enderecoFoiUsado(idEndereco)) {
    mostrarAviso('Este endereço já foi usado em um pedido e não pode ser excluído.');
    return;
  }
  if (!confirm('Excluir este endereço?')) return;

  const todos = lerLocal('phls_enderecos', []);
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id_endereco === idEndereco) {
      todos.splice(i, 1);
      break;
    }
  }
  salvarLocal('phls_enderecos', todos);
  mostrarEnderecos();
}


/* ---------- Menu lateral ---------- */

// Destaca o item do menu que foi clicado (Meus dados ou Endereços)
function marcarMenu(evento) {
  for (const link of document.querySelectorAll('.perfil-menu a')) {
    link.classList.remove('ativo');
  }
  evento.currentTarget.classList.add('ativo');
}


/* ---------- Ligar os botões ---------- */

document.getElementById('menu-dados').addEventListener('click', marcarMenu);
document.getElementById('menu-enderecos').addEventListener('click', marcarMenu);

ligarMascara('perfil-campo-nome', somenteLetras);
ligarMascara('perfil-telefone', mascaraTelefone);
ligarMascara('end-cep', mascaraCEP);
ligarMascara('end-estado', mascaraUF);
document.getElementById('btn-editar').addEventListener('click', editarDados);
document.getElementById('form-perfil').addEventListener('submit', salvarDadosPessoais);
document.getElementById('btn-novo-endereco').addEventListener('click', function () { abrirFormEndereco(0); });
document.getElementById('btn-cancelar-endereco').addEventListener('click', fecharFormEndereco);
document.getElementById('form-endereco').addEventListener('submit', salvarEndereco);
document.getElementById('btn-sair').addEventListener('click', sairDaConta);

mostrarPerfil();
