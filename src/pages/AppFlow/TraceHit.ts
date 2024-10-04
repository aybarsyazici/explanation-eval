import { NotificationInstance } from "antd/es/notification/interface";

export const traceHit = (
  backendUrlHttp: string,
  resultsForBackend: any,
  result_fn: () => void,
  api: NotificationInstance
) => {
  fetch(`${backendUrlHttp}/trace`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resultsForBackend),
  })
    .then((response) =>
      response.json().then((data) => {
        console.log("Trace Data:", data);
        // Go to results page.
        result_fn();
      })
    )
    .catch((error) => {
      console.log(error);
      api.error({
        duration: 0,
        message: "Error",
        description: "Something went wrong. Please try again.",
        placement: "top",
      });
    });
};
