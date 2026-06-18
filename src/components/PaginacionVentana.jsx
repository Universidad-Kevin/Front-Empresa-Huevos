import { Pagination } from 'react-bootstrap'

function getVentana(actual, total, tamano = 4) {
  let inicio = Math.max(1, actual - Math.floor(tamano / 2))
  let fin = Math.min(total, inicio + tamano - 1)
  // Ajustar inicio si fin quedó pegado al límite
  if (fin - inicio + 1 < tamano) {
    inicio = Math.max(1, fin - tamano + 1)
  }
  return { inicio, fin }
}

function PaginacionVentana({ paginaActual, totalPaginas, onChange, size, className = 'mt-4' }) {
  if (totalPaginas <= 1) return null

  const { inicio, fin } = getVentana(paginaActual, totalPaginas)
  const paginas = []
  for (let i = inicio; i <= fin; i++) paginas.push(i)

  return (
    <div className={`d-flex justify-content-center ${className}`}>
      <Pagination size={size}>
        <Pagination.Prev
          onClick={() => onChange(paginaActual - 1)}
          disabled={paginaActual === 1}
        />

        {inicio > 1 && <Pagination.Ellipsis disabled />}

        {paginas.map(p => (
          <Pagination.Item
            key={p}
            active={p === paginaActual}
            onClick={() => onChange(p)}
          >
            {p}
          </Pagination.Item>
        ))}

        {fin < totalPaginas && <Pagination.Ellipsis disabled />}

        <Pagination.Next
          onClick={() => onChange(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        />
      </Pagination>
    </div>
  )
}

export default PaginacionVentana
