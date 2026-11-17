/* PHLS Delivery - cardapio.js
   Cardápio: busca, filtro por categoria e resumo do pedido. */

let categoriaEscolhida = 0; // 0 = Todos; os outros números são o id_categoria

// Tira acentos e deixa minúsculo, para a busca achar "classico" em "X-Clássico"
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Cria um botão de filtro
function criarBotaoFiltro(idCategoria, nome) {
  let classe = 'filtro';
  if (idCategoria === categoriaEscolhida) classe = 'filtro ativo';
  return `<button class="${classe}" onclick="escolherCategoria(${idCategoria})">${nome}</button>`;
}

// Cria os botões "Todos" + uma categoria por botão
function mostrarFiltros() {
  let html = criarBotaoFiltro(0, 'Todos');
  for (const categoria of CATEGORIAS) {
    html = html + criarBotaoFiltro(categoria.id_categoria, categoria.nome);
  }
  document.getElementById('filtros').innerHTML = html;
}

function escolherCategoria(idCategoria) {
  categoriaEscolhida = idCategoria;
  mostrarFiltros();
  mostrarProdutos();
}

// Mostra só os produtos disponíveis da categoria escolhida que combinam com a busca
function mostrarProdutos() {
  const termo = normalizar(document.getElementById('busca').value.trim());
  let html = '';
  let quantidade = 0;

  for (const produto of PRODUTOS) {
    const textoDoProduto = normalizar(produto.nome + ' ' + produto.descricao);
    const combinaBusca = textoDoProduto.includes(termo);
    const combinaCategoria = categoriaEscolhida === 0 || produto.id_categoria === categoriaEscolhida;

    if (produto.disponivel && combinaBusca && combinaCategoria) {
      html = html + criarCardProduto(produto, quantidade);
      quantidade++;
    }
  }

  document.getElementById('lista-produtos').innerHTML = html;
  document.getElementById('nada-encontrado').hidden = quantidade > 0;

  let texto = quantidade + ' produtos';
  if (quantidade === 1) texto = '1 produto';
  document.getElementById('contador').textContent = texto;
}

// Resumo do pedido na lateral
function mostrarResumo() {
  const carrinho = pegarCarrinho();
  let html = `<div class="resumo-titulo"><h3>Seu pedido</h3><small class="suave">${contarItens()} itens</small></div>`;

  if (carrinho.length === 0) {
    html = html + '<p class="suave">Seu carrinho está vazio. Clique em “Adicionar” para começar.</p>';
  } else {
    for (let i = 0; i < carrinho.length; i++) {
      const item = carrinho[i];
      const produto = buscarProduto(item.id_produto);
      html = html + `
        <div class="mini-item">
          <span class="mini-foto${fundoRosa(i)}"><img src="${produto.imagem}" alt=""></span>
          <div><b>${produto.nome}</b><small>${item.quantidade}x ${formatarPreco(produto.preco)}</small></div>
          <b>${formatarPreco(produto.preco * item.quantidade)}</b>
        </div>`;
    }
    html = html + `
      <hr>
      <div class="linha-valor"><span>Subtotal</span><b>${formatarPreco(calcularSubtotal())}</b></div>
      <div class="linha-valor"><span>Taxa de entrega</span><b>${formatarPreco(calcularTaxa())}</b></div>
      <a href="carrinho.html" class="btn btn-primario btn-largo">Ver carrinho</a>`;
  }
  document.getElementById('resumo').innerHTML = html;
  mostrarBarraCarrinho();
}

// Barra vermelha "Ver carrinho" (só aparece no celular e com itens no carrinho)
function mostrarBarraCarrinho() {
  document.getElementById('barra-carrinho').hidden = contarItens() === 0;
  document.getElementById('barra-itens').textContent = contarItens() + ' itens';
  document.getElementById('barra-subtotal').textContent = formatarPreco(calcularSubtotal());
}

// Se veio da busca da página inicial (cardapio.html?busca=bacon), já preenche o campo
const parametros = new URLSearchParams(window.location.search);
document.getElementById('busca').value = parametros.get('busca') || '';
document.getElementById('busca').addEventListener('input', mostrarProdutos);

// O botão "Adicionar" fica dentro da lista de produtos. Depois que ele adiciona
// o produto, o clique "sobe" até a lista e o resumo é atualizado.
document.getElementById('lista-produtos').addEventListener('click', mostrarResumo);

mostrarFiltros();
mostrarProdutos();
mostrarResumo();
