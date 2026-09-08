const createLink = (href: string, text: string) =>
    `<a href="${href}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
const emailLink = (email: string) => createLink(`mailto:${email}`, email);
const createWebLink = (website: string) => createLink(website, website);

const termsOfServiceLink = createLink("/terms-and-conditions", "Terms of Service");
const websiteLink = createLink("https://www.melodywings.org", "www.melodywings.org");
const supportEmailLink = createLink("mailto:support@melodywings.org", "support@melodywings.org");

export const sectionsData = [
    {
        title: "INTRODUCTION",
        contextType: "parent",
        content: [
            `MelodyWings (“MW,” “we,” “us,” or “our”) is a non-profit corporation respects the privacy of its Users (“User,” “your,” or “you”). This Privacy Policy (the “Privacy Policy”) explains how we collect, use, disclose, and safeguard your information when you use the MW Platform (the “Platform”) through ${websiteLink} (the “Website”).`,
            "At MW, we believe that everyone should have the opportunity to pursue their passions and unlock their full potential. For individuals with diverse disabilities (“Learners”), finding the right extracurricular activities often requires a journey of exploration, which can sometimes come with financial challenges. Our mission is to empower Learners with developmental disabilities and special needs to discover and engage in activities that truly resonate with them, free from barriers of ability or cost.",
            "We connect Learners with skilled and experienced Volunteers in various extracurricular fields (“Volunteers”), who provide free online classes to help Learners achieve their goals, expand their knowledge, and build valuable skills. Through these experiences, we aim to foster joy, boost confidence, encourage self-expression, and open doors to lifelong hobbies, skills, and career opportunities. By harnessing the talents of dedicated community volunteers, we ensure that everyone, regardless of ability, has the opportunity to grow, thrive, and reach their full potential.",
            {
                title: "Our Learners and Volunteers are categorized into the following three categories:",
                contextType: "list",
                content: [
                    "Category I: Learners under the age of 13;",
                    "Category II: Learners and Volunteers between 13 to 15 years of age;",
                    "Category III: Learners and Volunteers of ages 16 and above;",
                ]

            },
            "MW is committed to protecting the privacy of its Users whose information is collected and stored while using MW’s Platform through our Website. This Privacy Policy is applicable to our Website and Platform.",
            `The capitalized terms have the same meaning as ascribed in our ${termsOfServiceLink} as applicable, unless otherwise noted here.`,
            "PLEASE READ THIS PRIVACY POLICY CAREFULLY TO UNDERSTAND OUR POLICIES AND PRACTICES REGARDING YOUR INFORMATION AND HOW WE WILL TREAT IT.",
            "BY ACCESSING OR USING OUR WEBSITE AND PLATFORM, YOU AGREE TO ACCEPT ALL THE TERMS CONTAINED IN THIS PRIVACY POLICY AND ACKNOWLEDGE AND AGREE WITH THE PRACTICES DESCRIBED HEREIN.",
            "IF YOU DO NOT AGREE WITH THE TERMS OF THIS PRIVACY POLICY, PLEASE DO NOT ACCESS AND USE OUR WEBSITE AND/OR PLATFORM.",
            `If you have any questions regarding this Privacy Policy, please send us an email at ${supportEmailLink}.`,
            {
                title: "WE DO NOT SELL YOUR PERSONAL INFORMATION, NOR DO WE INTEND TO DO SO."
            }
        ]
    },
    {
        title: "TERRITORIAL RESTRICTION",
        contextType: "parent",
        content: [
            "Our Website and Platform are only available for use outside the European Union. Our Website and Platform are not available for use by residents of, visitors to, or your employees who reside in the European Union (collectively a “European”). If you are a European, please do not register on our Website and/or Platform and/or use our Website or Platform. If you are a resident of the United States (“US”), the laws of the State of California, United States shall apply. If you are a resident of any other country, please ensure compliance with all local laws prior to using our Website or Platform. You must comply with this Privacy Policy and our Terms of Service, as applicable.",
            `If you have any questions regarding this Section, please email us at ${supportEmailLink}.`
        ]
    },
    {
        title: "INFORMATION WE COLLECT",
        contextType: "parent",
        content: [
            `When you register to use our Website or Platform, we collect personal information (“PII”) such as your name, address, email, username, phone number, ID number, education and employment details, disability information, browsing history, photographs, and other personal data, which will be stored on our servers. You can update your personal information via email at ${supportEmailLink}.`,
            {
                title: "a) Financial Information.",
                content: [
                    "We are currently using third-party payment processors such as PayPal, Stripe, Google Pay, Razorpay, and Paddle to collect and store the financial information you share with us for payment processing. However, we will update this Privacy Policy when we start using and storing such information."
                ]
            }
        ]
    },
    {
        title: "HOW DO WE COLLECT INFORMATION?",
        contextType: "parent",
        content: [
            "We collect personal information from you in the following ways:",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "a) At registration on our Website or Platform;",
                    "b) In email, text, and other electronic messages between you and our Website or Platform;",
                    "c) From you placing an order, which includes details of transactions you carry out on our Website or Platform;",
                    "d) When a user interacts with the company’s advertising and applications on third-party websites and services, if those applications or advertising include a link to the company’s privacy policy;",
                    "e) When you subscribe to a newsletter;",
                    "f) From your responses to a survey;",
                    "g) From forms filled out by you;",
                    "h) From records or copies of correspondences (including email addresses) if you contact us;",
                    "i) From search queries on our Website or Platform;",
                    "j) When you post information to be published or displayed on our Website or Platform;",
                    "k) Through AI analysis for carrying out verification and research."
                ]
            },
            "We collect information from you automatically when you navigate through our Website or Platform in the following ways:",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "a) Usage details",
                    "b) Information obtained through browser cookies",
                    "c) Information obtained through flash cookies",
                    "d) Web beacons on our Website",
                    "e) Web beacons on emails sent by us"
                ]
            }
        ]
    },
    {
        title: "HOW DO WE USE YOUR INFORMATION?",
        contextType: "parent",
        content: [
            "We use the information that you provide to:",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "a) Personalize your experience in using our Website or Platform",
                    "b) Provide you with information, products, or services requested from us",
                    "c) Present our Website or Platform and their contents to you",
                    "d) Provide you with notices about account and/or subscription, including expiration and renewal notices",
                    "e) Carry out obligations and enforce rights arising from contracts entered into between you and us, including billing and collection",
                    "f) Notify you about changes to our Website or Platform and any products",
                    "g) Allow you to participate in interactive features on our Website or Platform",
                    "h) Improve the Website or Platform",
                    "i) Improve our customer service",
                    "j) Administer contests, promotions, and surveys or other Website and Platform features",
                    "k) Process transactions",
                    "l) Anonymize data and aggregate data for statistics",
                    "m) Contact you about our products and services that may be of interest",
                    "n) Contact you about third parties’ goods and services",
                    "o) Enable the display of advertisements to our advertisers’ target audiences, although personal information is not shared with advertisers without your consent",
                    "p) Send you periodic emails, in accordance with the CAN-SPAM Act of 2003 as detailed in Section 14, via the email address provided by you to (i) send information, respond to inquiries, and/or other requests or questions; (ii) process orders and send information and updates pertaining to such orders; (iii) send additional information related to your product and/or service; and (iv) market to our mailing list or continue to send email to you after the original transaction has occurred."
                ]
            }
        ]
    },
    {
        title: "OUR COOKIE POLICY",
        contextType: "parent",
        content: [
            "Cookies are small pieces of text used to store information on web browsers. Cookies are used to store and receive identifiers and other information on computers, phones, and other devices. Other technologies, including data we store on your web browser or device, identifiers associated with your device, and other software, are used for similar purposes. In this Privacy Policy, we refer to all of these technologies as “Cookies.” ",
            "We use Cookies on our Website to (a) understand and save your preferences for future visits, (b) compile aggregate data about site traffic and site interactions in order to offer better site experiences and tools in the future, and (c) allow trusted third-party services that track this information on our behalf. You can set your browser to refuse all or some browser Cookies. We honor Do Not Track signals and, if one is in place, we will not track, plant cookies, or use advertising.",
            `We allow third party behavioral tracking and links to third-party web pages. Occasionally, at our discretion, we may include or offer third-party products or services on our Website or Platform. These third-party sites have separate and independent privacy policies. We, therefore, have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our Website or Platform and welcome any feedback at ${supportEmailLink}.`
        ]
    },
    {
        title: "HOW DO WE PROTECT INFORMATION WE COLLECT?",
        contextType: "parent",
        content: [
            "Our Website use an SSL certificate as an added security measure. We require username and passwords for our employees who can access your personal information that we store and/or process on our Platform and servers. In addition, we actively prevent third parties from getting access to your personal information that we store and/or process on our Platform and servers. We accept payment by credit card through a third party credit card processor on our behalf. We will implement reasonable security measures every time you (a) enter, submit, or access your information, (b) register, or (c) access our Platform, on our Website"
        ]
    },
    {
        title: "DATA SECURITY MEASURES",
        contextType: "parent",
        content: [
            {
                title: "a) Security Measures:",
                content: [
                    "We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls. The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Website or Platform, you are responsible for keeping this password confidential. We ask you not to share your password with anyone. Unfortunately, the transmission of information via the internet is not completely secure. Although we do our best to protect your personal information, we cannot guarantee the security of your personal information transmitted to our Website or Platform. Any transmission of personal information is at your own risk. We are not responsible for circumvention of any privacy settings or security measures contained on our Website or Platform."
                ]
            },
            {
                title: "b) Fair Information Practice Principles:",
                content: [
                    "In the event of a personal data breach, we will notify you within fifteen (15) days via email. We shall also notify FTC, FCC, and/or state regulatory agency as required under law and within the time period prescribed by law. We agree to the individual redress principle, which requires that individuals have a right to pursue legally enforceable rights against data collectors and processors who fail to adhere to the law. This principle requires not only that individuals have enforceable rights against data users, but also that that individuals have recourse to courts or a government agency to investigate and/or prosecute non-compliance by data processors."
                ]
            },
            {
                title: "c) Open-Source Software:",
                contextType: "combined",
                hideNumber: true,
                content: [
                    "We use the following open-source software in the provision of our Services, such as:",
                    {
                        contextType: "list",
                        hideNumber: true,
                        content: ["i) NextJS", "ii) FastAPI", "iii) Open Source Java and Python Libraries",]
                    }
                ]
            }

        ]
    },
    {
        title: "DISCLOSURE OF PERSONAL INFORMATION",
        contextType: "parent",
        content: [
            "There are times when the Personal Information that you have shared with MW may be shared with others to enable us to provide you over Services, including contractors, service providers, and third parties (“Partners”). This section discusses only how MW may share such information with Partners. We will ensure that our Partners protect your Personal Information. The following describe how and with whom we may share your Personal Information:",
            {
                title: "Disclosure of Personal Information",
                contextType: "list",
                hideNumber: true,
                content: [
                    "a) We may disclose aggregated, de-personalized information about you that does not identify any individual to other parties without restriction, such as for marketing, advertising, or other uses.",
                    "b) We may disclose personal information to our subsidiaries and affiliates.",
                    "c) We may disclose personal information to contractors, service providers, and other third parties.",
                    "d) We require all contractors, service providers, and other third parties to whom we disclose your personal information to be under contractual obligations to keep personal information confidential and to use it only for the purposes for which we disclose them.",
                    "e) We may disclose to third parties to market their products and services to you if you have either consented or not opted out of these disclosures.",
                    "f) We may disclose personal information to third parties to market their products and services if you have either consented or not opted out of these disclosures.",
                    "g) We require all other Partners, to whom we disclose your personal information, to enter into contracts with us to keep personal information confidential and use it only for the purposes for which we disclose it to such Partners.",
                    "h) We disclose personal information to fulfill the purpose for which you have provided it, for instance, if you gave us an email address to use the 'email a friend' feature of the Platform.",
                    "i) We may disclose personal information for any other purpose for which you have provided it.",
                    "j) We may only disclose personal information as described in this Privacy Policy or your consent."
                ]
            },
            {
                title: "Other Disclosure of Personal Information",
                contextType: "list",
                hideNumber: true,
                content: [
                    `a) We will disclose personal information (i) to comply with any court order, law, or legal process, including to respond to any government or regulatory request, (ii) to enforce or apply our ${termsOfServiceLink} and other agreements, including for billing and collection purposes, (iii) if we believe it is necessary or appropriate to protect the rights, property, or safety of MW, our customers, or others, and/or (iv) if it is necessary or appropriate to protect the rights, property, or safety of MW, our customers, or others, and this includes exchanging information with other companies and organizations for the purposes of fraud protection and credit risk reduction.`
                ]
            },
            {
                title: 'Third Party Disclosure',
                contextType: "list",
                hideNumber: true,
                content: [
                    "a) We do not sell, trade, rent, or otherwise transfer personal information to others, unless we provide you with advance notice. This does not include our hosting partners and other parties who assist us in operating our Website or Platform, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.",
                    "b) We do not provide non-personally identifiable visitor information for marketing purposes."
                ]
            },
            {
                title: "Choices Users Have About How MW Uses and Discloses Information",
                contextType: "list",
                hideNumber: true,
                content: [
                    "a) Tracking Technologies and Advertising. You can set their browser to refuse some or all the browser cookies. Disabling cookies will not impact functionality.",
                    "b) Disclosure of Users’ Information for Third-Party Advertising. Users receiving promotional email can opt-out by sending a return email requesting to be omitted from future promotional email distributions. This opt-out will not apply to information provided by MW for registration, or other transactions.",
                    `c) Disclosure of User’s Information for Targeted Advertising. Users can opt-out by emailing us their opt-out request at ${supportEmailLink}.`
                ]

            }
        ]
    },
    {
        title: 'GOOGLE ADSENSE AND GOOGLE ANALYTICS',
        contextType: "parent",
        content: [
            `Google, as a third-party vendor, uses Cookies to serve advertisements to Users on our Website or Platform. Google uses first-party Cookies, such as Google Analytics Cookies, to compile data regarding User interactions with ad impressions and other ad service functions as they relate to our Platform. We currently use Google Analytics to collect and process certain Website usage data. To learn more about Google Analytics and how to opt-out, please visit ${createLink("https://policies.google.com/privacy/google-partners", "https://policies.google.com/privacy/google-partners")}.`,
            "We have implemented advertising features on our Website and Platform including: (a) remarketing with Google AdSense; (b) Google Display Network Impression Reporting; (c) Google Demographics and Interests Reporting; and (d) Google’s DoubleClick platform integration.",
            "We use these Cookies to compile data regarding User interactions with ad impressions and other ad service functions as they relate to our Website. "
        ]
    },
    {
        title: "OTHER PRIVACY RIGHTS",
        contextType: "parent",
        content: [
            {
                title: "a) Your California Privacy Rights",
                contextType: "list",
                hideNumber: true,
                content: [
                    "<strong>1) California Civil Code:</strong> MW does not sell, trade, or otherwise transfer to outside third parties your “Personal Information” as the term is defined under the California Civil Code Section § 1798.82(h). Additionally, California Civil Code Section § 1798.83 permits Users of our Website or Platform that are California residents to request certain information regarding our disclosure of their Personal Information to third parties for their direct marketing purposes. To make a request for such disclosure, or identification and/or deletion of Personal Information in all our systems that we store on you, please send an email to support@melodywings.org or by writing to us at MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746. Note that (i) if we delete your Personal Information as requested, we will no longer be able to provide our services to you and (ii) we may need to keep such Personal Information for a while during the shutting down and billing process. If you would like to discuss our Personal Information storage and processing process with us, please send us an email at support@melodywings.org or by writing to us at MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746.",
                    "<strong>2) CPRA:</strong> This Section supplements the information contained in our Privacy Policy above and applies solely to all visitors, users, and others to our Website or Platform, who reside in the State of California (“consumers” or “you”). We adopt this Section to comply with the California Privacy Rights Act that is effective from January 1, 2023 (“CPRA”) and any terms defined in the CPRA have the same meaning when used in this Section. ",
                    {
                        contextType: "list",
                        hideNumber: true,
                        content: [
                            "a) Right to Request Personal Information. Upon request, we will provide you with (i) a list of all Personal Information that we have collected on you, (ii) from whom we obtained such Personal Information, (iii) the reason why we collected such Personal Information, and (iv) with whom (if any) we have shared such Personal Information. If we sell your Personal Information or disclose your Personal Information to third parties, upon request, we will provide you with (i) a list of the Personal Information that we have collected on you, (ii) a list of the Personal Information that we sell or disclose to others on you, and (iii) to whom we have sold or disclosed your Personal Information. We require such Personal Information to be able to provide to you, our Services. Unless otherwise specified, we only collect Personal Information from you. We do not use others to provide us with your Personal Information.",
                            "b) Disclosure of Personal Information. We only share your Personal Information with service providers, e.g., billing and collection agents, who enable us to provide our Services to you. We do not sell or give your Personal Information to third parties for purposes unrelated to our provision of Services to you.",
                            "c) Right to have Personal Information Deleted. Upon request, we will delete all of your Personal Information that we have collected on you and will direct our Service Providers to also delete all of your Personal Information. But note that if we do delete all of this Personal Information, you will no longer be able to use our Services.",
                            "d) Non-Discrimination Right. We will not discriminate against you for exercising any of your CPRA rights. Unless permitted by the CPRA, we will not:",
                            {
                                contextType: "list",
                                content: [
                                    "Deny you goods or services",
                                    "Charge you different prices or rates for goods or services, including through granting discounts or other benefits, or imposing penalties.",
                                    "Provide you a different level or quality of goods or services.",
                                    "Suggest that you may receive a different price or rate for goods or services or a different level or quality of goods or services.",
                                ]
                            },
                            "e) Financial Incentives. However, we may offer you certain financial incentives permitted by the CPRA that can result in different prices, rates, or quality levels. Any CPRA-permitted financial incentive we offer will reasonably relate to your personal information’s value and contain written terms that describe the program’s material aspects. Participation in a financial incentive program requires your prior opt in consent, which you may revoke at any time.",
                            "f) Contact Information. You may contact us (i) at support@melodywings.org, or (ii) by writing to us at Privacy Officer, at MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746 to (i) make a Personal Information Request, (ii) lodge a complaint about our use or storage of your Personal Information, (iii) ask us to delete such Personal Information, and/or (iv) discuss our Privacy Policy and/or anything that has to do with it. We will respond within forty-five (45) days of receiving such request or query. Additionally, in order for us to respond to your request or query, we will need to collect information from the requesting party to verify their identity.",
                            "g) Under 16. We will not sell your Personal Information of any Users, including any persons under the age of 16.",
                            "h) Opt In Consent. We will only process, collect, use and store your Personal Information upon receiving your express consent to do so. YOU EXPRESSLY AGREE THAT YOU HAVE READ, UNDERSTOOD, AND CONSENT TO MW COLLECTING, USING, PROCESSING, DISCLOSING, STORING, AND RETAINING YOUR PERSONAL INFORMATION IN ACCORDANCE WITH THIS PRIVACY POLICY AND OUR TERMS OF SERVICE WHEN YOU CHECK THE APPLICABLE BOX SIGNIFYING YOUR CONSENT. YOU EXPRESSLY AGREE THAT THIS CONSENT IS FREELY GIVEN, EXPRESS, AND AFFIRMATIVE.",
                            "i) Right to Opt-Out. At any time, upon your request, we will stop selling your Personal Information (sometimes called your Opt Out-Right). You may send the request to Opt Out (i) to support@melodywings.org, or (ii) by writing to us at Privacy Officer, MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746.",
                            "j) Data Protection Officer. We have appointed a Privacy and Data Protection Officer, Chitra Ganesan] at [9852 Wesbourne Way, Granite Bay - 95746 to make sure the privacy rights of our Users are protected.",
                            "k) Personal Information that We Store. For your information, we store/collect the following Personal Information on you:",
                            {
                                contextType: "list",
                                hideNumber: true,
                                content: [
                                    "1. Name",
                                    "2. Date of Birth",
                                    "3. Gender",
                                    "4. Address",
                                    "5. Telephone number",
                                    "6. Email address",
                                    "7. Username",
                                    "8. Browsing and search history",
                                    "9. ID proof",
                                    "10. Education information",
                                    "11. Employment based information",
                                    "12. Disability history",
                                    "13. Legal and Safety Information"
                                ]
                            }

                        ]
                    }
                ]

            },
            {
                title: "b) Other State Privacy Rights",
                contextType: "combined",
                hideNumber: true,
                content: [
                    "This Privacy Policy explains how we collect, use, and disclose your Personal Information in the Sections above. This Section describes how to exercise your rights under the various state privacy laws as detailed below (“State Privacy Laws”)",
                    {
                        contextType: "list",
                        hideNumber: true,
                        content: [
                            `i) Massachusetts. The Massachusetts Data Protection Law (201 CMR 17.00), sets standards for the protection of personal information of residents of Massachusetts. Residents of Massachusetts have the following rights under Massachusetts law (i) the right to request access to their personal information that is held by us and to receive a copy of that information; (ii) the right to request the correction of any inaccurate or incomplete personal information; (iii) the right to request that we delete your personal information; (iv) the right to opt-out of the collection, use, or disclosure of your personal information for marketing purposes; (v) the right to be notified in the event of a data breach involving their personal information; and (vi); the right to Opt-in for collection, use or disclosure of Sensitive Personal Information. Further, you have the right to file a complaint with the Massachusetts attorney general if you believe we have violated the Massachusetts Data Protection Law by calling (617) 727-8400 or filing a complaint at ${createWebLink("https://www.mass.gov/how-to/file-a-consumer-complaint")}.`,
                            "ii) Colorado. The Colorado Privacy Act (Colo. Rev. Stat. § 6-1-1301 et seq.) protects the privacy of Colorado consumers. Residents of Colorado have following privacy rights (i) you have the right to opt out of the processing of your personal data for the purposes of targeted advertising, the sale of your personal data or profiling in furtherance of decisions that produce legal or similarly significant effects; (ii) you have the right to confirm whether we are processing personal data concerning you and to access your personal data; (iii) you have the right to correct inaccuracies in your personal data; (iv) you have the right to delete your personal data; and (v) when accessing your data, you have a right to obtain that data in a portable and, to the extent technically feasible, readily usable format that allows you to transmit that data to another business.",
                            "iii) Connecticut. MW does not sell, trade, or otherwise transfer to outside third parties your “Personal Data” as the term is defined under Connecticut’s Privacy Act and Act Concerning Personal Data Privacy and Online Monitoring. Connecticut Laws permits residents of Connecticut who are Users of our Website or Platform that are Connecticut residents to request certain information regarding our disclosure of their Personal Information to third parties for their direct marketing purposes. Further, Users have the right to (i) confirm whether or not we are processing the your personal data and access such personal data, unless such confirmation or access would require us to reveal a trade secret; (ii) correct inaccuracies in the User’s personal data; (iii) opt out of the processing of the personal data for the purposes of targeted advertising, sale, or profiling in furtherance of solely automated decisions; and (iv) you have the right to obtain a copy of your personal data processed by the controller, in a portable and, to the extent technically feasible, readily usable format. ",
                            "iv) Utah. On March 24, 2022, Utah enacted the Utah Consumer Privacy Act (UCPA § 13-61-102(1)) which will go into effect on December 31, 2023. The UCPA gives residents of Utah who are users of our Website and App the right to (i) you to opt out of the processing of your personal data for the purposes of targeted advertising, the sale or profiling; (ii) correct inaccuracies in your personal data; (iv) delete your personal data; and (v) obtain that data in a portable and, to the extent technically feasible, readily usable format that allows you to transmit that data to another business. ",
                            "v) New York: The New York Privacy Act sets strict rules about how businesses must handle consumers’ personal information and gives individuals new rights concerning data. New York residents have the rights to (i) access, correct, deletion, and disclosure regarding your Personal Information; and (ii) know what personal information is being collected about them, how it is being used, and with whom it is being shared. ",
                            "vi) Virginia. The Virginia Consumer Data Protection Act (Va. Code § 59.1-571 et seq.) effective from January 1, 2023 provides Virginia residents with certain rights regarding the collection, use, and sharing of their personal information namely (i) the right to know what personal information is being collected about them, how it is being used, and with whom it is being shared; (ii) the right to request that a business delete personal information that the business has collected from the resident; (iii) the right to non-discrimination for the exercise of their privacy right; (iv) the right to access the personal information held about them, including the categories of personal information collected, used, shared, and the categories of third parties with whom the information is shared; (v) the right to obtain a copy of their personal information in a structured, commonly used and machine-readable format."
                        ]
                    },
                    `To exercise any of the rights mentioned under Section 11(b), please (i) send an email to ${supportEmailLink}, or (ii) write to us at Privacy Officer, MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746.`,
                    "Note that (i) if we delete your Personal Information as requested, we will no longer be able to provide our services to you. We have appointed a Privacy and Data Protection Officer, Chitra Ganesan to make sure the privacy rights of our Users are protected."
                ]
            }
        ]
    },
    {
        title: "COPPA COMPLIANCE (FOR CHILDREN UNDER 13 USERS ONLY)",
        contextType: "parent",
        content: [
            "The Children’s Online Privacy Protection Act (“COPPA”) is a federal legislation that applies to entities that collect and store “Personal Information,” as the term is defined under COPPA, from children under the age of 13. We are committed to ensure compliance with COPPA.",
            "Since MW is a non-profit organization that does not collect personal information from minors under 13 for commercial purposes, it is exempt from COPPA requirements. However, MW is committed to safeguarding the privacy of minors under 13 and takes all necessary measures to ensure their privacy is protected. ",
            {
                title: "a) FOR OUR VOLUNTEERS:",
                contextType: "list",
                hideNumber: true,
                content: [
                    `To register as a Volunteer on our Website and/or Platform, you must be 13 years of age or over. If you are under 13 years of age, do not register as a Volunteer on our Website and/or Platform. Our Website and/or Platform do not target Volunteers under the age of 13. If you would like to know more about our practices and specifically our practices, please email us at ${supportEmailLink}.`,
                    "IF YOU ARE A VOLUNTEER AND UNDER 13, PLEASE DO NOT ACCESS OR USE OUR WEBSITE OR PLATFORM."
                ]
            },
            {
                title: "b) FOR OUR CATEGORY I LEARNERS:",
                contextType: "list",
                hideNumber: true,
                content: [
                    "Informed consent and parental verification for children under 13",
                    "For Category I Learners, in compliance with the COPPA, we require verified parental consent before collecting any personal information from children under the age of 13. If you are the parent or legal guardian of the Category I Learner, please verify your consent to the collection of your child's information by following the steps below.",
                    "By putting in your email on behalf of the Learner at the registration page, you are providing informed parental consent and verifying that MW may collect, use and/or share certain personal information as listed in Section 3 of this Privacy Policy from the Learner in order to provide our services. You also acknowledge that you understand our privacy practices and that you authorize us to collect, use and/or share your child's information in accordance with our Privacy Policy.",
                    "Steps for Parental Consent Verification:",
                    {
                        contextType: "list",
                        hideNumber: true,
                        content: [
                            "1. Provide your name and contact information at the time of registration on our Website and/or Platform.",
                            "2. Provide your email address as the default address for registering on our Website and/or Platform on behalf of the Learner and submit that you verify MW to collect, use and/or share certain personal information collected from the Category I Learner.",
                            "3. Confirm that you are the parent or guardian of the child by answering knowledge-based questions at the time of registering on our Website and/or Platform.",
                            "4. Review the information we plan to collect, use and/or share from your child through the direct notice we send you prior to collecting your child’s information."
                        ]
                    },
                    "As the parent or legal guardian, you take full responsibility for the Category I Learner’s access to and use of our services and agree to ensure that the Learner complies with the terms outlined in the Privacy Policy and Terms of Service",
                    `If you have any questions or concerns, please contact us at ${supportEmailLink}. You can also request that we delete your child’s information at any time.`,
                    "IF YOU ARE A LEARNER AND UNDER 13, PLEASE DO NOT ACCESS OR USE OUR WEBSITE OR PLATFORM WITHOUT FIRST GETTING VERIFIED PARENTAL CONSENT AS DEFINED IN SECTION 12(b) ABOVE."
                ]
            }
        ]
    },
    {
        title: "OPT-IN FOR MINORS UNDER 16",
        contextType: "parent",
        content: [
            "If you are a Category II Learner or Volunteer between 13 to 15 years of age, we are required to obtain your opt-in consent to the collection, use and/or sharing of certain personal information as listed in Section 3 of this Privacy Policy in order to provide our services.",
            "Please verify your consent to the collection, use and/or sharing of your personal information by following the steps below.",
            "Steps for Opt-in Consent:",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "1. Provide your name and contact information at the time of registration on our Website and/or Platform.",
                    "2. Provide your email address for registering on our Website and/or Platform and submit that you consent that MW collect, use and/or share your personal information as listed in this Privacy Policy."
                ]
            },
            `If you have any questions or concerns, please contact us at ${supportEmailLink} or by writing to us at MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746. You can also request that we delete your personal information at any time.`,
            `If you are a Category III Learner or Volunteer who is age 16 and above, you may withdraw your consent to the collection, use and/or sharing of your personal information at any time by contacting us at ${supportEmailLink} or by writing to us at MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746.`
        ]
    },
    {
        title: "CAN-SPAM ACT OF 2003",
        contextType: "parent",
        content: [
            "The CAN-SPAM Act establishes requirements for commercial messages, gives recipients the right to have businesses stop emailing them, and spells out penalties for violations. Per the CAN-SPAM Act, we will:",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "a. not use false or misleading subjects or email addresses;",
                    "b. identify the email message as an advertisement in some reasonable way;",
                    "c. include the physical address of MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746;",
                    "d. monitor third-party email marketing services for compliance, if one is used;",
                    "e. honor opt-out/unsubscribe requests quickly; and",
                    "f. give an “opt-out” or “unsubscribe” option."
                ]
            },
            `If you wish to opt out of email marketing, follow the instructions at the bottom of each email or contact us at ${supportEmailLink} and we will promptly remove you from all future marketing correspondences.`
        ]
    },
    {
        title: "MODIFICATIONS TO OUR PRIVACY POLICY",
        contextType: "parent",
        content: [
            "We will post any changes to this Privacy Policy in a notice of the change at the bottom of our web page with a hyperlink thereto. Please regularly review this Privacy Policy. Notwithstanding if you continue to use our services, you are bound by any changes that we make to this Privacy Policy."
        ]
    },
    {
        title: "LIST OF THIRD-PARTY SERVICE PROVIDERS",
        contextType: "parent",
        content: [
            `MW uses the following third-party service providers for the provision of services as detailed under the ${termsOfServiceLink}, as applicable`,
            {
                contextType: "table",
                content: {
                    headers: ["Name of Third-Party Service Provider", "Contact Information"],
                    rows: [
                        [
                            "Vercel, Inc.",
                            `Email: ${emailLink("support@vercel.com")} <br /> Address: 440 N Barranca Ave #4133, Covina, CA 91723`
                        ],
                        [
                            "Google Cloud Platform (Cloud Run)",
                            "Address: 1600 Amphitheatre Parkway in Mountain View, California"
                        ],
                        [
                            "Github",
                            "Address: 88 Colin P. Kelly Jr. Street in San Francisco"
                        ],
                        [
                            "Alphabet, Inc. (Google Sign-In, Firebase Cloud Messaging &amp; Analytics, Gemini API)",
                            "Address: 1600 Amphitheatre Parkway in Mountain View, California"
                        ],
                        [
                            "Cloudinary",
                            `Email: ${emailLink("info@cloudinary.com")} <br /> Address: 6201 America Center Dr, San Jose, CA 94089, US`
                        ],
                        [
                            "Cloudflare",
                            `Email: ${emailLink("support@cloudflare.com")} <br /> Address: 01 Townsend St, San Francisco, CA 94107`
                        ],
                        [
                            "Stripe Inc.",
                            `Email: ${emailLink("support@stripe.com")} <br /> Address: 510 Townsend St, San Francisco, CA 94103`
                        ],
                        [
                            "PayPal",
                            `Website: ${createLink("https://www.paypal.com", "www.paypal.com")} <br /> Address: 2211 North First Street San Jose, CA 95131`
                        ]
                    ]
                }
            },
            `Additionally, if you have any questions or concerns about our third-party service providers, please email us at ${supportEmailLink}.`
        ]
    },
    {
        title: "COPYRIGHT INFRINGEMENT/DMCA NOTICE",
        contextType: "parent",
        content: [
            "If you believe that any content on our Website or Platform violates your copyright, and you wish to have the allegedly infringing material removed, the following information in the form of a written notification (pursuant to the Digital Millennium Copyright Act of 1998 (“DMCA Takedown Notice”)) must be provided to our designated Copyright Agent. ",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "a. Your physical or electronic signature;",
                    "b. Identification of the copyrighted work(s) that you claim to have been infringed;",
                    "c. Identification of the material on our Website or Platform that you claim is infringing and that you request us to remove;",
                    "d. Sufficient information to permit us to locate such material;",
                    "e. Your address, telephone number, and email address;",
                    "f. A statement that you have a good faith belief that use of the objectionable material is not authorized by the copyright owner, its agent, or under the law; and",
                    "g. A statement that the information in the notification is accurate, and under penalty of perjury, that you are either the owner of the copyright that has allegedly been infringed or that you are authorized to act on behalf of the copyright owner."
                ]
            },
            `MW’s Copyright Agent to receive DMCA Takedown Notices is Chitra Ganesan, at ${supportEmailLink} and at MelodyWings, 9852 Wesbourne Way, Granite Bay - CA 95746. You acknowledge that for us to be authorized to take down any content, your DMCA Takedown Notice must comply with all the requirements of this Section. Please note that, pursuant to 17 U.S.C. § 512(f), any misrepresentation of material fact (falsities) in a written notification automatically subjects the complaining party to liability for any damages, costs and attorney’s fees incurred by MW in connection with the written notification and allegation of copyright infringement.`
        ]
    },
    {
        title: "ANTI-BRIBERY COMPLIANCE",
        contextType: "parent",
        content: [
            "MW represents and warrants that it is fully aware of and will comply with, and in the performance of its obligations hereunder will not take any action or omit to take any action that would cause it or its customers to be in violation of, (i) U.S. Foreign Corrupt Practices Act, (ii) U.K. Anti-Bribery Act, (iii) India Prevention of Corruption Act of 1988, or (iv) any other applicable anti-bribery statutes and regulations, and (v) any regulations promulgated under any such laws. MW represents and warrants that neither it nor any of its employees, officers, or directors is an official or employee of any government (or any department, agency or instrumentality of any government), political party, state owned enterprise or a public international organization such as the United Nations, or a representative or any such person (each, an “Official”). MW further represents and warrants that, to its knowledge, neither it nor any of the Officials has offered, promised, made or authorized to be made, or provided any contribution, thing of value or gift, or any other type of payment to, or for the private use of, directly or indirectly, any Official for the purpose of influencing or inducing any act or decision of the Official to secure an improper advantage in connection with, or in any way relating to, (A) any government authorization or approval involving MW, or (B) the obtaining or retention of business by MW. MW further represents and warrants that it will not in the future offer, promise, make or otherwise allow to be made or provide any payment and that it will take all lawful and necessary actions to ensure that no payment is promised, made or provided in the future by any of the Officials.",
        ]
    },
    {
        title: "CONTACT US",
        contextType: "parent",
        content: [
            "To ask questions or comment about this Privacy Policy and our privacy practices, contact us at:",
            {
                contextType: "list",
                hideNumber: true,
                content: [
                    "- Privacy Officer: Chitra Ganesan",
                    `- Email: ${supportEmailLink}`,
                    "- Address: MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746"
                ]
            },
            `PLEASE NOTE: IF YOU USE OUR WEBSITE OR PLATFORM, YOU HAVE AGREED TO AND ACCEPTED THE PRACTICES DESCRIBED IN THIS PRIVACY POLICY AND THE TERMS AND CONDITIONS SET FORTH IN OUR ${termsOfServiceLink}, AS APPLICABLE. IF YOU DO NOT AGREE WITH THE TERMS OF THIS PRIVACY POLICY OR OUR ${termsOfServiceLink}, PLEASE DO NOT USE OUR WEBSITE OR PLATFORM.`
        ]
    }
];