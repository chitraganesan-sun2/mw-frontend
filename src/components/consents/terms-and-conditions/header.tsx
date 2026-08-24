const createLink = (href: string, text: string) => `<a href="${href}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;

const headerContents = [
    "WE WILL POST ANY CHANGES TO THESE TERMS OF SERVICE IN A NOTICE OF THE CHANGE AT THE BOTTOM OF OUR WEB PAGE WITH A HYPERLINK THERETO. WE WILL ALSO SEND YOU AN EMAIL DESCRIBING SUCH CHANGES. PLEASE REGULARLY REVIEW THESE TERMS OF SERVICE. NOTWITHSTANDING IF YOU CONTINUE TO USE OUR SERVICES, YOU ARE BOUND BY ANY CHANGES THAT WE MAKE TO THESE TERMS OF SERVICE.",
    `These Terms of Service (\"Agreement\" or \"Terms of Service\") are a legally binding agreement between you (the \"User,\" \"you,\" or \"your\") and MelodyWings (\"MW,\" \"we,\" \"us,\" \"our\"). You acknowledge and agree that your use of the MW platform (the \"Platform\") through MW’s website at ${createLink('https://www.melodywings.org', 'www.melodywings.org')} (the \"Website\") will be governed by this Agreement, our ${createLink('/privacy-policy', 'Privacy Policy')}, and any related terms.`,
    `If you are unsure as to the terms of this Agreement, please do not proceed further and contact us at ${createLink('mailto:support@melodywings.org', 'support@melodywings.org')}.`,
    `Your use of our Website or Platform shall constitute your acceptance of this Agreement and to all of the terms and conditions stated under this Agreement and our ${createLink('/privacy-policy', 'Privacy Policy')} referenced herein.`,
    "PLEASE READ THE TERMS CONTAINED IN THIS AGREEMENT CAREFULLY TO ENSURE THAT YOU UNDERSTAND EACH PROVISION. PLEASE NOTE THAT THESE TERMS CONTAIN A BINDING AND MANDATORY ARBITRATION PROVISION AND CLASS ACTION/JURY TRIAL WAIVER PROVISION THAT REQUIRES THE USE OF ARBITRATION ON AN INDIVIDUAL BASIS TO RESOLVE DISPUTES, RATHER THAN JURY TRIALS OR CLASS ACTIONS AND LIMITS REMEDIES AVAILABLE TO YOU IN THE EVENT OF CERTAIN DISPUTES.",
    `BY ACCEPTING THIS AGREEMENT, EITHER BY CLICKING A BOX INDICATING YOUR ACCEPTANCE OR BY USING AND NAVIGATING THROUGH OUR PLATFORM THROUGH OUR WEBSITE, YOU AGREE THAT (A) YOU HAVE READ AND UNDERSTOOD THE AGREEMENT; (B) YOU REPRESENT THAT YOU ARE AT LEAST 18 YEARS OLD; (C) YOU CAN FORM A BINDING CONTRACT; AND (D) YOU ACCEPT THIS AGREEMENT AND AGREE THAT YOU ARE LEGALLY BOUND BY ITS TERMS AS WELL AS OUR ${createLink('/privacy-policy', 'Privacy Policy')} REFERENCED HEREIN.`,
    `USE OF THE SERVICES IS RESTRICTED TO INDIVIDUALS AGED 18 AND OLDER. HOWEVER, INDIVIDUALS UNDER THE AGE OF 18 OR THOSE WITH MENTAL DEVELOPMENTAL DISABILITIES OF ANY AGE MAY ACCESS THE SERVICES ONLY WHEN ACCOMPANIED BY A PARENT OR LEGAL GUARDIAN. PARENTS OR GUARDIANS ACCOMPANYING SUCH USERS AGREE TO TAKE FULL RESPONSIBILITY FOR THEIR USE OF THE SITE AND HEREBY CONSENT ON BEHALF OF SUCH PERSON(S) TO THE TERMS AND CONDITIONS SET FORTH IN THESE TERMS OF SERVICE, INCLUDING, WITHOUT LIMITATION, THE WAIVER OF THE RIGHT TO A TRIAL BY JURY AND/OR TRIAL BY COURT AND CONSENT TO ARBITRATE ANY CLAIM HEREWITH UNDER THE ARBITRATION CLAUSE SET FORTH HEREIN.`,
    "IF YOU ARE ENTERING INTO THIS AGREEMENT ON BEHALF OF A COMPANY OR OTHER LEGAL ENTITY, YOU REPRESENT THAT YOU HAVE THE AUTHORITY TO BIND SUCH ENTITY AND ITS AFFILIATES TO THESE TERMS AND CONDITIONS, IN WHICH CASE THE TERMS \"YOU\" OR \"YOUR\" SHALL REFER TO SUCH ENTITY AND ITS AFFILIATES. IF YOU DO NOT HAVE SUCH AUTHORITY, OR IF YOU DO NOT AGREE WITH THIS AGREEMENT, YOU MUST NOT ACCEPT THIS AGREEMENT AND MAY NOT USE OUR WEBSITE OR PLATFORM.",
    `Capitalized terms not defined herein shall have the same meaning ascribed to them under our ${createLink('/privacy-policy', 'Privacy Policy')}.`
];

const TermsAndConditionsHeader = () => {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 text-center">
                <h5 className="text-xl font-bold">MelodyWings</h5>
                <h6 className="text-2xl font-bold uppercase">Terms of Service</h6>
                <p className="text-base text-gray-700">Last Updated: March 2025</p>
            </div>
            <div className="flex flex-col gap-3">
                {headerContents.map((content, index) => (
                    <p key={index} className="text-base text-justify text-gray-600" dangerouslySetInnerHTML={{ __html: content }}></p>
                ))}
            </div>
        </div>
    );
};

export default TermsAndConditionsHeader;
