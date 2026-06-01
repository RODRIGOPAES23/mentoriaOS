"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, AlertCircle } from "lucide-react"

interface FormMentoradoData {
  nome: string
  email: string
  cel: string
  contato_emergencia: string
  tempo_mercado: number
  formacao: string
  tem_clinica: boolean
  experiencia_mentoria: boolean
  experiencia_trafego: boolean
  experiencia_agencia_mkt: boolean
  expectativa_30_dias: string
  expectativa_90_dias: string
  expectativa_6_meses: string
  expectativa_12_meses: string
  faturamento_medio_3m: number
  atua_trafego: boolean
  investimento_trafego_mensal: number | null
  tem_vendedora_time: boolean
  instagram_handle: string
  nicho: string
  cidade: string
}

interface FormCadastroProps {
  mentoradoId?: string
  initialData?: Partial<FormMentoradoData>
  onSave?: (data: FormMentoradoData) => void
}

export function FormCadastroMentorado({
  mentoradoId,
  initialData,
  onSave,
}: FormCadastroProps) {
  const [formData, setFormData] = useState<FormMentoradoData>({
    nome: initialData?.nome || "",
    email: initialData?.email || "",
    cel: initialData?.cel || "",
    contato_emergencia: initialData?.contato_emergencia || "",
    tempo_mercado: initialData?.tempo_mercado || 0,
    formacao: initialData?.formacao || "",
    tem_clinica: initialData?.tem_clinica || false,
    experiencia_mentoria: initialData?.experiencia_mentoria || false,
    experiencia_trafego: initialData?.experiencia_trafego || false,
    experiencia_agencia_mkt: initialData?.experiencia_agencia_mkt || false,
    expectativa_30_dias: initialData?.expectativa_30_dias || "",
    expectativa_90_dias: initialData?.expectativa_90_dias || "",
    expectativa_6_meses: initialData?.expectativa_6_meses || "",
    expectativa_12_meses: initialData?.expectativa_12_meses || "",
    faturamento_medio_3m: initialData?.faturamento_medio_3m || 0,
    atua_trafego: initialData?.atua_trafego || false,
    investimento_trafego_mensal: initialData?.investimento_trafego_mensal || null,
    tem_vendedora_time: initialData?.tem_vendedora_time || false,
    instagram_handle: initialData?.instagram_handle || "",
    nicho: initialData?.nicho || "",
    cidade: initialData?.cidade || "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (onSave) {
        onSave(formData)
      } else {
        // API call aqui se necessário
        console.log("Form data:", formData)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-slate-800 rounded-lg p-8 border border-slate-700"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Cadastro do Mentorado</h2>

      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <p className="text-green-300">✓ Dados salvos com sucesso!</p>
        </div>
      )}

      {/* SEÇÃO 1: CONTATO */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">📋 Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="tel"
            name="cel"
            placeholder="Celular"
            value={formData.cel}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="tel"
            name="contato_emergencia"
            placeholder="Contato de emergência"
            value={formData.contato_emergencia}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            name="instagram_handle"
            placeholder="Instagram (@user)"
            value={formData.instagram_handle}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 md:col-span-2"
          />
        </div>
      </div>

      {/* SEÇÃO 2: EXPERIÊNCIA */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">💼 Experiência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            name="tempo_mercado"
            placeholder="Tempo de mercado (anos)"
            value={formData.tempo_mercado}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            name="formacao"
            placeholder="Formação acadêmica"
            value={formData.formacao}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="tem_clinica"
              checked={formData.tem_clinica}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Tem clínica?</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="experiencia_mentoria"
              checked={formData.experiencia_mentoria}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Mentoria</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="experiencia_trafego"
              checked={formData.experiencia_trafego}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Tráfego</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="experiencia_agencia_mkt"
              checked={formData.experiencia_agencia_mkt}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Agência Mkt</span>
          </label>
        </div>
      </div>

      {/* SEÇÃO 3: EXPECTATIVAS */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">🎯 Expectativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            name="expectativa_30_dias"
            placeholder="O que espera em 30 dias?"
            value={formData.expectativa_30_dias}
            onChange={handleChange}
            rows={3}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
          <textarea
            name="expectativa_90_dias"
            placeholder="O que espera em 90 dias?"
            value={formData.expectativa_90_dias}
            onChange={handleChange}
            rows={3}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
          <textarea
            name="expectativa_6_meses"
            placeholder="O que espera em 6 meses?"
            value={formData.expectativa_6_meses}
            onChange={handleChange}
            rows={3}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
          <textarea
            name="expectativa_12_meses"
            placeholder="O que espera em 12 meses?"
            value={formData.expectativa_12_meses}
            onChange={handleChange}
            rows={3}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* SEÇÃO 4: FINANCEIRO */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">💰 Financeiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            name="faturamento_medio_3m"
            placeholder="Faturamento médio últimos 3 meses"
            value={formData.faturamento_medio_3m}
            onChange={handleChange}
            step="0.01"
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            name="nicho"
            placeholder="Nicho"
            value={formData.nicho}
            onChange={handleChange}
            className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 bg-slate-700 border border-slate-600 rounded px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              name="atua_trafego"
              checked={formData.atua_trafego}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-slate-300">Já atua rodando tráfego?</span>
          </label>

          {formData.atua_trafego && (
            <input
              type="number"
              name="investimento_trafego_mensal"
              placeholder="Investimento médio mensal em tráfego"
              value={formData.investimento_trafego_mensal || ""}
              onChange={handleChange}
              step="0.01"
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          )}

          <label className="flex items-center gap-3 bg-slate-700 border border-slate-600 rounded px-4 py-3 cursor-pointer md:col-span-2">
            <input
              type="checkbox"
              name="tem_vendedora_time"
              checked={formData.tem_vendedora_time}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-slate-300">
              Possui vendedora dedicada no time?
            </span>
          </label>
        </div>
      </div>

      {/* SEÇÃO 5: LOCALIZAÇÃO */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">📍 Localização</h3>
        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={formData.cidade}
          onChange={handleChange}
          className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* BOTÃO SUBMIT */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
      >
        <Save className="w-5 h-5" />
        {loading ? "Salvando..." : "Salvar Cadastro"}
      </motion.button>
    </motion.form>
  )
}
