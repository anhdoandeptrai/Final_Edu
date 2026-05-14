'use client'

import { memo } from 'react'
import BehaviorHistoryPanel from '../BehaviorHistoryPanel'

interface Props {
    maxEntries?: number
}

function AIBehaviorPanel({ maxEntries = 15 }: Props) {
    return <BehaviorHistoryPanel maxEntries={maxEntries} showClearButton={true} />
}

export default memo(AIBehaviorPanel)
