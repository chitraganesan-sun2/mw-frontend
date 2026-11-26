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
            The idea for MelodyWings grew out of the volunteer experiences of mother-daughter duo Chitra and Nithila while volunteering with His Mountaintop Ministries (<Link href="https://hismountaintopministries.com" target="_blank" className="font-semibold underline">HMM</Link>). There, they worked alongside children with special needs participating in equine assisted therapy. As side-walkers, they walked alongside the horses to help ensure the children&apos;s safety during their sessions.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-sm md:text-base lg:text-xl font-normal leading-8 max-md:!leading-6 text-justify tracking-wide">
          Among the children they met was one who often struggled with stress and self-regulation but had a remarkable love for singing and a beautiful voice. They also noticed other children who had difficulty staying focused for long periods but would happily sing songs and nursery rhymes. These experiences highlighted how children could engage with learning in different ways when given opportunities to explore their interests.
        </p>
        <p className="text-sm md:text-base lg:text-xl font-normal leading-8 max-md:!leading-6 text-justify tracking-wide">
          Inspired by these experiences, they wanted to create opportunities for children to pursue their interests, regardless of barriers such as socioeconomic circumstances or limited access to specialized learning opportunities. What began as an idea centered around music gradually expanded into something broader. Today, MelodyWings offers personalized sessions across a variety of subjects and activities, tailored to each learner&apos;s interests, strengths, and individual needs.
        </p>
      </div>
    </div>
  );
}

export default AboutSectionCard;
