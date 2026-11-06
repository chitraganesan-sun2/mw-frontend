import FeaturesHero from "@/components/features/FeaturesHero";
import LearnerFeatures from "@/components/features/LearnerFeatures";
import VolunteerFeatures from "@/components/features/VolunteerFeatures";
import PlatformCapabilities from "@/components/features/PlatformCapabilities";
import SafetyFeatures from "@/components/features/SafetyFeatures";
import FeaturesCTA from "@/components/features/FeaturesCTA";

export default function FeaturesPage() {
    return (
        <div className="relative flex w-full flex-col gap-6 overflow-x-hidden bg-background-input pb-10 lg:gap-8 lg:pb-16">
            <FeaturesHero />
            <LearnerFeatures />
            <VolunteerFeatures />
            <PlatformCapabilities />
            <SafetyFeatures />
            <FeaturesCTA />
        </div>
    );
}
