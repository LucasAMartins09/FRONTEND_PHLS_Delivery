/* PHLS Delivery - inicio.js
   Página inicial: mostra os 4 primeiros produtos como "Mais pedidos". */

function mostrarDestaques() {
  let html = '';
  for (let i = 0; i < 4; i++) {
    html = html + criarCardProduto(PRODUTOS[i], i);
  }
  document.getElementById('lista-destaques').innerHTML = html;
}

mostrarDestaques();
