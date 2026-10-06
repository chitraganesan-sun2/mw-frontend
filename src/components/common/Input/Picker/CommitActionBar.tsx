import MuiButton from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import type { PickersActionBarProps } from "@mui/x-date-pickers/PickersActionBar";

/**
 * Cancel / OK bar for MUI time pickers that always commits what is on screen.
 *
 * MUI's own OK only fires `onAccept` when the committed value differs from what it last
 * "published". A picker whose value is seeded with a default when it opens (or that is
 * never touched) therefore ignores OK and silently reverts on close. Pass the handlers
 * through `slotProps.actionBar` and keep the picker's `open` state controlled:
 *
 *   slots={{ actionBar: CommitActionBar }}
 *   slotProps={{ actionBar: { onCancelClick, onAcceptClick } as any }}
 */
export default function CommitActionBar(props: PickersActionBarProps) {
    const { className } = props;
    const { onCancelClick, onAcceptClick } = props as unknown as {
        onCancelClick: () => void;
        onAcceptClick: () => void;
    };
    return (
        <DialogActions className={className}>
            <MuiButton onClick={onCancelClick}>Cancel</MuiButton>
            <MuiButton onClick={onAcceptClick}>OK</MuiButton>
        </DialogActions>
    );
}
