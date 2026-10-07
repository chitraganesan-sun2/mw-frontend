/**
 * Entity colour for a "Learner" / "Volunteer" role tag (Blue = Learner, Orange = Volunteer),
 * fixed regardless of who is viewing - unlike the Tag default `bg-background`, which is the
 * signed-in viewer's own theme and so painted every author tag the viewer's colour.
 * Text stays black on the light tint for contrast.
 */
export const roleTagClass = (role?: string | null) => {
    switch ((role ?? "").toLowerCase()) {
        case "volunteer":
            return "!bg-volunteer-light !text-black !border-none";
        case "learner":
            return "!bg-learner-light !text-black !border-none";
        default:
            return "";
    }
};
