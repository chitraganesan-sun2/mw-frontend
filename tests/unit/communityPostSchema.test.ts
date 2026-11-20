import assert from "node:assert/strict";
import { test } from "node:test";
import { PostFormSchema } from "../../src/constants/community.ts";

test("a text-only post is valid (pictures and video are optional)", () => {
    assert.equal(PostFormSchema.safeParse({ description: "Hello everyone", images: [], video: null }).success, true);
    assert.equal(PostFormSchema.safeParse({ description: "Hello everyone" }).success, true);
});

test("the description is still required", () => {
    const res = PostFormSchema.safeParse({ description: "", images: [], video: null });
    assert.equal(res.success, false);
    assert.match(JSON.stringify(res.error?.issues), /Post Description is required/);
});

test("more than 5 pictures is still rejected", () => {
    const res = PostFormSchema.safeParse({ description: "x", images: [1, 2, 3, 4, 5, 6] });
    assert.equal(res.success, false);
});
