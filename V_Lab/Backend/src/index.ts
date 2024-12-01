import app from "./app";
import logger from './utils/logger';

const port = process.env.PORT || 5000;
app.listen(port, () => {
    // logger.info(`Server started and listening on port ${port}`);
    console.log(`Server started and listening on port ${port}`);
});