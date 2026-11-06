type Props = {
    title: string;
    description: string;
    rootClassName?: string;
    titleStyle?: string;
    descriptionStyle?: string;
    /** Use "h1" when this is the page's main heading. */
    as?: "h1" | "h2";
};

const TitleSection = ({ title, description, rootClassName = "", titleStyle = "", descriptionStyle = "", as: Heading = "h2" }: Props) => {
    return (
        <section className={`w-full flex flex-col items-center justify-center pt-16 md:pt-16 ${rootClassName}`}>
            <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center'>
                <Heading className={`text-2xl lg:text-5xl font-medium lg:font-semibold tracking-tight text-gray-900 mb-6 ${titleStyle}`}>
                    {title}
                </Heading>
                <p className={`text-sm lg:text-xl text-black lg:text-gray-600 italic ${descriptionStyle}`}>{description}</p>
            </div>
        </section>
    );
};

export default TitleSection;
