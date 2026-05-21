import { Container, Row, Col, Card } from 'react-bootstrap';

const Bone = ({ w = '100%', h = 16, rounded = false, className = '' }) => (
  <span
    className={`placeholder d-block ${rounded ? 'rounded-circle' : 'rounded'} ${className}`}
    style={{ width: w, height: h }}
    aria-hidden="true"
  />
);

const Glow = ({ children, className = '' }) => (
  <div className={`placeholder-glow ${className}`}>{children}</div>
);

export function SkeletonProductGrid({ count = 8 }) {
  return (
    <section style={{ backgroundColor: '#DAF9DD' }}>
      <Container className="py-4">
        <Row>
          {Array.from({ length: count }).map((_, i) => (
            <Col key={i} lg={3} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Glow><Bone h={200} /></Glow>
                <Card.Body>
                  <Glow className="mb-2"><Bone w="40%" h={20} /></Glow>
                  <Glow className="mb-2"><Bone w="80%" h={22} /></Glow>
                  <Glow className="mb-1"><Bone h={14} /></Glow>
                  <Glow className="mb-3"><Bone w="70%" h={14} /></Glow>
                  <div className="d-flex justify-content-between mb-2">
                    <Glow><Bone w={80} h={24} /></Glow>
                    <Glow><Bone w={60} h={14} /></Glow>
                  </div>
                  <div className="d-flex gap-2">
                    <Glow style={{ flex: 1 }}><Bone h={32} /></Glow>
                    <Glow><Bone w={40} h={32} /></Glow>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export function SkeletonProductDetail() {
  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Glow><Bone h={420} className="rounded" /></Glow>
        </Col>
        <Col md={6} className="mt-4 mt-md-0">
          <Glow className="mb-3"><Bone w="25%" h={22} /></Glow>
          <Glow className="mb-3"><Bone w="75%" h={38} /></Glow>
          <Glow className="mb-1"><Bone h={14} /></Glow>
          <Glow className="mb-4"><Bone w="85%" h={14} /></Glow>
          <Glow className="mb-2"><Bone w="30%" h={32} /></Glow>
          <Glow className="mb-4"><Bone w="40%" h={14} /></Glow>
          <div className="d-flex gap-3">
            <Glow><Bone w={100} h={40} /></Glow>
            <Glow><Bone w={180} h={40} /></Glow>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export function SkeletonDashboard() {
  return (
    <Container className="py-4">
      <Glow className="mb-1"><Bone w={200} h={34} /></Glow>
      <Glow className="mb-4"><Bone w={320} h={16} /></Glow>
      <Row className="mb-5">
        {[1, 2, 3, 4].map(i => (
          <Col key={i} lg={3} md={6} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body className="text-center py-4">
                <Glow className="mb-3"><Bone w={48} h={48} rounded className="mx-auto" /></Glow>
                <Glow className="mb-2"><Bone w="60%" h={28} className="mx-auto" /></Glow>
                <Glow><Bone w="70%" h={14} className="mx-auto" /></Glow>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Glow className="mb-4"><Bone w="50%" h={22} /></Glow>
              <Row>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Col key={i} md={6} className="mb-2">
                    <Glow><Bone h={38} /></Glow>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Glow className="mb-4"><Bone w="50%" h={22} /></Glow>
              {[1, 2, 3].map(i => (
                <div key={i} className="d-flex align-items-center mb-3 p-2 border rounded">
                  <Glow className="me-3"><Bone w={40} h={40} rounded /></Glow>
                  <div className="flex-grow-1">
                    <Glow className="mb-1"><Bone w="60%" h={16} /></Glow>
                    <Glow><Bone w="40%" h={12} /></Glow>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export function SkeletonTable({ rows = 5, cols = 6, title = true }) {
  return (
    <Container className="py-4">
      {title && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Glow className="mb-2"><Bone w={220} h={32} /></Glow>
            <Glow><Bone w={280} h={16} /></Glow>
          </div>
          <div className="d-flex gap-2">
            <Glow><Bone w={140} h={38} /></Glow>
            <Glow><Bone w={100} h={38} /></Glow>
          </div>
        </div>
      )}
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex gap-3 pb-3 border-bottom mb-1">
            {Array.from({ length: cols }).map((_, i) => (
              <Glow key={i} style={{ flex: 1 }}><Bone h={16} /></Glow>
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="d-flex gap-3 py-3 border-bottom">
              {Array.from({ length: cols }).map((_, j) => (
                <Glow key={j} style={{ flex: 1 }}>
                  <Bone h={j === 0 ? 20 : 16} w={j === cols - 1 ? '80%' : '100%'} />
                </Glow>
              ))}
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
}

export function SkeletonOrderList({ count = 4 }) {
  return (
    <Container className="py-5">
      <Glow className="mb-4"><Bone w={180} h={32} /></Glow>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shadow-sm mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div style={{ flex: 1 }}>
                <Glow className="mb-2"><Bone w="35%" h={18} /></Glow>
                <Glow><Bone w="55%" h={14} /></Glow>
              </div>
              <div className="text-end ms-3">
                <Glow className="mb-2"><Bone w={80} h={18} /></Glow>
                <Glow><Bone w={70} h={22} /></Glow>
              </div>
            </div>
            <Glow className="mt-3"><Bone w={90} h={30} /></Glow>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export function SkeletonOrderDetail() {
  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Glow className="mb-2"><Bone w={200} h={30} /></Glow>
          <Glow><Bone w={160} h={14} /></Glow>
        </div>
        <Glow><Bone w={100} h={30} /></Glow>
      </div>
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white"><Glow><Bone w={100} h={18} /></Glow></Card.Header>
            <Card.Body>
              {[1, 2, 3].map(i => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div style={{ flex: 1 }}>
                    <Glow className="mb-1"><Bone w="60%" h={16} /></Glow>
                    <Glow><Bone w="40%" h={12} /></Glow>
                  </div>
                  <Glow><Bone w={60} h={18} /></Glow>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white"><Glow><Bone w={80} h={18} /></Glow></Card.Header>
            <Card.Body>
              {[1, 2].map(i => (
                <div key={i} className="d-flex justify-content-between mb-2">
                  <Glow><Bone w={100} h={16} /></Glow>
                  <Glow><Bone w={60} h={16} /></Glow>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <Glow><Bone w={60} h={22} /></Glow>
                <Glow><Bone w={80} h={22} /></Glow>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export function SkeletonProfile() {
  return (
    <Container className="py-5">
      <Glow className="mb-1"><Bone w={150} h={32} /></Glow>
      <Glow className="mb-4"><Bone w={280} h={16} /></Glow>
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body className="py-4">
              <Glow className="mb-3"><Bone w={80} h={80} rounded className="mx-auto" /></Glow>
              <Glow className="mb-2"><Bone w="65%" h={20} className="mx-auto" /></Glow>
              <Glow className="mb-2"><Bone w="80%" h={14} className="mx-auto" /></Glow>
              <Glow className="mb-3"><Bone w="35%" h={22} className="mx-auto" /></Glow>
              <hr />
              <Glow className="mb-2"><Bone w="70%" h={14} className="mx-auto" /></Glow>
              <Glow><Bone h={34} /></Glow>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex gap-3 mb-4">
                <Glow><Bone w={140} h={36} /></Glow>
                <Glow><Bone w={110} h={36} /></Glow>
              </div>
              {[1, 2].map(i => (
                <div key={i} className="mb-3">
                  <Glow className="mb-1"><Bone w={130} h={14} /></Glow>
                  <Glow><Bone h={38} /></Glow>
                </div>
              ))}
              <Glow className="mt-2"><Bone w={160} h={38} /></Glow>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export function SkeletonForm({ rows = 4 }) {
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Glow className="mb-2"><Bone w={260} h={32} /></Glow>
          <Glow><Bone w={220} h={16} /></Glow>
        </div>
        <Glow><Bone w={100} h={38} /></Glow>
      </div>
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="mb-3">
                  <Glow className="mb-1"><Bone w={130} h={14} /></Glow>
                  <Glow><Bone h={38} /></Glow>
                </div>
              ))}
              <div className="d-flex gap-3 mt-4">
                <Glow><Bone w={160} h={40} /></Glow>
                <Glow><Bone w={100} h={40} /></Glow>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header><Glow><Bone w={100} h={18} /></Glow></Card.Header>
            <Card.Body>
              <Glow className="mb-3"><Bone h={150} /></Glow>
              <Glow className="mb-2"><Bone w="70%" h={18} /></Glow>
              <Glow><Bone w="90%" h={14} /></Glow>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
