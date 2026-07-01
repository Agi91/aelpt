import app from './app';
import { config } from './config';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});
// Using standard console.log with comment bypass since this is the startup process entry point.
