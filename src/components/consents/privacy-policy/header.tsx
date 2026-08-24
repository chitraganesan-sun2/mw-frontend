
const headerContents = [
    "WE WILL POST ANY CHANGES TO THIS PRIVACY POLICY IN A NOTICE OF THE CHANGE AT THE BOTTOM OF OUR WEB PAGE WITH A HYPERLINK THERETO. PLEASE REGULARLY REVIEW THIS PRIVACY POLICY. NOTWITHSTANDING IF YOU CONTINUE TO USE OUR SERVICES, YOU ARE BOUND BY ANY CHANGES THAT WE MAKE TO THIS PRIVACY POLICY."
];

const PrivacyPolicyHeader = () => {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 text-center">
                <h5 className="text-xl font-bold">MelodyWings</h5>
                <h6 className="text-2xl font-bold uppercase">Privacy Policy</h6>
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

export default PrivacyPolicyHeader;
