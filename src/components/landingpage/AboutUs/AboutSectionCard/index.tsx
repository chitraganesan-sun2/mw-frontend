import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AboutUsImg from '@/assets/images/our-team/AboutUs.png';
import AboutMe from '@/assets/images/AboutMe.png';
function AboutSectionCard() {
  return (
    <div className="bg-white rounded-3xl w-full flex flex-col gap-10 p-5 md:p-10 mt-5">
      <div className="w-full flex gap-10 max-lg:flex-col max-md:border-b max-md:pb-8" >
        <div className="lg:w-[22%] flex justify-center items-center">
          <Image src={AboutMe} alt="About Us" className='!h-[300px] lg:!h-fit  max-lg:w-auto object-contain rounded-lg' />
        </div>
        <div className="lg:w-[78%]">
          <p className="text-sm md:text-base lg:text-xl font-normal leading-8 max-md:!leading-6 text-justify tracking-wide">
            The idea for MelodyWings was born from the shared experiences of a mother-daughter duo, Chitra and Nithila, during their time volunteering with His Mountain Top Ministries (<Link href="https://hismountaintopministries.com" target="_blank" className="font-semibold underline">HMM</Link>) through National Charity League Inc (NCL). {" "}
            <Link href="https://www.nationalcharityleague.org/chapter/granitebayarea" target="_blank" className="font-semibold underline">NCL, Granite Bay Area Chapter</Link> is a group of mothers and daughters who have come together in a commitment to community service for more than 35 non-profits, and HMM is one among them.
            HMM offers horse therapy for children with special needs.
            As &quot;sidewalkers,&quot; Chitra and Nithila walked alongside the horses, ensuring the children&apos;s safety as they participated in therapeutic activities.
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm md:text-base lg:text-xl font-normal leading-8 max-md:!leading-6 text-justify tracking-wide">
          They observed that one kid, despite struggling with stress and self-regulation, loved singing and had an exceptional voice.
          A few other children, despite having a limited attention span, enjoyed singing full rhymes with enthusiasm.
          Motivated by these experiences, Nithila decided to begin a research project in high school focused on the impact of music on children with special needs.
          This passion, combined with a love for music, inspired the creation of MelodyWings—a platform designed to help children explore their musical interests with the support of dedicated volunteers.
          Over time, MelodyWings expanded to offer a wide variety of subjects and skill-building opportunities, all tailored to the unique needs of children with special needs and developmental disabilities.
        </p>
      </div>
    </div>
  );
}

export default AboutSectionCard;