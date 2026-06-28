// Função para trocar as abas do Self Service
function mostrarAba(aba, elementoClicado) {
  document.getElementById("aba-semana").classList.remove("ativa");
  document.getElementById("aba-domingo").classList.remove("ativa");

  let botoes = document.querySelectorAll(".btn-dia");
  botoes.forEach((btn) => btn.classList.remove("ativo"));

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

  if (indiceSlide >= totalSlides) {
    indiceSlide = 0;
  } else if (indiceSlide < 0) {
    indiceSlide = totalSlides - 1;
  }

  track.style.transform = `translateX(-${indiceSlide * 100}%)`;
}

// --- LÓGICA DO AVISO DE COOKIES + GOOGLE ANALYTICS (LGPD) ---
document.addEventListener("DOMContentLoaded", function () {
  const aviso = document.getElementById("aviso-cookies");
  const btnAceitar = document.getElementById("btn-aceitar-cookies");
  const btnRecusar = document.getElementById("btn-recusar-cookies");
  const decisao = localStorage.getItem("cookiesAceitos");

  // Se já tomou uma decisão antes, esconde o banner
  if (decisao !== null) {
    aviso.style.display = "none";
  } else {
    aviso.style.display = "flex";
  }

  // Aceitar: salva consentimento e carrega o Analytics
  btnAceitar.addEventListener("click", function () {
    localStorage.setItem("cookiesAceitos", "sim");
    aviso.style.display = "none";
    if (typeof carregarAnalytics === "function") {
      carregarAnalytics();
    }
  });

  // Recusar: salva recusa, Analytics não é carregado
  btnRecusar.addEventListener("click", function () {
    localStorage.setItem("cookiesAceitos", "nao");
    aviso.style.display = "none";
  });
});
