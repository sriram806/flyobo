import React from 'react'
import RevenueSystem from './RevenueSystem'
import PlatformServices from './PlatformServices'

const DashboardOverview = () => {
    return (
        <div>
            <PlatformServices />
            <RevenueSystem />
        </div>
    )
}

export default DashboardOverview
