/**
 * WingTime (volunteer-led group sessions) is switched on per deployment. The backend answers 404
 * for every WingTime route until its own WINGTIME_ENABLED is set, so this only decides whether
 * the app shows the feature - turn both on together. NEXT_PUBLIC_* values are baked in at build
 * time, so changing it needs a rebuild/redeploy.
 */
export const WINGTIME_ENABLED = process.env.NEXT_PUBLIC_ENABLE_WINGTIME === "true";
