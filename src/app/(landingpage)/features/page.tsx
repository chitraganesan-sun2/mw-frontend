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
            <LearnerFeatures />
            <VolunteerFeatures />
            <PlatformCapabilities />
            <SafetyFeatures />
            <FeaturesCTA />
        </div>
    );
}
