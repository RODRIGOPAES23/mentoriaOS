// Widget embed do Vendedor SPIN — cole em qualquer site:
//   <script src="https://SEU-DOMINIO/widget.js" data-campanha="cklareza" async></script>
(function () {
  var script = document.currentScript
  var origin = new URL(script.src).origin
  var aberto = false

  // botão flutuante
  var botao = document.createElement("button")
  botao.innerHTML = "💬"
  botao.setAttribute("aria-label", "Falar com vendas")
  botao.style.cssText =
    "position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;border:none;background:#00a884;color:#fff;font-size:26px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:999999"

  // iframe do chat
  var frame = document.createElement("iframe")
  frame.src = origin + "/"
  frame.style.cssText =
    "position:fixed;bottom:90px;right:20px;width:380px;max-width:92vw;height:580px;max-height:78vh;border:none;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.3);z-index:999999;display:none;background:#0b141a"

  botao.onclick = function () {
    aberto = !aberto
    frame.style.display = aberto ? "block" : "none"
    botao.innerHTML = aberto ? "✕" : "💬"
  }

  document.body.appendChild(frame)
  document.body.appendChild(botao)
})()
