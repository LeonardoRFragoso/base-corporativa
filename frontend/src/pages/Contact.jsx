export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">Contato</h1>
        <p className="text-neutral-700 mb-8">
          Fale com a nossa equipe. Atendimento de segunda a sexta, das 9h às 18h.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-soft">
            <div>
              <div className="text-sm text-neutral-500">E-mail</div>
              <div className="font-medium text-primary-950">contato@basecorporativa.com</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Telefone</div>
              <div className="font-medium text-primary-950">(11) 99999-9999</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Horário</div>
              <div className="font-medium text-primary-950">Seg-Sex 9h às 18h</div>
            </div>
          </div>

          <form className="bg-white p-6 rounded-lg shadow-soft space-y-4">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Nome</label>
              <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">E-mail</label>
              <input type="email" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Mensagem</label>
              <textarea rows="4" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent" />
            </div>
            <button type="button" className="w-full py-3 bg-primary-950 text-white rounded-lg hover:bg-primary-800 transition-colors">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  )
}
