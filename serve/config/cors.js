const corsOptions = {
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

export default corsOptions
