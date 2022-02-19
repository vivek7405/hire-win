import { Document, Html, DocumentHead, Main, BlitzScript /*DocumentContext*/ } from "blitz"

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return {...initialProps}
  // }

  render() {
    return (
      <Html lang="en">
        <DocumentHead>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-CL7G43RP1E" />

          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CL7G43RP1E', { page_path: window.location.pathname });
            `,
            }}
          />
        </DocumentHead>
        <body>
          <Main />
          <BlitzScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
