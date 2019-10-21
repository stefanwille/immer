"use strict"

import {measure} from "./measure"
import produce, {setAutoFreeze, setUseProxies} from "../dist/immer.umd.js"
import {cloneDeep} from "lodash"
import {fromJS} from "immutable"
import Seamless from "seamless-immutable"
import deepFreeze from "deep-freeze"

console.log("\n# add-data - loading large set of data\n")

const dataSet = require("./data.json")
const baseState = {
    data: null
}
const frozenBazeState = deepFreeze(cloneDeep(baseState))
const immutableJsBaseState = fromJS(baseState)
const seamlessBaseState = Seamless.from(baseState)

measure(
    "just mutate",
    () => ({draft: cloneDeep(baseState)}),
    ({draft}) => {
        draft.data = dataSet
    }
)

measure(
    "just mutate, freeze",
    () => ({draft: cloneDeep(baseState)}),
    ({draft}) => {
        draft.data = dataSet
        deepFreeze(draft)
    }
)

measure("handcrafted reducer (no freeze)", () => {
    const nextState = {
        ...baseState,
        data: dataSet
    }
})

measure("handcrafted reducer (with freeze)", () => {
    const nextState = deepFreeze({
        ...baseState,
        data: dataSet
    })
})

measure("immutableJS", () => {
    let state = immutableJsBaseState.withMutations(state => {
        state.setIn(["data"], fromJS(dataSet))
    })
})

measure("immutableJS + toJS", () => {
    let state = immutableJsBaseState
        .withMutations(state => {
            state.setIn(["data"], fromJS(dataSet))
        })
        .toJS()
})

measure("seamless-immutable", () => {
    seamlessBaseState.set("data", dataSet)
})

measure("seamless-immutable + asMutable", () => {
    seamlessBaseState.set("data", dataSet).asMutable({deep: true})
})

measure("immer (proxy) - without autofreeze", () => {
    setUseProxies(true)
    setAutoFreeze(false)
    produce(baseState, draft => {
        draft.data = dataSet
    })
})

measure("immer (proxy) - with autofreeze", () => {
    setUseProxies(true)
    setAutoFreeze(true)
    produce(frozenBazeState, draft => {
        draft.data = dataSet
    })
})

measure("immer (es5) - without autofreeze", () => {
    setUseProxies(false)
    setAutoFreeze(false)
    produce(baseState, draft => {
        draft.data = dataSet
    })
})

measure("immer (es5) - with autofreeze", () => {
    setUseProxies(false)
    setAutoFreeze(true)
    produce(frozenBazeState, draft => {
        draft.data = dataSet
    })
})
