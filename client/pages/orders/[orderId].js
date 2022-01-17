import axios from "axios";
import { useEffect, useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";
import PaytmScript from "../../scripts/paytm";

const OrderShow = ({ order }) => {
  let paymentResponse;
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: `/api/payments/initiate`,
    method: "post",
    body: {orderId: order.id},
    onSuccess: ({token}) => {
      console.log(token);
      paytmToken = token;
    },
  });

  const initializepaytm = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/XXhoUr33188320102207.js";
      script.type = "application/javascript";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const doRequest1 = async () => {
    const resp = await axios.post("/api/payments/update", {orderId: order.id});
    console.log("Response from update API: ",resp);
    Router.push("/orders");
  }

  let paytmToken = "";

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    console.log(order);
    if(order.status === "complete") {
      Router.push("/");
    }

    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order expired!</div>;
  }

  const makePayment = async () => {

    console.log("START LOADER");

    await initializepaytm();
    console.log("Paytm initialized");

    // const { data } = await client.get(`/api/payments/initiate/${order.id}`);
    await doRequest();

    const token = paytmToken;
    console.log("Make payment is called");
    const config = {
      root: "",
      style: {
        bodyBackgroundColor: "#fafafb",
        bodyColor: "",
        themeBackgroundColor: "#0FB8C9",
        themeColor: "#ffffff",
        headerBackgroundColor: "#284055",
        headerColor: "#ffffff",
        errorColor: "",
        successColor: "",
        card: {
          padding: "",
          backgroundColor: "",
        },
      },
      data: {
        orderId: order.id,
        token,
        tokenType: "TXN_TOKEN",
        amount: (order.ticket.price - 2).toFixed(2)
      },
      payMode: {
        labels: {},
        filter: {
          exclude: [],
        },
        order: ["CC", "DC", "NB", "UPI", "PPBL", "PPI", "BALANCE"],
      },
      website: "YOUR_WEBSITE_NAME",
      flow: "DEFAULT",
      merchant: {
        mid: "XXhoUr33188320102207",
        redirect: false,
      },
      handler: {
        transactionStatus: async function transactionStatus(paymentStatus) {
          console.log(paymentStatus);
          paymentResponse = paymentStatus;
          window.Paytm.CheckoutJS.close();
          await doRequest1();
          console.log("STOP LOADER");
        },
        notifyMerchant: async function notifyMerchant(eventName, data) {
          console.log("Closed");
          window.Paytm.CheckoutJS.close();
          await doRequest1();
          console.log("STOP LOADER");
        },
      },
    };
    console.log(window.Paytm)
    try {
      if (window.Paytm && window.Paytm.CheckoutJS) {
        await window.Paytm.CheckoutJS.init(config);
        console.log("PAYTM INVOKE SUCCESS")
        window.Paytm.CheckoutJS.invoke();
        console.log("STOP LOADER");
      } else {
        console.log("Paytm Undefined");
        console.log("STOP LOADER");
      }
    } catch (err) {
      console.log("PAYTM INVOKE ERROR", err);
      console.log("STOP LOADER");
    }
    // if (window.Paytm && window.Paytm.CheckoutJS) {
    //   window.Paytm.CheckoutJS.init(config)
    //     .then(function onSuccess() {
    //       console.log("PAYTM INVOKE SUCCESS")
    //       window.Paytm.CheckoutJS.invoke();
    //     })
    //     .catch(function onError(error) {
    //       console.log("PAYTM INVOKE ERROR")
    //       console.log("Error => ", error);
    //     });
    // }
  };

  return (
    <div>
      <div>Time left to pay: {timeLeft} seconds</div>
      <button className="btn btn-primary" onClick={makePayment}>
        Pay: {order.ticket.price}
      </button>
      <PaytmScript></PaytmScript>
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
