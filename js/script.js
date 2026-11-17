/* =========================================================
   PHLS Delivery - script.js
   Funções usadas em TODAS as páginas:
   armazenamento, apoio, máscaras, usuário, endereços,
   carrinho, cards, tema, cabeçalho e login.
   As funções específicas de cada página ficam no arquivo da página.
   ========================================================= */


/* ---------- 1. Armazenamento (localStorage) ---------- */
// Versão de demonstração: os dados ficam só no navegador.
// O localStorage guarda texto, por isso usamos JSON para listas e objetos.

function lerLocal(chave, valorPadrao) {
  const texto = localStorage.getItem(chave);
  if (texto === null) {
    return valorPadrao;
  }
  return JSON.parse(texto);
}

function salvarLocal(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}


/* ---------- 2. Funções de apoio ---------- */

// 24.9 -> "R$ 24,90"
function formatarPreco(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// Arredonda para 2 casas (evita valores como 90.69999999 em contas com centavos)
function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

// Impede que um texto digitado pelo usuário vire código HTML na página
function textoSeguro(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// "Ana Souza" -> "AS"
function iniciais(nome) {
  const partes = String(nome || '').trim().split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  let letras = partes[0][0];
  if (partes.length > 1) {
    letras = letras + partes[partes.length - 1][0];
  }
  return letras.toUpperCase();
}

// Coloca um zero na frente: 5 -> "05"
function doisDigitos(numero) {
  if (numero < 10) return '0' + numero;
  return String(numero);
}

// Data e hora atuais no formato do MySQL (DATETIME): "2026-11-09 19:42:00"
function dataAtualMySQL() {
  const d = new Date();
  return d.getFullYear() + '-' + doisDigitos(d.getMonth() + 1) + '-' + doisDigitos(d.getDate()) + ' ' +
    doisDigitos(d.getHours()) + ':' + doisDigitos(d.getMinutes()) + ':' + doisDigitos(d.getSeconds());
}

// "2026-11-09 19:42:00" -> "09/11/2026 • 19:42"
function formatarData(dataMySQL) {
  const dia = dataMySQL.slice(8, 10);
  const mes = dataMySQL.slice(5, 7);
  const ano = dataMySQL.slice(0, 4);
  const hora = dataMySQL.slice(11, 16);
  return dia + '/' + mes + '/' + ano + ' • ' + hora;
}

// Próximo número de id de uma lista (faz o papel do AUTO_INCREMENT do MySQL)
function proximoId(lista, nomeDoCampo) {
  let maior = 0;
  for (const registro of lista) {
    if (registro[nomeDoCampo] > maior) maior = registro[nomeDoCampo];
  }
  return maior + 1;
}

// Procura um produto pelo id_produto
function buscarProduto(idProduto) {
  for (const produto of PRODUTOS) {
    if (produto.id_produto === idProduto) return produto;
  }
  return null;
}

// Mostra uma mensagem rápida no rodapé da tela por 3 segundos
let temporizadorAviso; // guarda o temporizador para reiniciar a contagem a cada aviso

function mostrarAviso(mensagem) {
  const aviso = document.getElementById('aviso');
  if (!aviso) return;
  aviso.textContent = mensagem;
  aviso.classList.add('visivel');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    aviso.classList.remove('visivel');
  }, 3000);
}


/* ---------- 3. Máscaras e validação de campos ---------- */

function somenteNumeros(texto) {
  return texto.replace(/\D/g, '');
}

function somenteLetras(texto) {
  return texto.replace(/[^A-Za-zÀ-ÿ ]/g, '');
}

// "mg" -> "MG" (só 2 letras)
function mascaraUF(texto) {
  return texto.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
}

// 12345678909 -> 123.456.789-09
function mascaraCPF(texto) {
  const n = somenteNumeros(texto).slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return n.slice(0, 3) + '.' + n.slice(3);
  if (n.length <= 9) return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6);
  return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6, 9) + '-' + n.slice(9);
}

// 31987654321 -> (31) 98765-4321
function mascaraTelefone(texto) {
  const n = somenteNumeros(texto).slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return '(' + n.slice(0, 2) + ') ' + n.slice(2);
  if (n.length <= 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
  return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
}

// 30110000 -> 30110-000
function mascaraCEP(texto) {
  const n = somenteNumeros(texto).slice(0, 8);
  if (n.length <= 5) return n;
  return n.slice(0, 5) + '-' + n.slice(5);
}

// Liga uma máscara a um campo: a cada letra digitada o valor é corrigido
function ligarMascara(idCampo, funcaoMascara) {
  const campo = document.getElementById(idCampo);
  campo.addEventListener('input', function () {
    campo.value = funcaoMascara(campo.value);
  });
}

// Mostra o erro de um campo (ou marca como válido se não houver erro)
function marcarCampo(campo, mensagemErro) {
  const mensagem = campo.parentElement.querySelector('.msg-erro');
  if (mensagemErro) {
    campo.classList.add('invalido');
    campo.classList.remove('valido');
  } else {
    campo.classList.add('valido');
    campo.classList.remove('invalido');
  }
  if (mensagem) {
    mensagem.textContent = mensagemErro;
  }
}

// Marca o campo e devolve 1 se tiver erro (ou 0 se estiver certo). Serve para contar erros.
function verificar(campo, mensagemErro) {
  marcarCampo(campo, mensagemErro);
  if (mensagemErro) return 1;
  return 0;
}

// Mostra ou esconde a senha (troca o tipo do campo)
function mostrarOcultarSenha(idCampo) {
  const campo = document.getElementById(idCampo);
  if (campo.type === 'password') {
    campo.type = 'text';
  } else {
    campo.type = 'password';
  }
}


/* ---------- 4. Usuário e sessão (tabela usuario) ---------- */

function pegarUsuarios() {
  return lerLocal('phls_usuarios', []);
}

// Retorna o usuário que está logado (ou null)
function usuarioLogado() {
  const idDaSessao = lerLocal('phls_sessao', null);
  for (const usuario of pegarUsuarios()) {
    if (usuario.id_usuario === idDaSessao) return usuario;
  }
  return null;
}

// Substitui os dados de um usuário na lista de usuários
function atualizarUsuario(usuarioAlterado) {
  const usuarios = pegarUsuarios();
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id_usuario === usuarioAlterado.id_usuario) {
      usuarios[i] = usuarioAlterado;
    }
  }
  salvarLocal('phls_usuarios', usuarios);
}

// Sai da conta e esvazia o carrinho (o próximo usuário começa do zero)
function sairDaConta() {
  localStorage.removeItem('phls_sessao');
  salvarLocal('phls_carrinho', []);
  window.location.href = 'index.html';
}


/* ---------- 5. Endereços (tabela endereco) ---------- */

// Endereços de um usuário (cada endereço guarda o id_usuario do dono)
function pegarEnderecosDoUsuario(idUsuario) {
  const lista = [];
  for (const endereco of lerLocal('phls_enderecos', [])) {
    if (endereco.id_usuario === idUsuario) lista.push(endereco);
  }
  return lista;
}

function buscarEndereco(idEndereco) {
  for (const endereco of lerLocal('phls_enderecos', [])) {
    if (endereco.id_endereco === idEndereco) return endereco;
  }
  return null;
}

// Devolve o HTML de um endereço em duas linhas
function htmlEndereco(endereco) {
  return `<b>${textoSeguro(endereco.rua)}, ${textoSeguro(endereco.numero)} — ${textoSeguro(endereco.bairro)}</b>
    <small>${textoSeguro(endereco.cidade)} / ${endereco.estado} • CEP ${endereco.cep}</small>`;
}


/* ---------- 6. Carrinho (como a tabela item_carrinho) ---------- */
// Cada item guarda: id_produto, quantidade e observacao.
// Nome e preço são buscados nos dados (dados.js).

// Devolve os itens do carrinho, ignorando produtos que não existem mais em dados.js
function pegarCarrinho() {
  const carrinho = [];
  for (const item of lerLocal('phls_carrinho', [])) {
    if (buscarProduto(item.id_produto)) carrinho.push(item);
  }
  return carrinho;
}

// Posição do produto na lista do carrinho (-1 se ele não estiver no carrinho)
function posicaoNoCarrinho(carrinho, idProduto) {
  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id_produto === idProduto) return i;
  }
  return -1;
}

function adicionarAoCarrinho(idProduto) {
  const carrinho = pegarCarrinho();
  const posicao = posicaoNoCarrinho(carrinho, idProduto);

  if (posicao === -1) {
    carrinho.push({ id_produto: idProduto, quantidade: 1, observacao: '' });
  } else {
    carrinho[posicao].quantidade = carrinho[posicao].quantidade + 1;
  }

  salvarLocal('phls_carrinho', carrinho);
  atualizarCabecalho();
  mostrarAviso(buscarProduto(idProduto).nome + ' adicionado ao carrinho');
}

function contarItens() {
  let total = 0;
  for (const item of pegarCarrinho()) {
    total = total + item.quantidade;
  }
  return total;
}

function calcularSubtotal() {
  let soma = 0;
  for (const item of pegarCarrinho()) {
    soma = soma + buscarProduto(item.id_produto).preco * item.quantidade;
  }
  return arredondar(soma);
}

// Só cobra a taxa da loja se houver algo no carrinho
function calcularTaxa() {
  if (contarItens() > 0) return LOJA.taxa_entrega;
  return 0;
}

function calcularTotal() {
  return arredondar(calcularSubtotal() + calcularTaxa());
}


/* ---------- 7. Cards de produtos (Início, Ofertas e Cardápio) ---------- */

// O card do meio de cada linha fica com o fundo rosado, como no protótipo
function fundoRosa(posicao) {
  if (posicao % 3 === 1) return ' rosa';
  return '';
}

function criarCardProduto(produto, posicao) {
  return `
    <article class="card card-produto">
      <div class="foto${fundoRosa(posicao)}"><img src="${produto.imagem}" alt="${produto.nome}"></div>
      <div class="card-corpo">
        <h3>${produto.nome}</h3>
        <p class="descricao">${produto.descricao}</p>
        <div class="card-rodape">
          <strong class="preco">${formatarPreco(produto.preco)}</strong>
          <button class="btn btn-primario btn-pequeno" onclick="adicionarAoCarrinho(${produto.id_produto})">Adicionar</button>
        </div>
      </div>
    </article>`;
}

function criarCardOferta(oferta, posicao) {
  const produto = buscarProduto(oferta.id_produto);
  const desconto = Math.round((1 - produto.preco / oferta.preco_antigo) * 100);
  return `
    <article class="card card-oferta">
      <span class="etiqueta">-${desconto}%</span>
      <div class="foto${fundoRosa(posicao)}"><img src="${produto.imagem}" alt="${produto.nome}"></div>
      <div class="card-corpo">
        <h3>${produto.nome}</h3>
        <p class="descricao">${produto.descricao}</p>
        <div class="card-rodape">
          <div>
            <s class="preco-antigo">De ${formatarPreco(oferta.preco_antigo)}</s>
            <strong class="preco preco-grande">${formatarPreco(produto.preco)}</strong>
          </div>
          <button class="btn btn-primario" onclick="adicionarAoCarrinho(${produto.id_produto})">Adicionar</button>
        </div>
      </div>
    </article>`;
}


/* ---------- 8. Tema claro / escuro ---------- */

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
}

function alternarTema() {
  let novoTema = 'escuro';
  if (document.documentElement.getAttribute('data-tema') === 'escuro') {
    novoTema = 'claro';
  }
  aplicarTema(novoTema);
  salvarLocal('phls_tema', novoTema);
}


/* ---------- 9. Cabeçalho ---------- */

function atualizarCabecalho() {
  // Número de itens no ícone do carrinho
  const badge = document.getElementById('badge');
  if (badge) {
    badge.textContent = contarItens();
    badge.hidden = contarItens() === 0;
  }

  // Botão "Entrar" vira "Minha conta" quando o usuário está logado
  const usuario = usuarioLogado();
  if (usuario) {
    const botaoConta = document.getElementById('btn-conta');
    const avatar = document.getElementById('avatar');
    const textoConta = document.getElementById('texto-conta');
    if (botaoConta) botaoConta.classList.add('logado');
    if (avatar) avatar.textContent = iniciais(usuario.nome);
    if (textoConta) textoConta.textContent = 'Minha conta';
  }
}

// Clique no botão da conta: se não estiver logado, abre o login
function cliqueNaConta(evento) {
  if (!usuarioLogado()) {
    evento.preventDefault();
    abrirLogin();
  }
}


/* ---------- 10. Janela de login ---------- */

// Cria a janela de login uma única vez, no final da página
function criarJanelaLogin() {
  const janela = document.createElement('div');
  janela.className = 'modal';
  janela.id = 'modal-login';
  janela.innerHTML = `
    <div class="modal-caixa">
      <button class="btn-fechar" onclick="fecharLogin()" aria-label="Fechar">✕</button>
      <span class="logo logo-grande"><img src="img/logo.jpg" alt="PHLS Delivery"></span>
      <h2 class="centro">Bem-vindo de volta</h2>
      <p class="suave centro">Entre com seu e-mail e senha</p>
      <div class="alerta alerta-erro" id="erro-login" hidden></div>
      <form class="form" id="form-login" novalidate>
        <div class="campo">
          <label for="login-email">E-mail <span class="obrigatorio">*</span></label>
          <input type="email" id="login-email" maxlength="100" placeholder="seuemail@exemplo.com">
        </div>
        <div class="campo">
          <label for="login-senha">Senha <span class="obrigatorio">*</span></label>
          <div class="campo-senha">
            <input type="password" id="login-senha" maxlength="20" placeholder="Digite sua senha">
            <button type="button" class="btn-olho" onclick="mostrarOcultarSenha('login-senha')" aria-label="Mostrar senha"><svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>
          </div>
        </div>
        <button type="submit" class="btn btn-primario btn-largo">Entrar</button>
      </form>
      <p class="suave centro">Ainda não tem conta? <a class="link" href="cadastro.html">Criar conta</a></p>
    </div>`;
  document.body.appendChild(janela);
  document.getElementById('form-login').addEventListener('submit', fazerLogin);

  // Clicar no fundo escuro também fecha a janela
  janela.addEventListener('click', function (evento) {
    if (evento.target === janela) fecharLogin();
  });
}

function abrirLogin() {
  document.getElementById('modal-login').classList.add('aberto');
}

function fecharLogin() {
  document.getElementById('modal-login').classList.remove('aberto');
}

function mostrarErroLogin(titulo, texto) {
  const caixa = document.getElementById('erro-login');
  caixa.innerHTML = '<b>' + titulo + '</b>' + texto;
  caixa.hidden = false;
}

function fazerLogin(evento) {
  evento.preventDefault(); // não deixa o formulário recarregar a página
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;

  if (email === '' || senha === '') {
    mostrarErroLogin('Preencha e-mail e senha', 'Os dois campos são obrigatórios.');
    return;
  }

  // DEMONSTRAÇÃO: a senha é comparada em texto, só no navegador. Isso NÃO é seguro.
  // No sistema real, o servidor compara o hash da senha guardado na tabela usuario.
  for (const usuario of pegarUsuarios()) {
    if (usuario.email === email && usuario.senha === senha) {
      salvarLocal('phls_sessao', usuario.id_usuario);
      // Na página de cadastro, vai para o início; nas outras, recarrega a mesma página já logado
      if (window.location.pathname.includes('cadastro')) {
        window.location.href = 'index.html';
      } else {
        window.location.reload();
      }
      return;
    }
  }
  mostrarErroLogin('E-mail ou senha incorretos', 'Confira os dados e tente novamente.');
}


/* ---------- 11. Executado em todas as páginas ---------- */

const temaSalvo = lerLocal('phls_tema', 'claro');
aplicarTema(temaSalvo === 'escuro' ? 'escuro' : 'claro');
criarJanelaLogin();
atualizarCabecalho();

const botaoTema = document.getElementById('btn-tema');
if (botaoTema) botaoTema.addEventListener('click', alternarTema);

const botaoConta = document.getElementById('btn-conta');
if (botaoConta) botaoConta.addEventListener('click', cliqueNaConta);

const navConta = document.getElementById('nav-conta');
if (navConta) navConta.addEventListener('click', cliqueNaConta);
