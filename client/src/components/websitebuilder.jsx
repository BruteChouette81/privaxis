//website builder components
import {DnDBuilder, useEditor, Builder, useBuilder, Workspace, useTools, item, branch} from 'build-ui';
import cardIcon from "./css/1781500.png"
import "./css/websitebuilder.css"

//https://luismps.github.io/build-ui/

//component for website builder
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

const PayWcplView = ({id, ...props}) => {
    const editor = useEditor({ id: id});
    return (<DnDBuilder onDrop = {editor.handleDrop} onDragEnd = {editor.handleDragEnd} draggable = {true}>
        <PayWcpl {...props} />
    </DnDBuilder>)
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
    const handleDragTool = () => {
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
    const section = item({ type: 'Section', props: {}, });
    const tree = branch(section);
    const view = {
        Section: SectionView,
        Alert: AlertView,
        Pay: PayWcplView
    }
    
    return(
        <div><h1>website builder</h1>
        <Builder initialTree = {tree}>
            <TopBar/>
            <Workspace view = {view} />
            <ComponentTools />
            <CplTools />
        </Builder></div>
    )
}

export default WebsiteBuilder;