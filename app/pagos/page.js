export default function PagosPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pagos</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block mb-2 font-medium">
              Jugador
            </label>

            <select className="w-full border rounded-lg p-3">
              <option>Seleccionar jugador</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Concepto
            </label>

            <select className="w-full border rounded-lg p-3">
              <option>Mensualidad</option>
              <option>Arbitraje</option>
              <option>Transporte</option>
              <option>Uniforme</option>
              <option>Torneo</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Monto
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Método de pago
            </label>

            <select className="w-full border rounded-lg p-3">
              <option>Efectivo</option>
              <option>Transferencia</option>
            </select>
          </div>

        </div>

        <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg">
          Guardar pago
        </button>
      </div>
    </div>
  )
}