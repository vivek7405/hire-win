import LandingLayout from "app/core/layouts/LandingLayout"
import { GetStaticPropsContext } from "blitz"
import path from "path"

export async function getStaticProps(context: GetStaticPropsContext) {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  return {
    props: {},
  }
}

export default function Refunds({}) {
  return (
    <LandingLayout title="hire-win | Refunds">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl">Refund Policy</h1>
      </div>
      {/* <div>
        <h1>Return &amp; Refund Policy</h1> <p>Updated at 2022-07-27</p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Definitions and key terms</h1>{" "}
        <p>
          <span>
            To help explain things as clearly as possible in this Return &amp; Refund Policy, every
            time any of these terms are referenced, are strictly defined as:
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <ul>
          <li>
            <span>
              <strong>Company:</strong> when this policy mentions “Company,” “we,” “us,” or “our,”
              it refers to <a>hire.win</a>,{" "}
              <a>202, Parmeshwar Flat, Opp. Champa Tower, Near Rupani Diwadi, Bhavnagar - 364001</a>{" "}
              that is responsible for your information under this Return &amp; Refund Policy.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Customer:</strong> refers to the company, organization or person that signs up
              to use the Service to manage the relationships with your consumers or service users.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Device:</strong> any internet connected device such as a phone, tablet,
              computer or any other device that can be used to visit and use the services.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Service:</strong> refers to the service provided by <a>hire.win</a> as
              described in the relative terms (if available) and on this platform.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Website:</strong> <a>hire.win</a>’s site, which can be accessed via this URL:{" "}
              <a>https://hire.win.</a>
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>You:</strong> a person or entity that is registered with <a>hire.win</a> to
              use the Services.
              <br />
            </span>
          </li>
        </ul>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Return &amp; Refund Policy</h1>{" "}
        <p>
          <span>
            Thanks for shopping at <a>hire.win</a>. We appreciate the fact that you like to buy the
            stuff we build. We also want to make sure you have a rewarding experience while you’re
            exploring, evaluating, and purchasing our products.
            <br />
            <br />
            As with any shopping experience, there are terms and conditions that apply to
            transactions at <a>hire.win</a>. We’ll be as brief as our attorneys will allow. The main
            thing to remember is that by placing an order or making a purchase at <a>hire.win</a>,
            you agree to the terms set forth below along with <a>hire.win</a>’s&nbsp;Privacy Policy.
            <br />
            <br />
            If there’s something wrong with the product you bought, or if you are not happy with it,
            you have () to issue a refund and return your item.
            <br />
            <br />
            If you would like to return a product, the only way would be if you follow the next
            guidelines:
          </span>
        </p>{" "}
        <ul> </ul>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Refunds</h1>{" "}
        <p>
          <span>
            We at&nbsp;<a>hire.win</a>&nbsp;commit ourselves to serving our customers with the best
            products. Every single product that you choose is thoroughly inspected, checked for
            defects and packaged with utmost care. We do this to ensure that you fall in love with
            our products.
            <br />
            <br />
            Sadly, there are times when we may not have the product(s) that you choose in stock, or
            may face some issues with our inventory and quality check. In such cases, we may have to
            cancel your order. You will be intimated about it in advance so that you {`don't`} have
            to worry unnecessarily about your order. If you have purchased via Online payment (not
            Cash on Delivery), then you will be refunded once our team confirms your request.
            <br />
            <br />
            We carry out thorough quality check before processing the ordered item. We take utmost
            care while packing the product. At the same time we ensure that the packing is good such
            that the items won’t get damaged during transit. Please note that <a>hire.win</a> is not
            liable for damages that are caused to the items during transit or transportation.
            <br />
            <br />
            We will revise your returned product as soon as we receive it and if it follows the
            guidelines addressed above, we will proceed to issue a refund of your purchase. Your
            refund may take a couple of days to process but you will be notified when you receive
            your money.
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Shipping</h1>{" "}
        <p>
          <span>
            <a>hire.win</a> is not responsible for return shipping costs. Every shipping has to be
            paid by the customer, even if the item had free shipping in the first place, the
            customer has to pay for the shipping in return.
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Your Consent</h1>{" "}
        <p>
          <span>
            By using our platform, registering an account, or making a purchase, you hereby consent
            to our Return &amp; Refund Policy and agree to its terms.
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Changes To Our Return &amp; Refund Policy</h1>{" "}
        <p>
          <span>
            Should we update, amend or make any changes to this document so that they accurately
            reflect our Service and policies. Unless otherwise required by law, those changes will
            be prominently posted here. Then, if you continue to use the Service, you will be bound
            by the updated Return &amp; Refund Policy. If you do not want to agree to this or any
            updated Return &amp; Refund Policy, you can delete your account.
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1>Contact Us</h1>{" "}
        <p>
          <span>
            If, for any reason, You are not completely satisfied with any good or service that we
            provide, {`don't`} hesitate to contact us and we will discuss any of the issues you are
            going through with our product.
          </span>
        </p>{" "}
        <ul>
          <li>
            <span>
              Via Email: <a>support@hire.win</a>
            </span>
          </li>{" "}
        </ul>
      </div> */}
    </LandingLayout>
  )
}
