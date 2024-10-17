import app from './app';
const PORT = process.env.PORT || 5000;
import { configureSocket } from './src/socketIO/signellingServer';



const server=app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
configureSocket(server);