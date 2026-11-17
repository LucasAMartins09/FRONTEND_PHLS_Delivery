/* =========================================================
   PHLS Delivery - dados.js
   Dados fixos do site. Os nomes dos campos são os mesmos
   das tabelas do banco DB_Delivery (loja, categoria e produto).
   No futuro, estes dados virão do servidor em vez deste arquivo.
   ========================================================= */

// Tabela "loja" (o site tem uma única loja)
const LOJA = {
  id_loja: 1,
  nome: 'PHLS Delivery',
  descricao: 'Hambúrgueres feitos na hora, entregues quentinhos.',
  taxa_entrega: 6.00,
  ativo: true
};

// Tabela "categoria"
const CATEGORIAS = [
  { id_categoria: 1, id_loja: 1, nome: 'Hambúrgueres' },
  { id_categoria: 2, id_loja: 1, nome: 'Combos' },
  { id_categoria: 3, id_loja: 1, nome: 'Acompanhamentos' },
  { id_categoria: 4, id_loja: 1, nome: 'Bebidas' }
];

// Tabela "produto"
// "imagem" é usado só pelo site (o banco não tem esse campo).
// As fotos ficam em img/produtos/ (caminho relativo, funciona no GitHub Pages).
const PRODUTOS = [
  { id_produto: 1, id_loja: 1, id_categoria: 1, nome: 'X-Clássico', descricao: 'Pão brioche, blend 160g, queijo prato e molho da casa', preco: 24.90, disponivel: true, imagem: 'img/produtos/hamburguer-classico.webp' },
  { id_produto: 2, id_loja: 1, id_categoria: 1, nome: 'X-Bacon', descricao: 'Pão brioche, blend 160g, queijo, bacon crocante e maionese defumada', preco: 29.90, disponivel: true, imagem: 'img/produtos/hamburguer-bacon.webp' },
  { id_produto: 3, id_loja: 1, id_categoria: 1, nome: 'X-Salada', descricao: 'Pão brioche, blend 160g, queijo, alface, tomate e cebola roxa', preco: 26.90, disponivel: true, imagem: 'img/produtos/hamburguer-salada.webp' },
  { id_produto: 4, id_loja: 1, id_categoria: 1, nome: 'Duplo Cheddar', descricao: 'Dois blends de 160g, cheddar cremoso e cebola caramelizada', preco: 34.90, disponivel: true, imagem: 'img/produtos/hamburguer-duplo-cheddar.webp' },
  { id_produto: 5, id_loja: 1, id_categoria: 1, nome: 'Smash Especial', descricao: 'Dois smashes de 90g, queijo derretido e picles', preco: 32.90, disponivel: true, imagem: 'img/produtos/hamburguer-smash.webp' },
  { id_produto: 6, id_loja: 1, id_categoria: 1, nome: 'Burger Vegetariano', descricao: 'Pão brioche, burger de grão-de-bico, alface e tomate', preco: 28.90, disponivel: true, imagem: 'img/produtos/hamburguer-vegetariano.webp' },
  { id_produto: 7, id_loja: 1, id_categoria: 2, nome: 'Combo Casal', descricao: '2 X-Bacon e 2 refrigerantes', preco: 64.90, disponivel: true, imagem: 'img/produtos/combo-casal.webp' },
  { id_produto: 8, id_loja: 1, id_categoria: 2, nome: 'Duplo pelo preço do simples', descricao: 'Duplo Cheddar pelo preço do X-Bacon', preco: 29.90, disponivel: true, imagem: 'img/produtos/hamburguer-duplo-cheddar.webp' },
  { id_produto: 9, id_loja: 1, id_categoria: 2, nome: 'Leve 3, pague 2', descricao: 'Três X-Clássico pelo preço de dois', preco: 49.80, disponivel: true, imagem: 'img/produtos/combo-leve-3-pague-2.webp' },
  { id_produto: 10, id_loja: 1, id_categoria: 3, nome: 'Batata Frita', descricao: 'Porção média com sal e páprica', preco: 14.90, disponivel: true, imagem: 'img/produtos/batata-frita.webp' },
  { id_produto: 11, id_loja: 1, id_categoria: 3, nome: 'Onion Rings', descricao: 'Anéis de cebola empanados com molho barbecue', preco: 16.90, disponivel: true, imagem: 'img/produtos/onion-rings.webp' },
  { id_produto: 12, id_loja: 1, id_categoria: 4, nome: 'Refrigerante Lata', descricao: '350 ml — vários sabores', preco: 6.90, disponivel: true, imagem: 'img/produtos/refrigerante-lata.webp' }
];

// Ofertas da semana: produtos que aparecem na página de ofertas.
// "preco_antigo" é só para mostrar o desconto (o banco não tem esse campo).
const OFERTAS = [
  { id_produto: 7, preco_antigo: 79.90 },
  { id_produto: 8, preco_antigo: 34.90 },
  { id_produto: 9, preco_antigo: 74.70 }
];

// Valores dos campos ENUM do banco e o texto mostrado na tela
const STATUS_PEDIDO = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  EM_PREPARACAO: 'Em preparação',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado'
};

const METODOS_PAGAMENTO = {
  PIX: 'PIX',
  CARTAO: 'Cartão',
  DINHEIRO: 'Dinheiro'
};
