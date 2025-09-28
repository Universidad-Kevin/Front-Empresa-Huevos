function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>🥚 Huevos Orgánicos</h5>
            <p>Producción sostenible y responsable de huevos orgánicos de la más alta calidad.</p>
          </div>
          <div className="col-md-4">
            <h5>Contacto</h5>
            <p>📞 +1 234 567 890<br/>
               📧 info@huevosorganicos.com<br/>
               🏠 Av. Principal 123, Ciudad</p>
          </div>
          <div className="col-md-4">
            <h5>Horario</h5>
            <p>Lunes - Viernes: 8:00 - 18:00<br/>
               Sábado: 9:00 - 14:00<br/>
               Domingo: Cerrado</p>
          </div>
        </div>
        <hr/>
        <div className="text-center">
          <small>&copy; 2024 Huevos Orgánicos. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  )
}

export default Footer