/**
 * Keeps the backend's copy of this device's FCM token in step with the one the OS hands us.
 *
 * Pure logic with injected dependencies (no Capacitor, no network of its own) so it can be unit
 * tested. It exists because the push service used to give the OS only 5 seconds to produce a token
 * and then forgot about it: a token that arrived later, or a token Firebase rotated while the app
 * was open, was cached but never sent to the backend until the next app start - so that phone
 * silently received no pushes in the meantime.
 *
 * Rules:
 *  - every token we learn about is remembered;
 *  - it is sent only while a member is signed in (the endpoint needs the member's login);
 *  - a token that was already sent successfully is not sent again;
 *  - a failed send is retried by the next sync (nothing is marked as sent);
 *  - after sign-out, forget() makes the same token be sent again for whoever signs in next.
 */
export interface PushTokenSyncDeps {
    /** True while a signed-in member's login is available. */
    isSignedIn: () => boolean;
    /** Send the token to the backend. Must reject when the backend did not accept it. */
    send: (token: string) => Promise<void>;
}

export interface PushTokenSync {
    /** A token arrived (first registration, a late one, or a refreshed one). */
    onToken: (token: string) => Promise<void>;
    /** Send the remembered token if it is not already on the backend. Safe to call repeatedly. */
    sync: () => Promise<void>;
    /** The backend no longer holds this device's token (sign-out): the next sync must resend it. */
    forget: () => void;
    /** The most recent token the OS gave us, if any. */
    getToken: () => string | null;
}

export const createPushTokenSync = ({ isSignedIn, send }: PushTokenSyncDeps): PushTokenSync => {
    let token: string | null = null;
    let sentToken: string | null = null;
    let inFlight: Promise<void> | null = null;

    const sync = (): Promise<void> => {
        // One send at a time: a late token and the post-login sync can arrive together.
        if (inFlight) return inFlight;
        const run = async (): Promise<void> => {
            // Re-read after each send: a refreshed token may have arrived while one was in flight.
            for (;;) {
                const candidate = token;
                if (!candidate || candidate === sentToken || !isSignedIn()) return;
                try {
                    await send(candidate);
                } catch {
                    return; // not marked as sent, so the next sync tries again
                }
                sentToken = candidate;
            }
        };
        inFlight = run().finally(() => {
            inFlight = null;
        });
        return inFlight;
    };

    return {
        onToken: (next) => {
            token = next;
            return sync();
        },
        sync,
        forget: () => {
            sentToken = null;
        },
        getToken: () => token,
    };
};
