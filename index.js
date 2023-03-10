require('dotenv').config()

const app = require('./app')

app.listen(process.env.PORT, () => {
  console.log(`Server running and listening on port ${process.env.PORT} :)`);
})