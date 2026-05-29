import { app } from "./app";
import { env } from "./config/env";
import { startExpireReservationsJob } from "./jobs/expireReservationsJob";

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
  startExpireReservationsJob();
});