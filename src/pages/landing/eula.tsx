import { gSP } from "src/blitz-server"
import LandingLayout from "src/core/layouts/LandingLayout"
import path from "path"

export const getStaticProps = gSP(async function getStaticProps(context) {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  return {
    props: {},
  }
})

export default function EULA({}) {
  return (
    <LandingLayout title="Hire.win | EULA">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl">EULA</h1>
      </div>
      <div>
        <h1 className="font-bold">End-User License Agreement</h1> <p>Updated at 2022-07-27</p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1 className="font-bold">Definitions and key terms</h1>{" "}
        <p>
          <span>
            To help explain things as clearly as possible in this Eula, every time any of these
            terms are referenced, are strictly defined as:
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <ul>
          <li>
            <span>
              <strong>Cookie:</strong> small amount of data generated by a website and saved by your
              web browser. It is used to identify your browser, provide analytics, remember
              information about you such as your language preference or login information.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Company:</strong> when this policy mentions “Company,” “we,” “us,” or “our,”
              it refers to <a>hire.win</a>,{" "}
              <a>202, Parmeshwar Flat, Opp. Champa Tower, Near Rupani Diwadi, Bhavnagar - 364001</a>{" "}
              that is responsible for your information under this Eula.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Country:</strong> where <a>hire.win</a> or the owners/founders of{" "}
              <a>hire.win</a> are based, in this case is <a></a>.<br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Device:</strong> any internet connected device such as a phone, tablet,
              computer or any other device that can be used to visit <a>hire.win</a> and use the
              services.
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
              <strong>Third-party service:</strong> refers to advertisers, contest sponsors,
              promotional and marketing partners, and others who provide our content or whose
              products or services we think may interest you.
              <br />
            </span>
          </li>{" "}
          <li>
            <span>
              <strong>Website:</strong> <a>hire.win</a>’s site, which can be accessed via this URL:{" "}
              <a>.</a>
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
        <h1 className="font-bold">Introduction</h1>{" "}
        <p>
          <span>
            This End User License Agreement (the “Agreement”) is a binding agreement between you
            (“End User”,“you” or “your”) and hire.win (“Company”, “we”, “us” or “our”). This
            Agreement governs the relationship between you and us, and your use of the Company{" "}
            <a>hire.win</a>. Throughout this Agreement, End User and Company may each be referred to
            as a “Party” or collectively, the “Parties”.
            <br />
            <br />
            If you are using the website on behalf of your employer or other entity (an
            “Organisation”) for whose benefit you utilise the website or who owns or otherwise
            controls the means through which you utilise or access the website, then the terms “End
            User”, “you”, and “your” shall apply collectively to you as an individual and to the
            Organisation. If you use, or purchase a license or to, the website on behalf of an
            Organisation, you hereby acknowledge, warrant, and covenant that you have the authority
            to 1) purchase a license to the website on behalf of the Organisation; 2) bind the
            Organisation to the terms of this Agreement.
            <br />
            <br />
            By downloading, installing, accessing, or using the website you: (a) affirm that you
            have all of the necessary permissions and authorisations to access and use the website;
            (b) if you are using the website pursuant to a license purchased by an organisation,
            that you are authorised by that organisation to access and use the website(c)
            acknowledge that you have read and that you understand this agreement; (d) represent
            that you are of sound mind and of legal age (18 years of age or older) to enter into a
            binding agreement; and (e) accept and agree to be legally bound by the terms and
            conditions of this agreement.
            <br />
            <br />
            If you do not agree to these terms, do not download, install, access, or use the
            software. if you have already downloaded the software, delete it from your computing
            device.
            <br />
            <br />
            The Application is licensed, not sold, to you by <a>hire.win</a> for use strictly in
            accordance with the terms of this Agreement.
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1 className="font-bold">License</h1>{" "}
        <p>
          <span>
            Subject to the terms of this Agreement and, if applicable, those terms provided in the
            License Agreement, <a>hire.win</a> grants you a limited, non-exclusive, perpetual,
            revocable, and non-transferable license to:
            <br />
            <br />
            (a) download, install and use the Software on one (1) Computing Device per single user
            license that you have purchased and been granted. If you have multiple Computer Devices
            in which you wish to use the Software, you agree to acquire a license for the number of
            devices you intend to use;
            <br />
            <br />
            (b) access, view, and use on such Computing Device the End User Provided Materials made
            available in or otherwise accessible through the Software, strictly in accordance with
            this Agreement, and any other terms and conditions applicable to such End User Provided
            Materials;
            <br />
            <br />
            (c) install and use the trial version of the Software on any number of Computing Devices
            for a trial period of fifteen (15) unique days after installation.
            <br />
            <br />
            (d) receive updates and new features that become available during the one (1) year
            period from the date on which you purchased the license to the Software.{" "}
          </span>
        </p>{" "}
        <p>
          <br />
        </p>{" "}
        <h1 className="font-bold">Restrictions</h1>{" "}
        <p>
          <span>
            You agree not to, and you will not permit others to:
            <ul>
              <li>
                <span>
                  License, sell, rent, lease, assign, distribute, transmit, host, outsource,
                  disclose or otherwise commercially exploit the Application or make the Application
                  available to any third party.
                </span>
              </li>{" "}
              <li>
                <span>
                  Modify, make derivative works of, disassemble, decrypt, reverse compile or reverse
                  engineer any part of the Application.
                </span>
              </li>{" "}
              <li>
                <span>
                  Remove, alter or obscure any proprietary notice (including any notice of copyright
                  or trademark) of <a>hire.win</a> or its affiliates, partners, suppliers or the
                  licensors of the Application.
                </span>
              </li>
            </ul>{" "}
            <p>
              <br />
            </p>{" "}
            <h1 className="font-bold">Intellectual Property</h1>{" "}
            <p>
              <span>
                All intellectual property rights, including copyrights, patents, patent disclosures
                and inventions (whether patentable or not), trademarks service marks, trade secrets,
                know-how and other confidential information, trade dress, trade names, logos,
                corporate names and domain names, together with all of the good will associated
                there with, derivative works and all other rights (collectively, “Intellectual
                Property Rights”) that are part of the Software that are otherwise owned by{" "}
                <a>hire.win</a> shall always remain the exclusive property of <a>hire.win</a> (or of
                its suppliers or licensors, if and when applicable). Nothing in this Agreement
                grants you (or any Organisation) a license to <a>hire.win</a>’s Intellectual
                Property Rights.
                <br />
                <br />
                You agree that this is Agreement conveys a limited license to use <a>hire.win</a>’s
                Intellectual Property Rights, solely as part of the Software (and not independently
                of it), and only for the effective Term of the license granted to you hereunder.
                Accordingly, your use of any of <a>hire.win</a>’s Intellectual Property Rights
                independently of the Software or outside the scope of this Agreement shall be
                considered an infringement of <a>hire.win</a>’s Intellectual Property Rights. This
                shall not limit, however, any claim <a>hire.win</a> may have for a breach of
                contract in the event you breach a term or condition of this Agreement. You shall
                use the highest standard of care to safeguard all Software (including all copies
                thereof) from infringement, misappropriation, theft, misuse or unauthorised access.
                Except as expressly granted in this Agreement, <a>hire.win</a> reserves and shall
                retain all rights, title, and interest in the Software, including all copyrights and
                copyrightable subject matter, trademarks and trademark able subject matter, patents
                and patentable subject matter, trade secrets, and other intellectual property
                rights, registered, unregistered, granted, applied-for, or both now in existence or
                that may be created, relating to the thereto.
                <br />
                <br />
                You (or the Organisation, if and as applicable) shall retain ownership of all
                Intellectual Property Rights in and to the work products that you create through or
                with the assistance of the Software.
              </span>
            </p>{" "}
            <p>
              <br />
            </p>{" "}
            <h1 className="font-bold">Your Suggestions</h1>{" "}
            <p>
              <span>
                Any feedback, comments, ideas, improvements or suggestions (collectively,
                {`"`}Suggestions{`"`}) provided by you to <a>hire.win</a> with respect to the
                Application shall remain the sole and exclusive property of <a>hire.win</a>.
                <br />
                <br /> <a>hire.win</a> shall be free to use, copy, modify, publish, or redistribute
                the Suggestions for any purpose and in any way without any credit or any
                compensation to you.
              </span>
            </p>{" "}
            <p>
              <br />
            </p>{" "}
            <h1 className="font-bold">Modifications to Application</h1>{" "}
            <p>
              <span>
                <a>hire.win</a> reserves the right to modify, suspend or discontinue, temporarily or
                permanently, the Application or any service to which it connects, with or without
                notice and without liability to you.
              </span>
            </p>{" "}
            <p>
              <br />
            </p>{" "}
            <h1 className="font-bold">Updates to Application</h1>{" "}
            <p>
              <span>
                <a>hire.win</a> may from time to time provide enhancements or improvements to the
                features/ functionality of the Application, which may include patches, bug fixes,
                updates, upgrades and other modifications ({`"`}Updates{`"`}).
                <br />
                <br />
                Updates may modify or delete certain features and/or functionalities of the
                Application. You agree that <a>hire.win</a> has no obligation to (i) provide any
                Updates, or (ii) continue to provide or enable any particular features and/or
                functionalities of the Application to you.
                <br />
                <br />
                You further agree that all Updates will be (i) deemed to constitute an integral part
                of the Application, and (ii) subject to the terms and conditions of this Agreement.
              </span>
            </p>{" "}
            <p>
              <br />
            </p>{" "}
            <h1 className="font-bold">Third-Party Services</h1>{" "}
            <p>
              <span>
                The Application may display, include or make available third-party content
                (including data, information, applications and other products services) or provide
                links to third-party websites or services ({`"`}Third- Party Services{`"`}).
              </span>
            </p>{" "}
            <p>
              <span>
                You acknowledge and agree that <a>hire.win</a> shall not be responsible for any
                Third-Party Services, including their accuracy, completeness, timeliness, validity,
                copyright compliance, legality, decency, quality or any other aspect thereof.{" "}
                <a>hire.win</a> does not assume and shall not have any liability or responsibility
                to you or any other person or entity for any Third-Party Services.
                <p>
                  <span>
                    Third-Party Services and links thereto are provided solely as a convenience to
                    you and you access and use them entirely at your own risk and subject to such
                    third {`parties'`} terms and conditions.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Term and Termination</h1>{" "}
                <p>
                  <span>
                    This Agreement shall remain in effect until terminated by you or <a>hire.win</a>
                    .
                    <br />
                    <br /> <a>hire.win</a> may, in its sole discretion, at any time and for any or
                    no reason, suspend or terminate this Agreement with or without prior notice.
                    <br />
                    <br />
                    This Agreement will terminate immediately, without prior notice from{" "}
                    <a>hire.win</a>, in the event that you fail to comply with any provision of this
                    Agreement. You may also terminate this Agreement by deleting the Application and
                    all copies thereof from your computer.
                    <br />
                    <br />
                    Upon termination of this Agreement, you shall cease all use of the Application
                    and delete all copies of the Application from your computer.
                    <br />
                    <br />
                    Termination of this Agreement will not limit any of <a>hire.win</a>’s rights or
                    remedies at law or in equity in case of breach by you (during the term of this
                    Agreement) of any of your obligations under the present Agreement.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Indemnification</h1>{" "}
                <p>
                  <span>
                    You agree to indemnify, defend and hold harmless <a>hire.win</a> and its
                    officers, directors, employees, agents, affiliates, successors, and assigns from
                    and against any and all losses, damages, liabilities, deficiencies, claims,
                    actions, judgments, settlements, interest, awards, penalties, fines, costs, or
                    expenses of whatever kind, including reasonable attorneys’ fees, arising from or
                    relating to: i) your use or misuse of the Software; ii) your failure to comply
                    with any applicable law, regulation, or government directive; iii) your breach
                    of this Agreement; or iv) your agreement or relationship with an Organisation
                    (if applicable) or any third party. Furthermore, you agree that <a>hire.win</a>{" "}
                    assumes no responsibility for the information or content you submit or make
                    available through this Software or the content that is made available to you by
                    third parties.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">No Warranties</h1>{" "}
                <p>
                  <span>
                    The Application is provided to you {`"`}AS IS{`"`} and {`"`}AS AVAILABLE{`"`}{" "}
                    and with all faults and defects without warranty of any kind. To the maximum
                    extent permitted under applicable law, <a>hire.win</a>, on its own behalf and on
                    behalf of its affiliates and its and their respective licensors and service
                    providers, expressly disclaims all warranties, whether express, implied,
                    statutory or otherwise, with respect to the Application, including all implied
                    warranties of merchantability, fitness for a particular purpose, title and
                    non-infringement, and warranties that may arise out of course of dealing, course
                    of performance, usage or trade practice. Without limitation to the foregoing,{" "}
                    <a>hire.win</a> provides no warranty or undertaking, and makes no representation
                    of any kind that the Application will meet your requirements, achieve any
                    intended results, be compatible or work with any other software, applications,
                    systems or services, operate without interruption, meet any performance or
                    reliability standards or be error free or that any errors or defects can or will
                    be corrected.
                    <br />
                    <br />
                    Without limiting the foregoing, neither <a>hire.win</a> nor any <a>hire.win</a>
                    ’s provider makes any representation or warranty of any kind, express or
                    implied: (i) as to the operation or availability of the Application, or the
                    information, content, and materials or products included thereon; (ii) that the
                    Application will be uninterrupted or error-free; (iii) as to the accuracy,
                    reliability, or currency of any information or content provided through the
                    Application; or (iv) that the Application, its servers, the content, or e-mails
                    sent from or on behalf of <a>hire.win</a> are free of viruses, scripts, trojan
                    horses, worms, malware, time bombs or other harmful components.
                    <br />
                    <br />
                    Some jurisdictions do not allow the exclusion of or limitations on implied
                    warranties or the limitations on the applicable statutory rights of a consumer,
                    so some or all of the above exclusions and limitations may not apply to you.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Limitation of Liability</h1>{" "}
                <p>
                  <span>
                    Notwithstanding any damages that you might incur, the entire liability of{" "}
                    <a>hire.win</a> and any of its suppliers under any provision of this Agreement
                    and your exclusive remedy for all of the foregoing shall be limited to the
                    amount actually paid by you for the Application.
                    <br />
                    <br />
                    To the maximum extent permitted by applicable law, in no event shall{" "}
                    <a>hire.win</a> or its suppliers be liable for any special, incidental,
                    indirect, or consequential damages whatsoever (including, but not limited to,
                    damages for loss of profits, for loss of data or other information, for business
                    interruption, for personal injury, for loss of privacy arising out of or in any
                    way related to the use of or inability to use the Application, third-party
                    software and/or third-party hardware used with the Application, or otherwise in
                    connection with any provision of this Agreement), even if <a>hire.win</a> or any
                    supplier has been advised of the possibility of such damages and even if the
                    remedy fails of its essential purpose.
                    <br />
                    <br />
                    Some states/jurisdictions do not allow the exclusion or limitation of incidental
                    or consequential damages, so the above limitation or exclusion may not apply to
                    you.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Severability</h1>{" "}
                <p>
                  <span>
                    If any provision of this Agreement is held to be unenforceable or invalid, such
                    provision will be changed and interpreted to accomplish the objectives of such
                    provision to the greatest extent possible under applicable law and the remaining
                    provisions will continue in full force and effect.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Waiver</h1>{" "}
                <p>
                  <span>
                    No failure to exercise, and no delay in exercising, on the part of either party,
                    any right or any power under this Agreement shall operate as a waiver of that
                    right or power. Nor shall any single or partial exercise of any right or power
                    under this Agreement preclude further exercise of that or any other right
                    granted herein. In the event of a conflict between this Agreement and any
                    applicable purchase or other terms, the terms of this Agreement shall govern.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Amendments to this Agreement</h1>{" "}
                <p>
                  <span>
                    <a>hire.win</a> reserves the right, at its sole discretion, to modify or replace
                    this Agreement at any time. If a revision is material we will provide at least
                    30 {`days'`} notice prior to any new terms taking effect. What constitutes a
                    material change will be determined at our sole discretion.
                    <br />
                    <br />
                    By continuing to access or use our Application after any revisions become
                    effective, you agree to be bound by the revised terms. If you do not agree to
                    the new terms, you are no longer authorized to use the Application.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Governing Law</h1>{" "}
                <p>
                  <span>
                    The laws of India, excluding its conflicts of law rules, shall govern this
                    Agreement and your use of the Application. Your use of the Application may also
                    be subject to other local, state, national, or international laws.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Changes to this agreement</h1>{" "}
                <p>
                  <span>
                    We reserve the exclusive right to make changes to this Agreement from time to
                    time. Your continued access to and use of the website constitutes your agreement
                    to be bound by, and your acceptance of, the terms and conditions posted at such
                    time. You acknowledge and agree that you accept this Agreement (and any
                    amendments thereto) each time you load, access, or use the website. Therefore,
                    we encourage you to review this Agreement regularly.
                  </span>
                </p>{" "}
                <p>
                  <span>
                    If, within thirty (30) days of us posting changes or amendments to this
                    Agreement, you decide that you do not agree to the updated terms, you may
                    withdraw your acceptance to the amended terms by providing us with written
                    notice of your withdrawal. Upon providing us with the written notice of the
                    withdrawal of your acceptance, you are no longer authorised to access or use the
                    website.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">No Employment or Agency Relationship</h1>{" "}
                <p>
                  <span>
                    No provision of this Agreement, or any part of relationship between you and{" "}
                    <a>hire.win</a>, is intended to create nor shall they be deemed or construed to
                    create any relationship between you and <a>hire.win</a> other than that of and
                    end user of the website and services provided.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Equitable Relief</h1>{" "}
                <p>
                  <span>
                    You acknowledge and agree that your breach of this Agreement would cause{" "}
                    <a>hire.win</a> irreparable harm for which money damages alone would be
                    inadequate. In addition to damages and any other remedies to which{" "}
                    <a>hire.win</a> may be entitled, you acknowledge and agree that we may seek
                    injunctive relief to prevent the actual, threatened or continued breach of this
                    Agreement.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Headings</h1>{" "}
                <p>
                  <span>
                    The headings in this Agreement are for reference only and shall not limit the
                    scope of, or otherwise affect, the interpretation of this Agreement.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Geographic Restrictions</h1>{" "}
                <p>
                  <span>
                    The Company is based in India and provided for access and use primarily by
                    persons located in India, and is maintains compliance with India laws and
                    regulations. If you use the website from outside India, you are solely and
                    exclusively responsible for compliance with local laws.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Limitation of Time to File Claims</h1>{" "}
                <p>
                  <span>
                    Any cause of action or claim you may have arising out of or relating to this
                    agreement or the website must be commenced within one (1) year after the cause
                    of action accrues, otherwise, such cause of action or claim is permanently
                    barred.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Entire Agreement</h1>{" "}
                <p>
                  <span>
                    The Agreement constitutes the entire agreement between you and <a>hire.win</a>{" "}
                    regarding your use of the Application and supersedes all prior and
                    contemporaneous written or oral agreements between you and <a>hire.win</a>.
                  </span>
                </p>{" "}
                <p>
                  <span>
                    You may be subject to additional terms and conditions that apply when you use or
                    purchase other <a>hire.win</a>’s services, which <a>hire.win</a> will provide to
                    you at the time of such use or purchase.
                  </span>
                </p>{" "}
                <p>
                  <br />
                </p>{" "}
                <h1 className="font-bold">Contact Us</h1>{" "}
                <p>
                  <span>
                    {`Don't`} hesitate to contact us if you have any questions about this Agreement.
                  </span>
                </p>{" "}
                <ul>
                  <li>
                    <span>
                      Via Email: <a>support@hire.win</a>
                    </span>
                  </li>{" "}
                </ul>
              </span>
            </p>
          </span>
        </p>
      </div>
    </LandingLayout>
  )
}
