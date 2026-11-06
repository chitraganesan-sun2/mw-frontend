"use client";

import { useUrlParam } from "@/hooks/useUrlParam";
import { Panel } from "./shared";

export default function FeaturesCTA() {
    const [, setParamMode] = useUrlParam("signup_as");

    return (
        <Panel>
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-6 text-center lg:py-8">
                <h2 className="text-2xl font-medium leading-normal lg:text-[2rem]">Ready to get started?</h2>
                <p className="max-w-2xl text-sm leading-normal text-gray-light lg:text-lg">
                    Join learners and volunteers making meaningful connections. Start your journey with MelodyWings today.
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => setParamMode("learner")} className="btn-learner-fill rounded-full px-8 py-3 text-base font-medium">
                        Join as a Learner
                    </button>
                    <button onClick={() => setParamMode("volunteer")} className="btn-volunteer-fill rounded-full px-8 py-3 text-base font-medium">
                        Join as a Volunteer
                    </button>
                </div>
                <p className="text-sm text-gray-light">Free to join. Start learning or teaching in minutes.</p>
            </div>
        </Panel>
    );
}
