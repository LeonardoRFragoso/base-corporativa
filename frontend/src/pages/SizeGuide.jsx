export default function SizeGuide() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">Guia de Tamanhos</h1>
        <p className="text-neutral-700 mb-8">Consulte as medidas para encontrar o ajuste ideal.</p>
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-neutral-600 mb-3">
              <div>Tamanho</div>
              <div>Peito (cm)</div>
              <div>Cintura (cm)</div>
              <div>Quadril (cm)</div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                {size:'P', chest:'88-94', waist:'76-82', hip:'90-96'},
                {size:'M', chest:'95-100', waist:'83-88', hip:'97-102'},
                {size:'G', chest:'101-106', waist:'89-94', hip:'103-108'},
                {size:'GG', chest:'107-112', waist:'95-100', hip:'109-114'},
              ].map(row => (
                <div key={row.size} className="grid grid-cols-4 gap-4 bg-neutral-50 rounded px-4 py-3">
                  <div className="font-semibold text-primary-950">{row.size}</div>
                  <div>{row.chest}</div>
                  <div>{row.waist}</div>
                  <div>{row.hip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-sm text-neutral-600 mt-4">As medidas são aproximadas e podem variar conforme o modelo.</div>
      </div>
    </div>
  )
}
