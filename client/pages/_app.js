import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";
import PaytmScript from "../scripts/paytm";
import Router from "next/router"

import NProgress from 'nprogress';

import getConfig from 'next/config';

const getNodeEnv = () => {
  const { publicRuntimeConfig } = getConfig();

  const isProd = publicRuntimeConfig.isProd || false;
  const isStaging = publicRuntimeConfig. isStaging || false;
  NProgress.configure({ showSpinner: false });

  return { isProd, isStaging }
};

const env = getNodeEnv()

console.log(env)


Router.onRouteChangeStart = () => {
  console.log('onRouteChangeStart triggered: START LOADER');
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  console.log('onRouteChangeComplete triggered: STOP LOADER');
  NProgress.done();
};

Router.onRouteChangeError = () => {
  console.log('onRouteChangeError triggered: STOP LOADER');
  NProgress.done();
};

const AppComponent = ({ Component, pageProps, currentUser }) => {

  return (
    <div>
      
      <Header currentUser={currentUser}>
      </Header>
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return { pageProps, ...data };
};

export default AppComponent;
