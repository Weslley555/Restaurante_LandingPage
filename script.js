// Função para trocar as abas do Self Service
function mostrarAba(aba, elementoClicado) {
  // Esconde os conteúdos
  document.getElementById("aba-semana").classList.remove("ativa");
  document.getElementById("aba-domingo").classList.remove("ativa");

  // Remove o destaque de todos os botões
  let botoes = document.querySelectorAll(".btn-dia");
  botoes.forEach((btn) => btn.classList.remove("ativo"));

  // Mostra o conteúdo escolhido e destaca o botão clicado
  document.getElementById("aba-" + aba).classList.add("ativa");
  elementoClicado.classList.add("ativo");
}
