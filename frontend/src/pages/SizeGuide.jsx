export default function SizeGuide() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">Guia de Tamanhos</h1>
        <p className="text-neutral-700 dark:text-neutral-300 mb-8">Consulte as medidas para encontrar o ajuste ideal.</p>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {[
            {size:'P', chest:'88-94', waist:'76-82', hip:'90-96'},
            {size:'M', chest:'95-100', waist:'83-88', hip:'97-102'},
            {size:'G', chest:'101-106', waist:'89-94', hip:'103-108'},
            {size:'GG', chest:'107-112', waist:'95-100', hip:'109-114'},
          ].map(row => (
            <div key={row.size} className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-primary-950">{row.size}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-500">Tamanho</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-neutral-500 dark:text-neutral-500">Peito (cm)</div>
                <div className="text-neutral-800 dark:text-neutral-200">{row.chest}</div>
                <div className="text-neutral-500 dark:text-neutral-500">Cintura (cm)</div>
                <div className="text-neutral-800 dark:text-neutral-200">{row.waist}</div>
                <div className="text-neutral-500 dark:text-neutral-500">Quadril (cm)</div>
                <div className="text-neutral-800 dark:text-neutral-200">{row.hip}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white dark:bg-neutral-800 rounded-lg shadow-soft overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
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
                <div key={row.size} className="grid grid-cols-4 gap-4 bg-neutral-50 dark:bg-neutral-900 rounded px-4 py-3">
                  <div className="font-semibold text-primary-950">{row.size}</div>
                  <div>{row.chest}</div>
                  <div>{row.waist}</div>
                  <div>{row.hip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">As medidas são aproximadas e podem variar conforme o modelo.</div>
      </div>
    </div>
  )
}
