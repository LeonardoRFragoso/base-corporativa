import { useState } from 'react'
import axios from 'axios'
import SEO from '../components/SEO.jsx'
import { BreadcrumbSchema } from '../components/StructuredData.jsx'
import { api } from '../lib/api.js'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      await api.post('/api/contact/', form)
      setSuccess('Mensagem enviada com sucesso!')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (e) {
      setError('Não foi possível enviar sua mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbItems = [
    { name: 'Início', url: '/' },
    { name: 'Contato', url: '/contact' }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO 
        title="Contato - BASE CORPORATIVA | Fale Conosco"
        description="Entre em contato com a BASE CORPORATIVA. Atendimento especializado de segunda a sexta, das 9h às 18h. Tire suas dúvidas sobre roupas corporativas."
        keywords="contato base corporativa, atendimento roupas corporativas, fale conosco, suporte cliente"
        url="/contact"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">Contato</h1>
        <p className="text-neutral-700 mb-4">
          Fale com a nossa equipe. Atendimento de segunda a sexta, das 9h às 18h.
        </p>
        {success && <div className="mb-6 p-3 rounded bg-green-50 text-green-700 border border-green-200">{success}</div>}
        {error && <div className="mb-6 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

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

          <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-soft space-y-4">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Telefone (opcional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Assunto (opcional)</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Mensagem</label>
              <textarea
                rows="4"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white transition-colors ${loading ? 'bg-neutral-400 cursor-not-allowed' : 'bg-primary-950 hover:bg-primary-800'}`}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
