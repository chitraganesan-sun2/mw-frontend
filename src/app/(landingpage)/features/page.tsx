import FeaturesHero from "@/components/features/FeaturesHero";
import LearnerFeatures from "@/components/features/LearnerFeatures";
import VolunteerFeatures from "@/components/features/VolunteerFeatures";
import PlatformCapabilities from "@/components/features/PlatformCapabilities";
import SafetyFeatures from "@/components/features/SafetyFeatures";
import FeaturesCTA from "@/components/features/FeaturesCTA";

export default function FeaturesPage() {
    return (
        <div className="w-full overflow-x-hidden relative">
            <FeaturesHero />
            <div className="flex flex-col gap-16 lg:gap-20 py-10 lg:py-16">
                <LearnerFeatures />
                <VolunteerFeatures />
                <PlatformCapabilities />
                <SafetyFeatures />
                <FeaturesCTA />
            </div>
        </div>
    );
}
