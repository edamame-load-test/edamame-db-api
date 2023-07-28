import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';

app.listen(process.env.PORT, () => {
  console.log(`Server running and listening on port ${process.env.PORT} :)`);
});