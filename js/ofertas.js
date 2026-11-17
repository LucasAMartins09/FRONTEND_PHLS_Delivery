/* PHLS Delivery - ofertas.js
   Página de ofertas: mostra os cards com preço antigo e preço promocional. */

function mostrarOfertas() {
  let html = '';
  for (let i = 0; i < OFERTAS.length; i++) {
    html = html + criarCardOferta(OFERTAS[i], i);
  }
  document.getElementById('lista-ofertas').innerHTML = html;
}

mostrarOfertas();
