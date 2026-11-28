import test from "node:test";
import assert from "node:assert/strict";
import {
    agendaTabOf,
    countByTab,
    countByKind,
    statusOptions,
    filterAgenda,
    groupAgenda,
    sortAgenda,
    type AgendaEntry,
} from "../../src/utils/scheduleAgenda.ts";
import { getSessionKind, getSessionOriginNote } from "../../src/components/schedule/Dashboard/scheduleCategories.ts";

const entry = (over: Partial<AgendaEntry> & { key: string }): AgendaEntry => ({
    kind: "session",
    tab: "upcoming",
    date: "2026-11-26",
    time: "10:00",
    needsResponse: false,
    status: "accepted",
    statusLabel: "Accepted",
    searchText: "",
    data: null,
    ...over,
});

const TODAY = "2026-11-26";

test("upcoming sorts soonest first across kinds, past sorts most recent first", () => {
    const items = [
        entry({ key: "c", date: "2026-11-28", time: "09:00", kind: "wingtime" }),
        entry({ key: "a", date: "2026-11-26", time: "09:00" }),
        entry({ key: "b", date: "2026-11-26", time: "15:30", kind: "instant" }),
    ];
    assert.deepEqual(sortAgenda(items, "upcoming").map((e) => e.key), ["a", "b", "c"]);
    assert.deepEqual(sortAgenda(items, "past").map((e) => e.key), ["c", "b", "a"]);
});

test("an item with no date sorts last when upcoming instead of jumping to the top", () => {
    const items = [entry({ key: "nodate", date: "" }), entry({ key: "dated", date: "2026-12-01" })];
    assert.deepEqual(sortAgenda(items, "upcoming").map((e) => e.key), ["dated", "nodate"]);
});

test("upcoming groups: needs-response first, then today, tomorrow, this week, next week, later", () => {
    const items = [
        entry({ key: "r", needsResponse: true, date: "2026-12-20" }),
        entry({ key: "t", date: "2026-11-26" }),
        entry({ key: "m", date: "2026-11-27" }),
        entry({ key: "w", date: "2026-12-02" }),
        entry({ key: "n", date: "2026-12-05" }),
        entry({ key: "l", date: "2026-12-30" }),
    ];
    const groups = groupAgenda(items, "upcoming", TODAY);
    assert.deepEqual(
        groups.map((g) => [g.key, g.items.map((i) => i.key)]),
        [
            ["respond", ["r"]],
            ["today", ["t"]],
            ["tomorrow", ["m"]],
            ["week", ["w"]],
            ["next", ["n"]],
            ["later", ["l"]],
        ]
    );
    assert.equal(groups[0].accent, true);
});

test("needs-your-response leads even when it sorts after today's items", () => {
    const sorted = sortAgenda(
        [
            entry({ key: "today", date: "2026-11-26", time: "09:00" }),
            entry({ key: "wk", date: "2026-12-01" }),
            entry({ key: "r", needsResponse: true, date: "2026-12-10" }),
        ],
        "upcoming"
    );
    assert.deepEqual(groupAgenda(sorted, "upcoming", TODAY).map((g) => g.key), ["respond", "today", "week"]);
});

test("a request waiting on the viewer is NOT pulled to the top in the past view", () => {
    const groups = groupAgenda([entry({ key: "r", needsResponse: true, date: "2026-11-20", status: "completed" })], "past", TODAY);
    assert.deepEqual(groups.map((g) => g.key), ["week"]);
});

test("past groups, with later-dated cancelled items kept together", () => {
    const items = [
        entry({ key: "later", date: "2026-12-01", status: "cancelled" }),
        entry({ key: "today", date: "2026-11-26", status: "completed" }),
        entry({ key: "yday", date: "2026-11-25", status: "completed" }),
        entry({ key: "wk", date: "2026-11-22", status: "completed" }),
        entry({ key: "mo", date: "2026-11-01", status: "completed" }),
        entry({ key: "old", date: "2026-08-01", status: "completed" }),
    ];
    assert.deepEqual(
        groupAgenda(items, "past", TODAY).map((g) => g.key),
        ["cancelled-later", "today", "yesterday", "week", "month", "older"]
    );
});

test("filter by kind, status and search together", () => {
    const items = [
        entry({ key: "1", kind: "session", status: "accepted", searchText: "piano with val" }),
        entry({ key: "2", kind: "instant", status: "pending", searchText: "guitar help" }),
        entry({ key: "3", kind: "wingtime", status: "approved", searchText: "cooking club" }),
        entry({ key: "4", kind: "session", status: "pending", searchText: "fractions" }),
    ];
    const f = (kind: string, status: string, search: string) =>
        filterAgenda(items, { kind: kind as never, status, search }).map((e) => e.key);
    assert.deepEqual(f("all", "all", ""), ["1", "2", "3", "4"]);
    assert.deepEqual(f("session", "all", ""), ["1", "4"]);
    assert.deepEqual(f("session", "pending", ""), ["4"]);
    assert.deepEqual(f("all", "all", "  COOKING "), ["3"]);
    assert.deepEqual(f("instant", "accepted", ""), []);
});

test("chip counts and status options are derived from what is loaded", () => {
    const items = [
        entry({ key: "1", kind: "session", status: "accepted" }),
        entry({ key: "2", kind: "session", status: "accepted" }),
        entry({ key: "3", kind: "wingtime", status: "approved", statusLabel: "Approved" }),
    ];
    assert.deepEqual(countByKind(items), { all: 3, session: 2, instant: 0, wingtime: 1 });
    assert.deepEqual(statusOptions(items), [
        { value: "accepted", label: "Accepted" },
        { value: "approved", label: "Approved" },
    ]);
});

test("instant-flow sessions are 'instant', everything else is a regular session", () => {
    assert.equal(getSessionKind({ origin: "learner_request" }), "instant");
    assert.equal(getSessionKind({ session_type: "instant_session" }), "instant");
    assert.equal(getSessionKind({ initiated_by: "volunteer" }), "session");
    assert.equal(getSessionKind({}), "session");
});

test("the origin note reads from the viewer's side", () => {
    assert.equal(getSessionOriginNote({ origin: "learner_request" }, "learner"), "Your request");
    assert.equal(getSessionOriginNote({ origin: "learner_request" }, "volunteer"), "Learner's request");
    assert.equal(getSessionOriginNote({ session_type: "instant_session" }, "volunteer"), "Your posting");
    assert.equal(getSessionOriginNote({ initiated_by: "volunteer" }, "learner"), "Proposed by the volunteer");
    assert.equal(getSessionOriginNote({}, "volunteer"), "Booked by the learner");
});

test("which view an item belongs to: cancelled-like statuses win over the date", () => {
    assert.equal(agendaTabOf("accepted", false), "upcoming");
    assert.equal(agendaTabOf("pending", false), "upcoming");
    assert.equal(agendaTabOf("completed", true), "completed");
    assert.equal(agendaTabOf("accepted", true), "completed");
    // A cancelled session booked for next week is history, not a plan.
    assert.equal(agendaTabOf("cancelled", false), "cancelled");
    assert.equal(agendaTabOf("Cancelled", true), "cancelled");
    assert.equal(agendaTabOf("rejected", true), "cancelled");
    assert.equal(agendaTabOf("declined", false), "cancelled");
    assert.equal(agendaTabOf("expired", true), "cancelled");
});

test("view counts", () => {
    const items = [
        entry({ key: "1", tab: "upcoming" }),
        entry({ key: "2", tab: "upcoming" }),
        entry({ key: "3", tab: "completed" }),
        entry({ key: "4", tab: "cancelled" }),
    ];
    assert.deepEqual(countByTab(items), { upcoming: 2, completed: 1, cancelled: 1 });
});

test("an ended session still waiting to be marked completed leads the Completed view", () => {
    const sorted = sortAgenda(
        [
            entry({ key: "done", date: "2026-11-25", status: "completed", tab: "completed" }),
            entry({ key: "ended", date: "2026-11-20", status: "accepted", tab: "completed" }),
        ],
        "past"
    );
    const groups = groupAgenda(sorted, "past", TODAY);
    assert.deepEqual(groups.map((g) => [g.key, g.items.map((i) => i.key)]), [
        ["wrapup", ["ended"]],
        ["yesterday", ["done"]],
    ]);
    assert.equal(groups[0].accent, true);
});
