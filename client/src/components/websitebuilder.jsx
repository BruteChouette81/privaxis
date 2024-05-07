//website builder components
import { useState, useEffect } from 'react';
import {DnDBuilder, useEditor, Builder, useBuilder, Workspace, useTools, item, branch} from 'build-ui';
import {useActions, useMultiCollector, DnDListener} from "build-ui";
import DemoBuilder from "./src_buildui/components/DemoBuilder";
import BuilderGrid from "./src_buildui/components/layout/BuilderGrid";
import cardIcon from "./css/1781500.png"
import "./css/websitebuilder.css"
import menu from './css/menu.png'


//https://luismps.github.io/build-ui/

const BuilderSelector = () => {
    const actions = useActions();
    const triggerListIndexClear = (
        actions.unrecorded.triggerListIndexClear
    );
    const selector = selectors => (
        selectors.selectMultipleByIndex('selected')
    );
    const collected = useMultiCollector({
        selector: selector,
    });
    const hasSelected = (
        collected.listNodes().length > 0
    );
    useEffect(() => {
        if (!hasSelected) return;
        const handleDeselect = () => {
            triggerListIndexClear({
                name: 'selected'
            });
        }
        document.addEventListener(
            'click',
            handleDeselect
        );
        return () => {
            document.removeEventListener(
                'click',
                handleDeselect
            );
        }
    }, [
        hasSelected,
        triggerListIndexClear,
    ]);
    return null;
}

//create layers and add them to side bar
const DnDLayers = props => {
    return <DnDListener
        {...props}
        listenTransferType = 'layers'
    />
}

function WebsiteBuilder() {
    const [aBgColor, setABgColor] = useState("#1383EC")


    let bgColor = "";

    const colorChange = (event) => {
        bgColor = event.target.value
    }

    const actualizeBg = () => {
        console.log(bgColor)
        setABgColor(bgColor)
       
    }

    //component for website builder

    //main page

    const Text = ({message, font, ...rest}) => {
        return ( <p style={{ "font": font+"pt"}}>{message}</p> )
    }
    const Alert = ({message, text, ...rest}) => {
        const handleAlert = () => {
            alert(message);
        }
        return (<button onClick = {handleAlert} {...rest}> {text} </button>)
    }

    const Button = ({link, text, ...rest}) => {
        const handleButton = () => {
            window.location.replace(link)
        }
        return (<button onClick = {handleButton} {...rest}> {text} </button>)
    }

    //commerce

    const ItemGrid = ({}) => {
        return(
            <div class="itemgrid">
                <p>item grid</p>
            </div>
        )
    }

    const PayWcpl = ({message, text, ...rest}) => {
        const handleAlert = () => {
            alert(message);
        }
        return ( <button type="button" class="btn btn-default" id="ppbuy" ><img src={cardIcon} id="lock-img" />CPL secure payment</button>)
    }

    //sections
    const Navbar = ({items, links}) => {
        return(
            <nav class="navbar navbar-expand-lg navbar-light" style={{"background-color": "white"}}>
      <div class="container-fluid">
        <a className="navbar-brand" href="/">
          your website name
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <img src={menu} alt="" width="30" height="24" />
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href={links[0]}>{items[0]}</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
        )
    } 

    const Section = ({...rest}) => {
        return <div style = {{ width: 90+"%", height: 600, backgroundColor: aBgColor }} {...rest} />
    }

    //editor
    //
    const TextView = ({id, ...props }) => {
        const editor = useEditor({ id: id });
        return (<DnDBuilder onDragStart = {editor.handleDragStart} onDragEnd = {editor.handleDragEnd} draggable = {true}>
            <Text {...props} />
        </DnDBuilder>)
    }
    const AlertView = ({id, ...props }) => {
        const editor = useEditor({ id: id });
        return (<DnDBuilder onDragStart = {editor.handleDragStart} onDragEnd = {editor.handleDragEnd} draggable = {true}>
            <Alert {...props} />
        </DnDBuilder>)
    }
    const ButtonView = ({id, ...props }) => {
        const editor = useEditor({ id: id });
        return (<DnDBuilder onDragStart = {editor.handleDragStart} onDragEnd = {editor.handleDragEnd} draggable = {true}>
            <Button {...props} />
        </DnDBuilder>)
    }

    const SectionView = ({id, ...props}) => {
        const editor = useEditor({ id: id});
        return (<DnDBuilder onDrop = {editor.handleDrop}>
            <Section {...props} />
        </DnDBuilder>)
    }

    const NavView = ({id, ...props }) => {
        const editor = useEditor({ id: id });
        return (<DnDBuilder onDragStart = {editor.handleDragStart} onDragEnd = {editor.handleDragEnd} draggable = {true}>
            <Navbar {...props} />
        </DnDBuilder>)
    }

    const PayWcplView = ({id, ...props}) => {
        const editor = useEditor({ id: id});
        return (<DnDBuilder onDrop = {editor.handleDrop} onDragEnd = {editor.handleDragEnd} draggable = {true}>
            <PayWcpl {...props} />
        </DnDBuilder>)
    }

    const GridView = ({id, ...props }) => {
        const editor = useEditor({ id: id });
        return (<DnDBuilder onDragStart = {editor.handleDragStart} onDragEnd = {editor.handleDragEnd} draggable = {true}>
            <ItemGrid {...props} />
        </DnDBuilder>)
    }

    //users tools

    const AlertTools = () => {
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

    const TextTools = () => {
        const tools = useTools();
        const handleDragTool = () => {
            const textProps = {
                message: 'this is a text',
                font: 14,
            }
            const text = item({
                type: 'Text',
                props: textProps
            });
            const data = branch(text);
            tools.triggerDragStart({
                data: data,
            });
        }

        return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
            Text
        </DnDBuilder>
    }

    const ButtonTools = () => {
        const tools = useTools();
        const handleDragTool = () => {
            const btnProps = {
                text: 'link',
                link: '/websitebuilder',
            }
            const button = item({
                type: 'Button',
                props: btnProps
            });
            const data = branch(button);
            tools.triggerDragStart({
                data: data,
            });
        }

        return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
            Button
        </DnDBuilder>
    }

    const CplTools = () => {
        const tools = useTools();
        const handleDragTool = () => {
            const cplProps = {
               
            }
            const cplPay = item({
                type: 'Pay',
                props: cplProps
            });
            const data = branch(cplPay);
            tools.triggerDragStart({
                data: data,
            });
        }

        return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
            Pay With CPL
        </DnDBuilder>
    }

    const GridviewTools = () => {
        const tools = useTools();
        const handleDragTool = () => {
            const gridProps = {
            }
            const grid = item({
                type: 'Grid',
                props: gridProps
            });
            const data = branch(grid);
            tools.triggerDragStart({
                data: data,
            });
        }

        return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
            Item Grid
        </DnDBuilder>
    }

    const NavTools = () => {
        const tools = useTools();
        const handleDragTool = () => {
            const navProps = {
                items: ["home"],
                links: ["/"]
            }
            const nav = item({
                type: 'Navbar',
                props: navProps
            });
            const data = branch(nav);
            tools.triggerDragStart({
                data: data,
            });
        }

        return <DnDBuilder onDragStart = {handleDragTool} onDragEnd = {tools.handleDragEnd} draggable = {true} as = 'button'>
           Navbar
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

    function WebsiteName() {
        const [websiteName, setWebsiteName] = useState("My Website")


        let newName = ""

        const setNewName = (event) => {
            newName = event.target.value
        }

        const updateWebsiteName = () => {
            setWebsiteName(newName)
        }


        return (
            
            <div class="websiteName">
                <h2>{websiteName}</h2>
                <input type="text" onChange={setNewName} />
                <button onClick={updateWebsiteName}>update</button>

            </div>
        )
    }

    function BuilderView () {
        let section = item({ type: 'Section', props: {}, });
        let tree = branch(section);
        const view = {
            Section: SectionView,
            Navbar: NavView,
            Text: TextView,
            Button: ButtonView,
            Alert: AlertView,
            Pay: PayWcplView,
            Grid: GridView
        }
        /** <Builder initialTree = {tree}>
                <TopBar/>
                <Workspace view = {view} />
                <BuilderSelector/>
                <div class="tools">
                    <h4>Wesite tools</h4>
                    <NavTools />
                    <ButtonTools/>
                    <TextTools/>
                    <AlertTools />
                    <label htmlFor="backgroundcolor">Background color:</label>
                    <input type="color" id="backgroundcolor" onChange={colorChange} name="backgroundcolor" value={aBgColor}/>
                    <button onClick={actualizeBg}>update bg</button>
                    <br />
                    <h4>Commerce tools</h4>
                    <CplTools />
                    <GridviewTools/>
                    <br />
                    
                </div>
            </Builder> */
        return(
            <div><h1>website builder</h1>
            <WebsiteName/>
            <DemoBuilder>
                <BuilderGrid />
            </DemoBuilder>
           </div>
        )
    }

    return (
        <BuilderView />
    )
    
    
}

export default WebsiteBuilder;