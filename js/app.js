import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_URL, SUPABASE_KEY } from './config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function carregarMensagens() {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('criada_em', { ascending: false })
    .limit(5)

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

document.getElementById('btnEnviar').addEventListener('click', enviar)
carregarMensagens()
