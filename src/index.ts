import { env } from "./config/env.config.ts";
import { app } from "./app.ts";

const port = env.PORT || 3000;

app.listen(port, () => {
    console.log("Auth server up and listening on port", port);
});
