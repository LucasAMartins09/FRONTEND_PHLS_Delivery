/* PHLS Delivery - carrinho.js
   Carrinho: itens, quantidades, observações, resumo e finalização do pedido. */


/* ---------- Mostrar o carrinho ---------- */

function mostrarItens() {
  const carrinho = pegarCarrinho();
  const areaItens = document.getElementById('itens');
  document.getElementById('sub-carrinho').textContent = 'Pedido na PHLS Delivery • ' + contarItens() + ' itens';

  if (carrinho.length === 0) {
    areaItens.innerHTML = '<p class="vazio">Seu carrinho está vazio. <a class="link" href="cardapio.html">Ver cardápio</a></p>';
    return;
  }

  let html = '';
  for (let i = 0; i < carrinho.length; i++) {
    const item = carrinho[i];
    const produto = buscarProduto(item.id_produto);
    html = html + `
      <div class="item-carrinho">
        <div class="mini-foto${fundoRosa(i)}"><img src="${produto.imagem}" alt="${produto.nome}"></div>
        <div class="item-info">
          <h3>${produto.nome}</h3>
          <input class="observacao" maxlength="100" placeholder="Observação (ex.: sem cebola)"
                 value="${textoSeguro(item.observacao)}" onchange="salvarObservacao(${item.id_produto}, this.value)">
          <small class="suave">${formatarPreco(produto.preco)} cada</small>
          <div class="quantidade">
            <button onclick="mudarQuantidade(${item.id_produto}, -1)" aria-label="Diminuir">−</button>
            <b>${item.quantidade}</b>
            <button class="mais" onclick="mudarQuantidade(${item.id_produto}, 1)" aria-label="Aumentar">+</button>
          </div>
        </div>
        <div class="item-direita">
          <strong>${formatarPreco(produto.preco * item.quantidade)}</strong>
          <button class="btn-lixeira" onclick="removerItem(${item.id_produto})" aria-label="Remover ${produto.nome}">
            <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>`;
  }
  areaItens.innerHTML = html;
}

function mostrarResumo() {
  document.getElementById('subtotal').textContent = formatarPreco(calcularSubtotal());
  document.getElementById('taxa').textContent = formatarPreco(calcularTaxa());
  document.getElementById('total').textContent = formatarPreco(calcularTotal());

  // Mostra o primeiro endereço do usuário (na finalização ele pode escolher outro)
  const areaEndereco = document.getElementById('endereco-carrinho');
  const usuario = usuarioLogado();
  areaEndereco.innerHTML = '<small>Nenhum endereço cadastrado.</small>';
  if (usuario) {
    const enderecos = pegarEnderecosDoUsuario(usuario.id_usuario);
    if (enderecos.length > 0) areaEndereco.innerHTML = htmlEndereco(enderecos[0]);
  }
}

// Redesenha a página inteira (itens, resumo e número no cabeçalho)
function atualizarPagina() {
  mostrarItens();
  mostrarResumo();
  atualizarCabecalho();
}


/* ---------- Alterar itens ---------- */

// valor = +1 para aumentar ou -1 para diminuir
function mudarQuantidade(idProduto, valor) {
  const carrinho = pegarCarrinho();
  const posicao = posicaoNoCarrinho(carrinho, idProduto);
  carrinho[posicao].quantidade = carrinho[posicao].quantidade + valor;

  // Se a quantidade chegou a zero, o item sai do carrinho
  if (carrinho[posicao].quantidade < 1) {
    carrinho.splice(posicao, 1); // splice remove 1 elemento na posição indicada
  }
  salvarLocal('phls_carrinho', carrinho);
  atualizarPagina();
}

function removerItem(idProduto) {
  const carrinho = pegarCarrinho();
  carrinho.splice(posicaoNoCarrinho(carrinho, idProduto), 1);
  salvarLocal('phls_carrinho', carrinho);
  atualizarPagina();
}

function salvarObservacao(idProduto, texto) {
  const carrinho = pegarCarrinho();
  carrinho[posicaoNoCarrinho(carrinho, idProduto)].observacao = texto.trim();
  salvarLocal('phls_carrinho', carrinho);
}


/* ---------- Finalização do pedido ---------- */

// Lista os endereços do usuário como opções (o primeiro já vem marcado)
function mostrarOpcoesEndereco(enderecos) {
  let html = '';
  for (let i = 0; i < enderecos.length; i++) {
    let marcado = '';
    if (i === 0) marcado = 'checked';
    html = html + `
      <label class="opcao">
        <input type="radio" name="endereco" value="${enderecos[i].id_endereco}" ${marcado}>
        <span>${htmlEndereco(enderecos[i])}</span>
      </label>`;
  }
  document.getElementById('final-enderecos').innerHTML = html;
}

// Lista "2x X-Bacon ..... R$ 59,80" dentro da janela de finalização
function mostrarItensFinalizacao() {
  let html = '';
  for (const item of pegarCarrinho()) {
    const produto = buscarProduto(item.id_produto);
    html = html + `<div class="linha-valor"><span><b>${item.quantidade}x</b> ${produto.nome}</span><span>${formatarPreco(produto.preco * item.quantidade)}</span></div>`;
  }
  document.getElementById('final-itens').innerHTML = html;
}

function abrirFinalizacao() {
  const usuario = usuarioLogado();

  // Verificações antes de abrir a janela
  if (contarItens() === 0) {
    mostrarAviso('Seu carrinho está vazio.');
    return;
  }
  if (!usuario) {
    mostrarAviso('Entre na sua conta para finalizar o pedido.');
    abrirLogin();
    return;
  }
  const enderecos = pegarEnderecosDoUsuario(usuario.id_usuario);
  if (enderecos.length === 0) {
    mostrarAviso('Cadastre um endereço de entrega no seu perfil.');
    return;
  }

  mostrarItensFinalizacao();
  mostrarOpcoesEndereco(enderecos);
  document.getElementById('final-subtotal').textContent = formatarPreco(calcularSubtotal());
  document.getElementById('final-taxa').textContent = formatarPreco(calcularTaxa());
  document.getElementById('final-total').textContent = formatarPreco(calcularTotal());
  document.getElementById('btn-confirmar').textContent = 'Confirmar pedido • ' + formatarPreco(calcularTotal());

  document.getElementById('modal-finalizar').classList.add('aberto');
}

function fecharFinalizacao() {
  document.getElementById('modal-finalizar').classList.remove('aberto');
}

// Organiza os dados do pedido em um objeto com os mesmos campos
// das tabelas pedido, item_pedido e pagamento do banco DB_Delivery.
// O formato está explicado em docs/INTEGRACAO.md.
function montarPedido(idPedido, idUsuario, idEndereco, metodoPagamento) {
  const itens = [];
  for (const item of pegarCarrinho()) {
    const produto = buscarProduto(item.id_produto);
    itens.push({
      id_produto: item.id_produto,
      nome: produto.nome,               // ajuda o C# a conferir se o id_produto está certo
      quantidade: item.quantidade,
      preco_unitario: produto.preco,    // preço no momento da compra
      observacao: item.observacao
    });
  }

  return {
    id_pedido: idPedido,
    id_usuario: idUsuario,
    id_loja: LOJA.id_loja,
    id_endereco: idEndereco,
    endereco: buscarEndereco(idEndereco), // cópia: se o endereço mudar depois, o pedido não muda
    status: 'PENDENTE',
    subtotal: calcularSubtotal(),
    taxa_entrega: calcularTaxa(),
    total: calcularTotal(),
    criado_em: dataAtualMySQL(),
    itens: itens,
    pagamento: {
      metodo: metodoPagamento,
      status: 'PENDENTE',
      valor: calcularTotal()
    }
  };
}

// Salva o pedido na lista de pedidos e esvazia o carrinho
function confirmarPedido() {
  const pedidos = lerLocal('phls_pedidos', []);
  const idEndereco = Number(document.querySelector('input[name="endereco"]:checked').value);
  const metodo = document.querySelector('input[name="pagamento"]:checked').value;

  const pedido = montarPedido(proximoId(pedidos, 'id_pedido'), usuarioLogado().id_usuario, idEndereco, metodo);

  pedidos.push(pedido);
  salvarLocal('phls_pedidos', pedidos);
  salvarLocal('phls_carrinho', []);

  // Vai para a página de pedidos mostrando a mensagem de sucesso
  window.location.href = 'pedidos.html?novo=' + pedido.id_pedido;
}


/* ---------- Ligar os botões ---------- */

document.getElementById('btn-finalizar').addEventListener('click', abrirFinalizacao);
document.getElementById('fechar-finalizar').addEventListener('click', fecharFinalizacao);
document.getElementById('btn-confirmar').addEventListener('click', confirmarPedido);

atualizarPagina();
