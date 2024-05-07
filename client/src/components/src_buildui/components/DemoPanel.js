import {Panel} from "build-ui";
import {CanvasPanel} from "./builder/ui/canvas";
import React, { Suspense } from 'react'

const Loader = () => {
    return (
        <div>
            <h3>Loader</h3>
        </div>
    )
}

const DemoPanel = props => {
    const view = {
        Canvas: CanvasPanel,
        Text: React.lazy(() => import('./builder/ui/text/TextPanel')),
        Section: React.lazy(() => import('./builder/ui/section/SectionPanel')),
        Image: React.lazy(() => import('./builder/ui/image/ImagePanel')),
        Alert: React.lazy(() => import('./builder/ui/alert/AlertPanel')), 
        Button: React.lazy(() => import('./builder/ui/button/ButtonPanel')),
        Link: React.lazy(() => import('./builder/ui/link/LinkPanel')),
        Grid: React.lazy(() => import('./builder/ui/grid/GridPanel')),
    }; 
    return (<Suspense fallback={<Loader />}><Panel
        view = {view} 
        {...props} 
    /></Suspense>)
}

export default DemoPanel;