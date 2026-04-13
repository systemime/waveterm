// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { assert, test } from "vitest";
import { newLayoutNode } from "../lib/layoutNode";
import { computeMoveNode, moveNode } from "../lib/layoutTree";
import {
    DropDirection,
    FlexDirection,
    LayoutTreeActionType,
    LayoutTreeComputeMoveNodeAction,
    LayoutTreeMoveNodeAction,
} from "../lib/types";
import { newLayoutTreeState } from "./model";

test("layoutTreeStateReducer - compute move", () => {
    const node1 = newLayoutNode(undefined, undefined, undefined, { blockId: "node1" });
    const node2 = newLayoutNode(undefined, undefined, undefined, { blockId: "node2" });
    const treeState = newLayoutTreeState(newLayoutNode(undefined, undefined, [node1, node2]));

    let pendingAction = computeMoveNode(treeState, {
        type: LayoutTreeActionType.ComputeMove,
        nodeId: node2.id,
        nodeToMoveId: node1.id,
        direction: DropDirection.Bottom,
    });

    assert(pendingAction, "moving an existing sibling should produce a pendingAction");
    const insertOperation = pendingAction as LayoutTreeMoveNodeAction;
    assert(insertOperation.node === node1, "insert operation node should equal node1");
    assert(insertOperation.parentId === treeState.rootNode.id, "insert operation parent should be the root");
    assert(insertOperation.index === 2, "insert operation index should equal 2");
    assert(!insertOperation.insertAtRoot, "insert operation insertAtRoot should be false");
    moveNode(treeState, insertOperation);
    assert(
        treeState.rootNode.children?.map((child) => child.data?.blockId).join(",") === "node2,node1",
        "moving node1 below node2 should reorder the root children"
    );

    treeState.rootNode.children![0].flexDirection = FlexDirection.Column;
    treeState.rootNode.children![0].children = [newLayoutNode(undefined, undefined, undefined, { blockId: "node2a" })];
    treeState.rootNode.children![0].data = undefined;

    pendingAction = computeMoveNode(treeState, {
        type: LayoutTreeActionType.ComputeMove,
        nodeId: treeState.rootNode.children![0].id,
        nodeToMoveId: node1.id,
        direction: DropDirection.Bottom,
    });

    assert(pendingAction, "moving an existing node into a container should produce a pendingAction");
    const insertOperation2 = pendingAction as LayoutTreeMoveNodeAction;
    assert(insertOperation2.node === node1, "insert operation node should still equal node1");
    assert(insertOperation2.parentId === treeState.rootNode.children![0].id, "insert operation parent should be node2");
    assert(insertOperation2.index === 1, "insert operation index should equal 1");
    assert(!insertOperation2.insertAtRoot, "insert operation insertAtRoot should be false");
    moveNode(treeState, insertOperation2);
    assert(treeState.rootNode.children!.length === 1, "root should have one child after moving node1 into node2");
    assert(
        treeState.rootNode.children![0].children?.map((child) => child.data?.blockId).join(",") === "node2a,node1",
        "node2 should contain its original child followed by node1"
    );
});

test("computeMove - noop action", () => {
    let nodeToMove = newLayoutNode(undefined, undefined, undefined, { blockId: "nodeToMove" });
    let treeState = newLayoutTreeState(
        newLayoutNode(undefined, undefined, [
            nodeToMove,
            newLayoutNode(undefined, undefined, undefined, { blockId: "otherNode" }),
        ])
    );
    let moveAction: LayoutTreeComputeMoveNodeAction = {
        type: LayoutTreeActionType.ComputeMove,
        nodeId: treeState.rootNode.id,
        nodeToMoveId: nodeToMove.id,
        direction: DropDirection.Left,
    };
    let pendingAction = computeMoveNode(treeState, moveAction);

    assert(pendingAction === undefined, "inserting a node to the left of itself should not produce a pendingAction");

    moveAction = {
        type: LayoutTreeActionType.ComputeMove,
        nodeId: treeState.rootNode.id,
        nodeToMoveId: nodeToMove.id,
        direction: DropDirection.Right,
    };

    pendingAction = computeMoveNode(treeState, moveAction);
    assert(pendingAction === undefined, "inserting a node to the right of itself should not produce a pendingAction");
});
