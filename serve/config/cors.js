const corsOptions = {
  origin: 'http://localhost:9527',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

export default corsOptions
