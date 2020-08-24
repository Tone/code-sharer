// import App from "next/app";
import type { AppProps /*, AppContext */ } from 'next/app'
import { RecoilRoot } from 'recoil'

import Message from '../components/message'
import Modal from '../components/modal'
import '../style.css'

function App({ Component, pageProps }: AppProps) {
  return (<RecoilRoot>
    <Component {...pageProps} />
    <Message />
    <Modal />
  </RecoilRoot>)
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext: AppContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);

//   return { ...appProps }
// }

export default App
