import * as React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AnimatedSplash from "../src/components/AnimatedSplash"; // create this file as needed

const theme = createTheme({
  palette: {
    primary: { main: "#388e3c" },
    secondary: { main: "#fbc02d" },
  },
  typography: { fontFamily: "'Poppins', system-ui, sans-serif" },
});

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = React.useState(true);
  React.useEffect(() => {
    const seen = sessionStorage.getItem("splash_seen_v1");
    if (seen) setShowSplash(false);
  }, []);
  function handleSplashFinish() {
    sessionStorage.setItem("splash_seen_v1", "1");
    setShowSplash(false);
  }
  const logoPath = "/logo.jpeg"; // Or your real path

  return <>
    <Head>
      <title>Temple Waste Management</title>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </Head>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showSplash
        ? <AnimatedSplash logoSrc={logoPath} duration={2500} onFinish={handleSplashFinish} />
        : <Component {...pageProps} />}
    </ThemeProvider>
  </>;
}
MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
