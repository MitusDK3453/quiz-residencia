// js/timer.js
let timerId = null;
let tempoInicio = 0;
let tempoTotal = 0;

export function iniciarCronometro() {
  tempoInicio = Date.now();
  tempoTotal = 0;
  // Atualiza imediatamente
  atualizarDisplay();
  // Depois atualiza a cada segundo
  if (timerId) clearInterval(timerId);
  timerId = setInterval(atualizarDisplay, 1000);
}

export function pararCronometro() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  return tempoTotal;
}

export function obterTempoAtual() {
  return tempoTotal;
}

function atualizarDisplay() {
  tempoTotal = Math.floor((Date.now() - tempoInicio) / 1000);
  const minutos = String(Math.floor(tempoTotal / 60)).padStart(2, '0');
  const segundos = String(tempoTotal % 60).padStart(2, '0');
  
  // Tenta atualizar o cronômetro no display
  const el = document.getElementById("cronometro");
  if (el) {
    el.textContent = `⏱️ Tempo: ${minutos}:${segundos}`;
  }
  
  // Também tenta atualizar se tiver a classe cronometro-display
  const elDisplay = document.querySelector(".cronometro-display");
  if (elDisplay) {
    elDisplay.textContent = `⏱️ Tempo: ${minutos}:${segundos}`;
  }
}