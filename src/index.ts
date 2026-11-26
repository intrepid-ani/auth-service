import { env } from "./config/env.config";
import { app } from "./app";
import { logger } from "./config/logger/logger.config";

const port = env.PORT || 3000;

app.listen(port, () => {
    try {
        logger.info("Server is running successfully");
    } catch (_err) {
        // eslint-disable-next-line no-console
        console.log("Unknown error while logging");
    }
});
