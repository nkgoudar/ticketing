import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server

    /*
      1. The url should have the format `http://<SERVICENAME>.<NAMESPACE>.svc.cluster.local`

      2. The way to check existing namespaces is `kubectl get namespace`

      3. The way to check servicenames inside a namespace is `kubectl get services -n <NAMESPACE>`
    */
   
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // We must be on the server
    return axios.create({
      baseURL: "/" // not needed actually
    });
  }
};

export default buildClient;
