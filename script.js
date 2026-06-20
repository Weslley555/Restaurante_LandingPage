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

// --- LÓGICA DO CARROSSEL DE EVENTOS ---
let indiceSlide = 0;

function mudarSlide(direcao) {
  const track = document.getElementById("track-eventos");
  const slides = document.querySelectorAll(".slide-evento");
  const totalSlides = slides.length;

  indiceSlide += direcao;

  // Se passou do último, volta para o primeiro
  if (indiceSlide >= totalSlides) {
    indiceSlide = 0;
  }
  // Se voltou antes do primeiro, vai para o último
  else if (indiceSlide < 0) {
    indiceSlide = totalSlides - 1;
  }

  // Move a trilha de imagens multiplicando a largura por slide (100%)
  track.style.transform = `translateX(-${indiceSlide * 100}%)`;
}
