import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_URL, SUPABASE_KEY } from './config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const canal = supabase.channel('mensagens-realtime')

canal
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'mensagens' },
    payload => {
      console.log('Nova mensagem inserida:', payload.new)
      atualizarComNovaMensagem(payload.new)
    }
  )
  .subscribe()

function atualizarComNovaMensagem(novaMsg) {
  // Atualiza a mensagem atual
  const h1 = document.getElementById('msgAtual')
  h1.innerText = novaMsg.conteudo

  // Adiciona a antiga mensagem atual ao histórico
  const ul = document.getElementById('listaHistorico')
  const anterior = h1.innerText
  if (anterior && anterior !== novaMsg.conteudo) {
    const li = document.createElement('li')
    li.innerText = anterior
    ul.insertBefore(li, ul.firstChild) // insere no topo
  }
}

async function carregarMensagens() {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('criada_em', { ascending: false })
    .limit(6)

  if (data && data.length > 0) {
    document.getElementById('msgAtual').innerText = data[0].conteudo
    const ul = document.getElementById('listaHistorico')
    ul.innerHTML = ''
    data.slice(1).forEach(msg => {
      const li = document.createElement('li')
      li.innerText = msg.conteudo
      ul.appendChild(li)
    })
  }
}

async function enviar() {
  const conteudo = document.getElementById('novaMsg').value
  if (!conteudo) return
  await supabase.from('mensagens').insert([{ conteudo }])
  document.getElementById('novaMsg').value = ''
  carregarMensagens()
}

let historicoVisivel = false

async function toggleHistorico() {
  const btn = document.getElementById('btnToggleHistorico')
  const ul = document.getElementById('listaHistorico')

  if (!historicoVisivel) {
    // Mostrar histórico completo
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .order('criada_em', { ascending: false })

    if (data && data.length > 0) {
      ul.innerHTML = ''
      data.slice(1).forEach(msg => {
        const li = document.createElement('li')
        li.innerText = msg.conteudo
        ul.appendChild(li)
      })
      historicoVisivel = true
      btn.innerText = 'Ocultar histórico'
    }
  } else {
    // Ocultar e voltar a exibir só os últimos
    await carregarMensagens()
    historicoVisivel = false
    btn.innerText = 'Mostrar histórico completo'
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      console.log('Service Worker registrado:', reg)
    }).catch(err => {
      console.log('Service Worker falhou:', err)
    })
  })
}

document.getElementById('btnEnviar').addEventListener('click', enviar)
document.getElementById('btnToggleHistorico').addEventListener('click', toggleHistorico)

carregarMensagens()