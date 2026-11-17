/* PHLS Delivery - pedidos.js
   Meus pedidos: lista os pedidos do usuário logado e gera o arquivo JSON. */

// Pedidos do usuário, do mais novo para o mais antigo
function pegarMeusPedidos(idUsuario) {
  const meus = [];
  for (const pedido of lerLocal('phls_pedidos', [])) {
    if (pedido.id_usuario === idUsuario) {
      meus.unshift(pedido); // unshift coloca no começo da lista
    }
  }
  return meus;
}

function criarCardPedido(pedido, idNovo) {
  let itens = '';
  for (const item of pedido.itens) {
    const nome = item.nome; // o nome é guardado no pedido na hora da compra
    let observacao = '';
    if (item.observacao) observacao = ' <small class="suave">(' + textoSeguro(item.observacao) + ')</small>';
    itens = itens + `<div class="linha-valor"><span><b>${item.quantidade}x</b> ${nome}${observacao}</span><span>${formatarPreco(item.preco_unitario * item.quantidade)}</span></div>`;
  }

  let classe = 'caixa pedido';
  if (pedido.id_pedido === idNovo) classe = 'caixa pedido novo';

  // Ex.: status "EM_PREPARACAO" usa a classe "status-em_preparacao" e mostra "Em preparação"
  return `
    <article class="${classe}">
      <div class="pedido-topo">
        <div><h3>Pedido #${pedido.id_pedido}</h3><small class="suave">${formatarData(pedido.criado_em)}</small></div>
        <span class="status status-${pedido.status.toLowerCase()}">${STATUS_PEDIDO[pedido.status]}</span>
      </div>
      ${itens}
      <div class="pedido-rodape">
        <span>Pagamento: <b>${METODOS_PAGAMENTO[pedido.pagamento.metodo]}</b></span>
        <span>Total <strong>${formatarPreco(pedido.total)}</strong></span>
      </div>
    </article>`;
}

function mostrarPedidos() {
  const usuario = usuarioLogado();
  const lista = document.getElementById('lista-pedidos');

  if (!usuario) {
    lista.innerHTML = '<p class="vazio">Entre na sua conta para ver seus pedidos.</p>';
    abrirLogin();
    return;
  }

  const pedidos = pegarMeusPedidos(usuario.id_usuario);
  if (pedidos.length === 0) {
    lista.innerHTML = '<p class="vazio">Você ainda não fez pedidos. <a class="link" href="cardapio.html">Ver cardápio</a></p>';
    return;
  }

  // Número do pedido que acabou de ser feito (vem no endereço: pedidos.html?novo=3)
  const idNovo = Number(new URLSearchParams(window.location.search).get('novo'));
  if (idNovo) {
    document.getElementById('msg-sucesso-titulo').textContent = 'Pedido #' + idNovo + ' realizado com sucesso!';
    document.getElementById('msg-sucesso').hidden = false;
  }

  let html = '';
  for (const pedido of pedidos) {
    html = html + criarCardPedido(pedido, idNovo);
  }
  lista.innerHTML = html;
  document.getElementById('acoes-pedidos').hidden = false;
}


/* ---------- Arquivo JSON para a aplicação C# ---------- */

// Junta ao pedido os dados do cliente (tabela usuario), para que a aplicação C#
// consiga encontrar ou cadastrar o cliente. A senha NÃO vai no arquivo.
// O endereço já está dentro do pedido (copiado na hora da compra).
function pedidoParaJSON(pedido) {
  const usuario = usuarioLogado();
  // O pedido veio do localStorage, então alterar este objeto não muda o que está salvo
  pedido.usuario = {
    id_usuario: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    telefone: usuario.telefone
  };
  return pedido;
}

// Demonstração: baixa um arquivo pedidos.json. No sistema real, quem gera
// esse arquivo é o servidor, e quem importa é a aplicação C#.
function baixarJSON() {
  const lista = [];
  for (const pedido of pegarMeusPedidos(usuarioLogado().id_usuario)) {
    lista.push(pedidoParaJSON(pedido));
  }
  const texto = JSON.stringify(lista, null, 2);
  const arquivo = new Blob([texto], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(arquivo);
  link.download = 'pedidos.json';
  link.click();
}

document.getElementById('fechar-sucesso').addEventListener('click', function () {
  document.getElementById('msg-sucesso').hidden = true;
});
document.getElementById('btn-json').addEventListener('click', baixarJSON);

mostrarPedidos();
