type InfoItem = {
    title: string;
    description: string;
};

type Props = {};

const infoItems: InfoItem[] = [
    {
        title: 'Age Requirement:',
        description:
            'Volunteers must be at least 13 years of age. Minors under 18 will need permission from a parent or guardian to participate.',
    },
    {
        title: 'Profile Details:',
        description:
            'As part of this application, please provide your profile picture, information, including your skills, the subjects you wish to teach, your years of experience, and your educational background.',
    },
    {
        title: 'Profile Video:',
        description:
            'As part of your application, please upload a short video introducing yourself, sharing your motivation to teach children with special needs, and highlighting the subjects you would like to teach.',
    },
];

const InfoSection = (props: Props) => {
    return (
        <section className='w-full py-10 lg:py-16'>
            <div className='max-w-7xl p-10 bg-white lg:rounded-3xl mx-auto px-6 lg:px-8'>
                <div className='flex flex-col gap-8'>
                    {infoItems.map((item, index) => (
                        <div key={index} className='flex flex-col gap-2'>
                            <h2 className='text-sm lg:text-xl font-semibold lg:font-medium text-black lg:text-gray-900'>
                                {item.title}
                            </h2>
                            <p className='text-sm lg:text-lg text-gray-600 italic'>
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InfoSection;