import { AppProps } from "next/app";
import { ThirdwebProvider } from "thirdweb/react";
import "../styles/global.css";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div>
                <ThirdwebProvider>
                    <Component {...pageProps} />
                </ThirdwebProvider>
        </div>
    )
}