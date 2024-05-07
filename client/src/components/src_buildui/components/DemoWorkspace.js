import React, { Suspense } from "react"
import {Workspace} from "build-ui"
import CanvasView from "./builder/ui/canvas/CanvasView"
import SectionView from "./builder/ui/section/SectionView"
import TextView from "./builder/ui/text/TextView"
import ImageView from "./builder/ui/image/ImageView"
import ButtonView from "./builder/ui/button/ButtonView"
import GridView from "./builder/ui/grid/GridView"
import BuilderSelector from "./BuilderSelector"

const Loader = () => {
    return (
        <div>
            <h3>Loader</h3>
        </div>
    )
}

const DemoWorkspace = props => {
    const view = {
        Canvas: CanvasView,
        Section: SectionView,
        Text: TextView,
        Image: ImageView,
        Button: ButtonView,
        Grid: GridView,
        Alert: React.lazy(() => import('./builder/ui/alert/AlertView')),
        Link: React.lazy(() => import('./builder/ui/link/LinkView')),
    }
    // Render BuilderSelector,  
    // in charge of adding event
    // listeners to document
    // to deselect views whenever
    // screen is clicked on and 
    // click is not a select operation.
    return (<Suspense fallback={<Loader />}><React.Fragment {...props}>
        <Workspace view = {view} />
        <BuilderSelector />
    </React.Fragment> </Suspense>)
}

export default DemoWorkspace;