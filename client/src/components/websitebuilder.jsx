//website builder components
import {DnDBuilder, useEditor, Builder, useBuilder, Workspace, useTools, item, branch, Panel} from 'build-ui';
import cardIcon from "./css/1781500.png"
import "./css/websitebuilder.css"

//https://luismps.github.io/build-ui/


// 1: ask client if building what type of e-commerce (b2b, client, multiple pages)
// 2: infrom them of our expert look ==> transfer website
// 3: bring them to the builder with their categories
// 4: build each pages step-by-step with logo import and expert look button (send a message or call)
// 5: create a client account and access to their dashboard ==> always link to expert, add-ons and more
// 6: start hosting and managing their stuff

//component for website builder: image, text, link/button with link, section // ecom section: items, look of items and payment process
const Alert = ({message, text, ...rest}) => {
    const handleAlert = () => {
        alert(message);
    }
    return (<button onClick = {handleAlert} {...rest}> {text} </button>)
}

const PayWcpl = ({message, text, ...rest}) => {
    const handleAlert = () => {
        alert(message);
    }
    return ( <button type="button" class="btn btn-default" id="ppbuy" ><img src={cardIcon} id="lock-img" />CPL secure payment</button>)
}

const Section = (props) => {
    return <div style = {{ width: 90+"%", height: 800, backgroundColor: 'aqua', display: "" }} {...props} />
}

const Canvas = (props) => {
    return <div style = {{ width: 90+"%", height: 800, backgroundColor: 'aqua' }} {...props} />
}

//editor
const AlertView = ({id, ...props }) => {
    const editor = useEditor({ id: id });
    return (<DnDBuilder onDragStart = {editor.handleDragStart} onDragEnd = {editor.handleDragEnd} draggable = {true}>
        <Alert {...props} />
    </DnDBuilder>)
}

const SectionView = ({id, ...props}) => {
    const editor = useEditor({ id: id});
    return (<DnDBuilder onDrop = {editor.handleDrop}>
        <Section {...props} />
    </DnDBuilder>)
}

const CanvasView = ({id, ...props}) => {
    const editor = useEditor({ id: id});
    return (<DnDBuilder  onDrop = {editor.handlePositionedDrop}
        onDragEnter = {editor.handlePaintDropZone}
        onDragLeave = {editor.handleEraseDropZone}
        // Other Props
        onClick = {editor.handleSelect}>
        <Canvas {...props} />
    </DnDBuilder>)
}

const PayWcplView = ({id, ...props}) => {
    const editor = useEditor({ id: id});
    return (<DnDBuilder onClick = {editor.handlePanel} onDrop = {editor.handleDrop} onDragEnd = {editor.handleDragEnd} draggable = {true}>
        <PayWcpl {...props} />
    </DnDBuilder>)
}


// panel

const PayWcplPanel = ({ id, }) => {
    const editor = useEditor({
        id: id
    });
    return <div>
        <input
            name = 'pay with cpl'
            value = {editor.props.counterText}
            onChange = {editor.handleUpdate}
        />
    </div>
}

//users tools

const ComponentTools = () => {
    const tools = useTools();
    const handleDragTool = () => {
        const alertProps = {
            message: 'How is it going, folk?',
            text: 'Greet me',
        }
        const alert = item({
            type: 'Alert',
            props: alertProps
        });
        const data = branch(alert);
        tools.triggerDragStart({
            data: data,
        });
    }

    return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
        Alert
    </DnDBuilder>
}

const CplTools = () => {
    const tools = useTools();
    const handleDragTool = (event) => {
        event.stopPropagation();
        const alertProps = {
            message: 'paying with cpl',
            text: 'cpl payment',
        }
        const alert = item({
            type: 'Pay',
            props: alertProps
        });
        const data = branch(alert);
        tools.triggerDragStart({
            data: data,
        });
    }

    return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
        Pay With CPL
    </DnDBuilder>
}

// top bar
const TopBar = () => {
    const builder = useBuilder();
    const {
        canUndo,
        canRedo,
        handleRedo,
        handleUndo,
        json,
        // Replot your workspace
        // with another tree with this 
        // loading function below.
        loadTree
    } = builder;
    const handleSave = () => {
        // Maybe let save your work 
        // to a storage service? 
        // Or a database? A file...?
        console.log(json());
    }
    return <div>
        <button onClick = {handleSave}>
            Save
        </button>
        <button 
            disabled = {!canRedo}
            onClick = {handleRedo}
        >
            Redo
        </button>
        <button 
            disabled = {!canUndo}
            onClick = {handleUndo}
        >
            Undo
        </button>
    </div>
}


function WebsiteBuilder() {
    const canvas = item({type:'Canvas', props:{}, })
    const section = item({ type: 'Section', props: {}, });
    
    const tree = branch(section); //
    const view = {
        Canvas: CanvasView,
        Section: SectionView,
        Alert: AlertView,
        Pay: PayWcplView
    }
    const panel = { Pay: PayWcplPanel, };
    
    return(
        <div><h1>website builder</h1>
        <Builder initialTree = {tree}>
            <TopBar/>
            <Workspace view = {view} />
            <ComponentTools />
            
            <CplTools />

            <Panel view={panel}/>
        </Builder></div>
    )
}

export default WebsiteBuilder;