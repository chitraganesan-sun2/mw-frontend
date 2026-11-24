import test from "node:test";
import assert from "node:assert/strict";
import {
    isEndOfList,
    messageCountLabel,
    nextNotificationCursor,
    notificationsQuery,
} from "../../src/utils/notificationCursor.ts";

const items = (n: number) => Array.from({ length: n }, (_, i) => ({ notification_id: `n${i}` }));

test("the next cursor is the last item's id while pages are full", () => {
    assert.equal(nextNotificationCursor(items(20), 20), "n19");
});

test("a short or empty page ends the list", () => {
    assert.equal(nextNotificationCursor(items(19), 20), undefined);
    assert.equal(nextNotificationCursor([], 20), undefined);
    assert.equal(nextNotificationCursor(undefined, 20), undefined);
    assert.equal(nextNotificationCursor([{}], 1), undefined); // no id to page by
});

test("the query carries before only after the first page, and include_read explicitly", () => {
    assert.equal(notificationsQuery({}), "size=20&include_read=false");
    assert.equal(notificationsQuery({ before: "abc", size: 10, includeRead: true }), "before=abc&size=10&include_read=true");
});

test("a 404 (unknown cursor) is the end of the list; other errors are not", () => {
    assert.equal(isEndOfList({ status: 404 }), true);
    assert.equal(isEndOfList({ status: 500 }), false);
    assert.equal(isEndOfList(null), false);
});

test("message_count shows 'N messages' only for a collapsed burst", () => {
    assert.equal(messageCountLabel(3), "3 messages");
    assert.equal(messageCountLabel(1), null);
    assert.equal(messageCountLabel(undefined), null);
});
