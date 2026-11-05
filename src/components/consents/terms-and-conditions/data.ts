const createLink = (href: string, text: string) =>
    `<a href="${href}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;

const privacyPolicyLink = createLink("/privacy-policy", "Privacy Policy");
const websiteLink = createLink("https://www.melodywings.org", "www.melodywings.org");
const supportEmailLink = createLink("mailto:support@melodywings.org", "support@melodywings.org");

export const sectionsData = [
    {
        title: "INTRODUCTION TO MELODYWINGS AND OUR WEBSITE/PLATFORM",
        contextType: "parent",
        content: [
            "MelodyWings is a non-profit organization. At MW, we believe that everyone should have the opportunity to pursue their passions and unlock their full potential. For individuals with diverse disabilities (‘Learners’), finding the right extracurricular activities often requires a journey of exploration, which can sometimes come with financial challenges. Our mission is to empower Learners with developmental disabilities and special needs to discover and engage in activities that truly resonate with them, free from barriers of ability or cost.",
            "We connect learners with skilled and experienced volunteers in various extracurricular fields (‘Volunteers’), who provide free online classes to help learners achieve their goals, expand their knowledge, and build valuable skills. Through these experiences, we aim to foster joy, boost confidence, encourage self-expression, and open doors to lifelong hobbies, skills, and career opportunities. By harnessing the talents of dedicated community volunteers, we ensure that everyone, regardless of ability, has the opportunity to grow, thrive, and reach their full potential.",
            "Our Learners and Volunteers could include minors, and some Learners may need support making decisions and may not be able to enter into a contract on their own. Thus, if you are a parent or legal guardian of such a minor or of a person who needs support making decisions, you hereby consent on behalf of such person(s) to the terms and conditions set forth in these terms of service.",
            {
                title: "TERRITORIAL RESTRICTION",
                contextType: "child",
                content: [
                    `Our Website and Platform are only available for use and download outside the European Union. Our Website and Platform are not available for use or download by residents of, visitors to, or your employees who reside in the European Union (collectively a ‘European’). If you are a European, please do not download, register, and/or use our Website and Platform. If you are a resident in the United States of America (‘US’), you must comply with these Terms of Service and our ${privacyPolicyLink}. If you are a resident of any other country, please ensure compliance with all local laws prior to using our Website and Platform. If you have any questions regarding this Section, please email us at ${supportEmailLink}.`
                ]
            }
        ]
    },
    {
        title: "PRIVACY POLICY",
        content: [
            `Our ${privacyPolicyLink} describes how we handle the personal and business information you provide to us when you register for our Website and Platform. You understand that through your use of our Website and Platform, you consent to the collection and use (as set forth in the ${privacyPolicyLink}) of this information, including the transfer of this information to the US, and/or other countries for storage, processing, and use by MW and our affiliates.`,
            `SAFETY REVIEW OF SESSIONS. To help keep learners safe, MW may review recordings or transcripts of sessions that our staff upload or import. We use automated analysis, including an AI model, to look for safety concerns. The transcript and the findings are stored by MW, and only authorised MW staff can see them. MW may keep these safety review records after an account is deleted, for child-safety purposes. See our ${privacyPolicyLink} for details.`
        ]
    },
    {
        title: "ELIGIBILITY & ACCESS RESTRICTIONS",
        content: [
            "To be eligible to use our Website or Platform, you must meet the following criteria and represent and warrant that you: (a) meet the age requirements set out below; (b) are not currently restricted from accessing our Website or Platform, or not otherwise prohibited from having an account, (c) are not our competitor, or are not using our Website or Platform for reasons that are in competition with us; (d) will only maintain one registered account at any given time; (e) have full power and authority to enter into this Agreement and doing so will not violate any other agreement to which you are a party; (f) will not violate any of our rights, including intellectual property rights such as patent, copyright, and trademark rights; and (g) agree to provide at your cost all equipment, browser software, and internet access necessary to use our Website or Platform.",
            "MELODYWINGS IS FOR ADULTS AGED 18 AND OLDER, WITH THESE EXCEPTIONS. LEARNERS CAN BE ANY AGE FROM 5. A PARENT OR GUARDIAN MUST SIGN UP A LEARNER WHO IS UNDER 13, AND ALSO A LEARNER WHO IS 13 OR OLDER BUT HAS LIMITED LEGAL OR DECISION-MAKING CAPACITY (THAT IS, WHO NEEDS SUPPORT MAKING DECISIONS). VOLUNTEERS MUST BE AT LEAST 13, AND VOLUNTEERS UNDER 18 NEED THE CONSENT OF A PARENT OR GUARDIAN. PARENTS OR GUARDIANS SIGNING UP OR CONSENTING FOR SUCH USERS AGREE TO TAKE FULL RESPONSIBILITY FOR THEIR USE OF THE SITE AND HEREBY CONSENT ON BEHALF OF SUCH PERSON(S) TO THE TERMS AND CONDITIONS SET FORTH IN THESE TERMS OF SERVICE."
        ]
    },
    {
        title: "SERVICE LICENSE",
        content: [
            "Subject to your compliance with the terms of this Agreement, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use our Website or Platform to access, stream, download, and use on your mobile device our Website or Platform and content made available in or otherwise accessible through our Website or Platform, strictly in accordance with this Agreement.",
            "You will not use, copy, adapt, modify, prepare derivative works based upon our Website or Platform, distribute, license, sell, transfer, publicly display, publicly perform, transmit, stream, broadcast or otherwise exploit our Website or Platform, except as expressly permitted in this Agreement. When using and accessing our Website or Platform, you need to make sure that your internet connection is adequate. You are solely responsible for your internet connection including and not limited to the applicable charges, rates, tariffs, and other fees that might apply.",
            "YOU AGREE THAT WE ARE NOT LIABLE FOR ANY DAMAGES OR INJURY RESULTING FROM YOUR ACCESS OR USE OF OUR WEBSITE OR PLATFORM. WE PROVIDE NO WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE OR WARRANTY OF MERCHANTABILITY. THERE IS NO WARRANTY WHICH WILL EXTEND BEYOND THE DESCRIPTION ON THE FACE HEREOF. ANY DAMAGE ALLEGED FOR A LOSS OR INJURY IS LIMITED TO THE FEE, IF ANY, PAID TO MW FOR THE ABILITY TO ACCESS OR USE OUR WEBSITE OR PLATFORM."
        ]
    },
    {
        title: "ACCESS AND SERVICE RESTRICTIONS",
        content: [
            "You agree that our Platform, including but not limited to the Website, graphics, trademarks, and editorial content, contains proprietary content, information, and material, which are owned by MW and/or our licensors, including our customers, brands and agencies, and are protected by applicable intellectual property and other laws, including but not limited to copyright. You agree that you will not use such proprietary content, information or materials other than for your permitted use of our Platform or in any manner that is inconsistent with the terms contained in this Agreement.",
            "You agree not to modify, rent, lease, loan, sell, distribute, or create derivative works based on our Website or Platform, in any manner, and you will not exploit our Website or Platform in any unauthorized way whatsoever, including but not limited to, using our Website or Platform to transmit any computer viruses, worms, Trojan horses or other malware, or by trespassing or burdening network capacity. You further agree not to use our Website or Platform in any manner to harass, abuse, stalk, threaten, defame or otherwise infringe or violate the rights of any other party, and that we are not in any way responsible for any such use by you, nor for any harassing, threatening, defamatory, offensive, infringing or illegal messages or transmissions that you may receive as a result of using our Website or Platform."
        ]
    },
    {
        title: "RESERVATION OF RIGHTS",
        content: [
            "You acknowledge and agree that our Website and Platform are provided for your use. Except to the extent necessary to access and use our Website or Platform, nothing in this Agreement grants any title or ownership interest in or to any copyrights, patents, trademarks, trade secrets or other proprietary rights in or relating to our Website or Platform, whether expressly, by implication, estoppel, or otherwise. MW and its licensors and service providers reserve and will retain their entire right, title, and interest in and to our Website and Platform, including all copyrights, trademarks, and other intellectual property rights therein or relating thereto, except as expressly granted to you in this Agreement."
        ]
    },
    {
        title: "ACCESS RIGHTS",
        content: [
            `You can access and use our Website at ${websiteLink}. When using our Platform, you are required to provide us with registration information including personal information. You agree that we have the right to disable your access and use rights, at any time if, in our opinion, you have violated any provision of this Agreement and/or our ${privacyPolicyLink}. You agree to cooperate with us if the security of our Website or Platform is compromised by you or another person through the use of our Website or Platform. We will not be liable for any loss or damage arising from your failure to comply with this Section.`,
            `We collect personal and business information (as set forth in our ${privacyPolicyLink}), which we need from you when you register to use our Website or Platform. This information is necessary for us to provide our Website or Platform to you and is stored on our servers to enable us to continue to provide our Website or Platform to you. Upon your written request, we will provide you with a list of all of the Personal Information that we store on you within forty-five (45) days of receiving your request. Also, upon your prior written request, we will delete any such information within forty-five (45) days of receiving your request. Notwithstanding, please note that, if you ask us to delete all such information, we will not be able to continue to provide our Website or Platform to you. Please send your requests to us at ${supportEmailLink}.`
        ]
    },
    {
        title: "REQUIRED CONDUCT AND PROHIBITED CONDUCT",
        contextType: "parent",
        content: [
            "As a condition to access our Website or Platform, you agree to this Agreement and to strictly observe the following:",
            {
                title: "a) Required Conduct",
                contextType: "list",
                content: [
                    "Comply with all applicable laws, including, without limitation, tax laws, export control laws and regulatory requirements;",
                    "Provide accurate information to MW and update from time to time as may be necessary;",
                    `Review our ${privacyPolicyLink}; and`,
                    "Review and comply with notices sent by MW, if any, concerning our Website or Platform.",
                ]
            },
            {
                title: "b) Prohibited Conduct",
                contextType: "list",
                content: [
                    "Duplicate, license, sublicense, publish, broadcast, transmit, distribute, perform, display, sell, rebrand, otherwise transfer or commercially exploit our Website or Platform (excluding any user content);",
                    "Reverse engineer, decompile, disassemble, decipher, capture screen shots, or otherwise attempt to derive the source code for any underlying intellectual property used to provide our Website or Platform, or any part thereof;",
                    "Utilize information, content or any data you view on and/or obtain from our Website or Platform to provide any service that is competitive with us;",
                    "Imply or state, directly or indirectly, that you are affiliated with or endorsed by MW unless you have entered into a written agreement with us;",
                    "Adapt, modify, or create derivative works based on our Website or Platform or technology underlying our Website or Platform, or other users’ content, in whole or in part;",
                    "Rent, lease, loan, trade, sell/re-sell access to our Website or Platform or any information therein, or the equivalent, in whole or part;",
                    "Access, reload, or “refresh” or make any other request to transactional servers that are beyond generally accepted usage of web-based applications;",
                    "Use manual or automated software, devices, scripts robots, other means or processes to 'scrape', 'crawl' or 'spider' any web pages contained in the Website;",
                    "Use automated methods to add contacts or send messages;",
                    "Engage in 'framing', 'mirroring', or otherwise simulating the appearance or function of our Website;",
                    "Attempt to or actually access our Website or Platform by any means other than through the interface provided by MW;",
                    "Attempt to or actually override any security component included in or underlying our Website or Platform;",
                    "Engage in any action that interferes with the proper working of or places an unreasonable load on our infrastructure, including but not limited to unsolicited communications, attempts to gain unauthorized access, or transmission or activation of computer viruses;",
                    "Remove any copyright, trademark, or other proprietary rights notices contained in or on our Website or Platform, including those of both MW or any of our licensors;",
                    "Use any information obtained from our Website or Platform to harass, abuse, or harm another user;",
                    "Engage in any action or promote any content that is harmful, offensive, illegal, unlawful, discriminatory, dangerous, profane, or abusive."
                ]
            }
        ]
    },
    {
        title: "MW COMMUNICATIONS",
        contextType: "parent",
        content: [
            "You understand and agree that you may receive information and notifications from MW by email and push notification.",
            {
                title: "a) Email Contact",
                contextType: "child",
                content: [
                    `We may send promotional messages about us and our products and services related to our Website and Platform to your email. When you send us a query email at ${supportEmailLink}, you are providing us with consent to send emails to you for replying to your queries at your provided email address. By providing your email address, you agree with these Terms of Service and our ${privacyPolicyLink}. `
                ]
            },
            {
                title: "b) Push Notifications",
                contextType: "child",
                content: [
                    "You can opt out of receiving push notifications through your device settings. Please note that opting out of receiving push notifications may impact your use of our Website, App, and Platform."
                ]
            },
        ]
    },
    {
        title: "PAYMENT",
        content: [
            `Our Website and Platform are currently provided to you at no cost. In the event that we change this in the future, we will communicate such modification to you as per the procedure detailed under Section 18 or as otherwise specified in another agreement between MW and you. Donations are generally final. If you made a mistake, email us at ${supportEmailLink} and we will review it.`
        ]
    },
    {
        title: "INDEMNIFICATION",
        content: [
            "You agree to indemnify, defend, and hold MW and our officers, employees, managers, directors, customers, and agents (the “Indemnitees”) harmless from and against any and all costs, liabilities, losses and expenses (including but not limited to reasonable attorneys’ fees) resulting from any claim, suit, action, demand or proceeding brought by any third party against MW and our Indemnitees arising from any of the following: (i) a breach of this Agreement; (ii) the negligence, fraud, or willful misconduct of you or your employees, agents, or contractors; (iii) incorrect information provided by you in your account or elsewhere; or (iv) a failure by you or your employees, agents, contractors or invitees to comply with applicable laws and regulations."
        ]
    },
    {
        title: "DISCLAIMERS",
        content: [
            "Your access to and use of our Website and Platform or any content are at your own risk. You understand and agree that our Website and Platform are provided to you on an “AS IS” and “AS AVAILABLE” basis. Without limiting the foregoing, to the maximum extent permitted under applicable law, WE DISCLAIM ALL WARRANTIES AND CONDITIONS, WHETHER EXPRESS OR IMPLIED, OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We make no warranty or representation and disclaim all responsibility and liability for: (i) the completeness, accuracy, availability, timeliness, security or reliability of our Website or Platform or any content; (ii) any harm to your computer system, loss of data, or other harm that results from your access to or use of our Website or Platform or any content; (iii) the deletion of, or the failure to store or to transmit, any content and other communications maintained by our Website or Platform; and (iv) whether our Website or Platform will meet your requirements or be available on an uninterrupted, secure, or error-free basis. No advice or information, whether oral or written, obtained from us or through our Website or Platform, will create any warranty or representation not expressly made herein.",
            "MW DOES NOT REVIEW, VERIFY, REVISE, ENDORSE, OR OTHERWISE APPROVE ANY CONTENT CREATED OR POSTED BY OUR USERS, AND COMMUNICATED TO OTHER USERS OR THIRD PARTIES VIA OUR WEBSITE OR PLATFORM, BUT MW WILL REMOVE CONTENT THAT VIOLATES ANY LAWS OR THIS AGREEMENT. UNDER NO CIRCUMSTANCES WILL MW BE LIABLE IN ANY WAY FOR ANY CONTENT CREATED OR POSTED BY OUR USERS FOR, INCLUDING, WITHOUT LIMITATION, ANY ERRORS OR OMISSIONS IN ANY CONTENT, OR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF SUCH CONTENT. THE CONTENT IS SOLELY CREATED BY OUR USERS, AND MW SPECIFICALLY DISCLAIMS ANY AND ALL ROLE WHATSOEVER WITH RESPECT TO THE CREATION OR POSTING OF SUCH CONTENT."
        ]
    },
    {
        title: "LIMITATION OF LIABILITY",
        content: [
            "You acknowledge and agree that, in no event will MW be liable to you or any third party for any indirect, punitive, exemplary, incidental, special, or consequential damages whether in contract, tort (including negligence), or otherwise arising out of this Agreement, or the use of, or the inability to use, our Website or Platform, including, without limitation, any information made available through our Website or Platform pursuant to this Agreement. In the event the foregoing limitation of liability is determined by a court of competent jurisdiction to be unenforceable, then the maximum liability for all claims of every kind will not exceed one times (1x) the aggregate of payments received under this Agreement. The foregoing limitation of liability will cover, without limitation, any technical malfunction, computer error or loss of data, and any other injury arising from the use of our Website or Platform. Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for incidental or consequential damages. To the extent that MW may not disclaim any implied warranty or limit its liabilities, the scope and duration of such warranty and the extent of MW’s liability will be the minimum permitted under applicable law."
        ]
    },
    {
        title: "TERMINATION",
        content: [
            `We reserve the right to suspend or terminate your account or cease providing you with access to all or part of our Website or Platform at any time for any or no reason, including, but not limited to, if we reasonably believe: (i) you have violated this Agreement or our ${privacyPolicyLink}, (ii) you create risk or possible legal exposure for MW; or (iii) our provision of our Website or Platform to you is no longer commercially viable. We will make reasonable efforts to notify you of such termination by the email address associated with your account or the next time you attempt to access your account, depending on the circumstances. In all such cases, this Agreement shall terminate, including, without limitation, your license to use our Website or Platform.`,
            "All sections, which by their nature and context are intended to survive the termination of this Agreement, will survive."
        ]
    },
    {
        title: "COPYRIGHT INFRINGEMENT/DMCA NOTICE",
        content: [
            "If you believe that any content on our Website or Platform violates your copyright, and you wish to have the allegedly infringing material removed, the following information in the form of a written notification (pursuant to the Digital Millennium Copyright Act of 1998 (“DMCA Takedown Notice”)) must be provided to our designated Copyright Agent.",
            "a) Your physical or electronic signature;",
            "b) Identification of the copyrighted work(s) that you claim to have been infringed;",
            "c) Identification of the material on our Website or Platform that you claim is infringing and that you request us to remove;",
            "d) Sufficient information to permit us to locate such material;",
            "e) Your address, telephone number, and email address;",
            "f) A statement that you have a good faith belief that use of the objectionable material is not authorized by the copyright owner, its agent, or under the law; and",
            "g) A statement that the information in the notification is accurate, and under penalty of perjury, that you are either the owner of the copyright that has allegedly been infringed or that you are authorized to act on behalf of the copyright owner.",
            `MW’s Copyright Agent to receive DMCA Takedown Notices is Chitra Ganesan, at ${supportEmailLink} and at MelodyWings, 9852 Wesbourne Way, Granite Bay - CA 95746. You acknowledge that for us to be authorized to take down any content, your DMCA Takedown Notice must comply with all the requirements of this Section. Please note that, pursuant to 17 U.S.C. § 512(f), any misrepresentation of material fact (falsities) in a written notification automatically subjects the complaining party to liability for any damages, costs and attorney’s fees incurred by MW in connection with the written notification and allegation of copyright infringement.`
        ]
    },
    {
        title: "ASSIGNMENT",
        content: [
            "This Agreement is only for your benefit. You shall have no right to assign this Agreement or any benefits or obligation hereunder to any other party or legal entity. Any attempted assignment shall be void."
        ]
    },
    {
        title: "ANTI-BRIBERY AND EXPORT COMPLIANCE",
        content: [
            "You agree not to promote, approach, use, distribute, transfer, provide, sub-license, share with, or otherwise offer our Website or Platform in violation of any laws or this Agreement, including, without limitation, the United States Foreign Corrupt Practices Act, the UK Bribery Act and similar anti-corruption statutes in all jurisdictions. Without limiting the foregoing, you will not knowingly directly or indirectly export, re-export, transfer, make available or release (collectively, “Export”) our Website or Platform to any destination, person, entity or end-use prohibited or restricted under the US law without prior US government authorization to the extent required by the applicable export control regulations, including without limitation, to any parties listed on any of the denied parties lists or specially designated nationals lists maintained under the Export Administration Regulations or the Security, and the Foreign Asset Control Regulations (31 CFR 500 et seq.) administered by the US Department of Treasury, Office of Foreign Assets Control without appropriate US government authorization to the extent required by the applicable regulations."
        ]
    },
    {
        title: "MODIFICATIONS",
        content: [
            "We will post any changes to these Terms of Service in a notice of the change at the bottom of our web page with a hyperlink thereto. We will also send you an email describing such changes. Please regularly review these terms of service. Notwithstanding if you continue to use our services, you are bound by any changes that we make to these Terms of Service."
        ]
    },
    {
        title: "RELATIONSHIP OF PARTIES",
        content: [
            "The parties hereto are independent contractors, and nothing contained herein shall be interpreted as creating any relationship other than that of independent contracting parties. The parties shall not be construed as being partners, joint ventures, shareholders, employer/employee, or agent/servant. The User has no power or authority to bind MW to any obligation, agreement, debt or liability. The User shall not hold itself out as an agent or representative of MW. "
        ]
    },
    {
        title: "GOVERNING LAW",
        content: [
            "This Agreement shall be governed by the law of the State of California, without respect to its conflicts of laws principles. Each of the parties to this Agreement consents to the exclusive jurisdiction and venue of the state and federal courts located in Placer County, California for any actions not subject to Dispute Resolution and Arbitration provisions as set forth in Section 21."
        ]
    },
    {
        title: "DISPUTE RESOLUTION AND ARBITRATION",
        contextType: "parent",
        content: [
            "PLEASE READ THE FOLLOWING SECTION CAREFULLY BECAUSE IT REQUIRES YOU TO ARBITRATE CERTAIN DISPUTES AND CLAIMS WITH MW AND LIMITS THE MANNER IN WHICH YOU CAN SEEK RELIEF FROM US.",
            {
                title: "a) Binding Arbitration",
                contextType: "child",
                content: [
                    "Except for any disputes, claims, suits, actions, causes of action, demands or proceedings (collectively, “Disputes”) in which either party seeks to bring an individual action in small claims court or seeks injunctive or other equitable relief for the alleged unlawful use of intellectual property, including, without limitation, copyrights, trademarks, trade names, logos, trade secrets or patents, you and MW agree (a) to waive your and MW’s respective rights to have any and all Disputes arising from or related to this Agreement, use of our Website or Platform, resolved in a court, and (b) to waive your and MW’s respective rights to a jury trial. Instead, you and MW agree to arbitrate Disputes through binding arbitration (which is the referral of a Dispute to one or more persons charged with reviewing the Dispute and making a final and binding determination to resolve it instead of having the Dispute decided by a judge or a jury in court). "
                ]
            },
            {
                title: "b) No Class Arbitrations, Class Actions or Representative Actions",
                contextType: "child",
                content: [
                    "You and MW agree that any Dispute arising out of or related to these Terms of Service or use or access of our Website or Platform is personal to you and MW and that such Dispute will be resolved solely through individual arbitration and will not be brought as a class arbitration, class action or any other type of representative proceeding. You and MW agree that there will be no class arbitration or arbitration in which an individual attempts to resolve a Dispute as a representative of another individual or group of individuals. Further, you and MW agree that a Dispute cannot be brought as a class or other type of representative action, whether within or outside of arbitration, or on behalf of any other individual or group of individuals. "
                ]
            },
            {
                title: "c) Federal Arbitration Act",
                contextType: "child",
                content: [
                    "You and MW agree that these Terms of Service affect interstate commerce and that the enforceability of this Section shall be both substantively and procedurally governed by and construed and enforced in accordance with the Federal Arbitration Act, 9 U.S.C. § 1 et seq. (the “FAA”), to the maximum extent permitted by applicable law."
                ]
            },
            {
                title: "d) Notice; Informal Dispute Resolution",
                contextType: "child",
                content: [
                    "You and MW agree that each party will notify the other party in writing of any arbitral or small claims Dispute within thirty (30) days of the date it arises, so that the parties can attempt in good faith to resolve the Dispute informally. Notice to MW shall be sent by certified mail or courier to MelodyWings, Attn: Chitra Ganesan, 9852 Wesbourne Way, Granite Bay - CA 95746. Your notice must include (a) your name, postal address, telephone number, the email address you use or used for your MW account and, if different, an email address at which you can be contacted, (b) a description in reasonable detail of the nature or basis of the Dispute, and (c) the specific relief that you are seeking. Our notice to you will be sent electronically in accordance with this Agreement and will include (x) our name, postal address, telephone number and an email address at which we can be contacted with respect to the Dispute, (y) a description in reasonable detail of the nature or basis of the Dispute, and (z) the specific relief that we are seeking. If you and MW cannot agree how to resolve the Dispute within thirty (30) days after the date notice is received by the applicable party, then either you or MW may, as appropriate and in accordance with this Section, commence an arbitration proceeding."
                ]
            },
            {
                title: "e) Process",
                contextType: "child",
                content: [
                    "EXCEPT FOR DISPUTES IN WHICH EITHER PARTY SEEKS TO BRING AN INDIVIDUAL ACTION IN SMALL CLAIMS COURT OR SEEKS INJUNCTIVE OR OTHER EQUITABLE RELIEF FOR THE ALLEGED UNLAWFUL USE OF INTELLECTUAL PROPERTY, INCLUDING, WITHOUT LIMITATION, COPYRIGHTS, TRADEMARKS, TRADE NAMES, LOGOS, TRADE SECRETS OR PATENTS, YOU AND MW AGREE THAT ANY DISPUTE MUST BE COMMENCED OR FILED BY YOU OR MW WITHIN (1) YEAR OF THE DATE THE DISPUTE AROSE, OTHERWISE THE UNDERLYING CLAIM IS PERMANENTLY BARRED (WHICH MEANS THAT YOU AND MW WILL NO LONGER HAVE THE RIGHT TO ASSERT SUCH CLAIM REGARDING THE DISPUTE). You and MW agree that (a) any arbitration will occur in Placer County, California, (b) arbitration will be conducted confidentially by a single arbitrator in accordance with the Commercial Arbitration Rules and the Supplementary Procedures for Consumer Related Disputes (the “AAA Rules”) then in effect, except as modified by this “Dispute Resolution” section, and (c) that the state or federal courts of the State of California, have exclusive jurisdiction over any appeals and the enforcement of an arbitration award. You may also litigate a Dispute in the small claims court located in the county of your billing address if the Dispute meets the requirements to be heard in small claims court."
                ]
            },
            {
                title: "f) Authority of Arbitrator",
                contextType: "child",
                content: [
                    "As limited by the FAA, these Terms of Service and the applicable AAA Rules, the arbitrator will have (a) the exclusive authority and jurisdiction to make all procedural and substantive decisions regarding a Dispute, including the determination of whether a Dispute is arbitral, and (b) the authority to grant any remedy that would otherwise be available in court; provided, however, that the arbitrator does not have the authority to conduct a class arbitration or a representative action, which is prohibited by these Terms of Service. The arbitrator may only conduct an individual arbitration and may not consolidate more than one individual’s claims, preside over any type of class or representative proceeding, or preside over any proceeding involving more than one individual. Notwithstanding anything to the contrary herein or the applicable AAA Rules, discovery in the arbitration shall be limited to one set of interrogatories, one set of requests for admissions, and one set of requests for production of documents.",
                    "The arbitrator’s award of damages must be consistent with the terms of the “Limitation of Liability” section above as to the types and amounts of damages for which a party may be held liable. The arbitrator may award declaratory or injunctive relief only in favor of the claimant and only to the extent necessary to provide relief warranted by the claimant’s individual claim. You agree that the party that prevails in arbitration will be entitled to an award of attorneys’ fees and expenses, to the extent provided under applicable law."
                ]
            },
            {
                title: "g) Rules of AAA",
                contextType: "child",
                content: [
                    `The AAA Rules are available at ${createLink("https://www.adr.org/Rules", "https://www.adr.org/Rules")} or by calling the AAA at 1-800-778-7879. By agreeing to be bound by these Terms of Service, you either (a) acknowledge and agree that you have read and understand the rules of AAA, or (b) waive your opportunity to read the rules of AAA and any claim that the rules of AAA are unfair or should not apply for any reason.`
                ]
            },
            {
                title: "h) Severability",
                contextType: "child",
                content: [
                    "If any term, clause or provision of this Section is held invalid or unenforceable, it will be so held to the minimum extent required by law, and all other terms, clauses and provisions of this Section will remain valid and enforceable. Further, the waivers set forth herein are severable from the other provisions of this Agreement and will remain valid and enforceable, except as prohibited by applicable law."
                ]
            },
            {
                title: "i) Opt-Out Right",
                contextType: "child",
                content: [
                    "YOU HAVE THE RIGHT TO OPT OUT OF BINDING ARBITRATION WITHIN THIRTY (30) DAYS OF THE DATE YOU FIRST ACCEPTED THE TERMS OF THIS SECTION BY WRITING TO: MELODYWINGS, RE: OPT-OUT, 9852 WESBOURNE WAY, GRANITE BAY - CA 95746. IN ORDER TO BE EFFECTIVE, THE OPT OUT NOTICE MUST INCLUDE YOUR FULL NAME AND CLEARLY INDICATE YOUR INTENT TO OPT OUT OF BINDING ARBITRATION. BY OPTING OUT OF BINDING ARBITRATION, YOU ARE AGREEING TO RESOLVE DISPUTES IN ACCORDANCE WITH SECTION 20 (GOVERNING LAW)."
                ]
            }

        ]
    },
    {
        title: "MISCELLANEOUS",
        content: [
            `This Agreement along with our ${privacyPolicyLink} constitutes the entire agreement between you and MW and supersedes any prior agreements between you and MW with respect to the subject matter herein. Our failure to exercise or enforce any right or provision of this Agreement will not constitute a waiver of such right or provision. If any provision of this Agreement is found by a court of competent jurisdiction to be invalid, we both nevertheless agree that the court should endeavor to give effect to our intentions as reflected in this provision, and the other provisions of this Agreement to remain in full force and effect. You agree that regardless of any statute or law to the contrary, any claim or cause of action arising out of or related to use of our Website or Platform or this Agreement must be filed within one (1) year after such claim or cause of action arose or be forever barred. A party’s failure to act with respect to a breach by the other party does not constitute a waiver of the party’s right to act with respect to subsequent or similar breaches. All the sections intended to survive the termination of this Agreement shall survive. The section titles in this Agreement are for convenience only and have no legal or contractual effect. Except as explicitly stated otherwise, any notices to MW shall be given by certified mail, postage prepaid and return receipt requested to MelodyWings at 9852 Wesbourne Way, Granite Bay - CA 95746. Any notices to you shall be provided to you through our Website or Platform or given to you via the email address or physical address you provide to MW during the registration process.`
        ]
    }
];