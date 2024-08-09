import {Builder} from "build-ui";
//import Demo from './builder/templates/demo';
import { useEffect, useState , lazy} from "react";
import demo2 from "./builder/templates/demo2";
//import { StaticRouter } from "react-router-dom/server";
//import * as ReactDOMServer from 'react-dom/server'
import { API, Storage } from "aws-amplify";
import css_parser from './css_parser'

//import Home from '../../home'
//import App from '../../../App'
//
//import puppeteer from 'puppeteer-core'

//import css from 'css' 
//const css = require("css") 




const DemoBuilder = ({
    children,
}) => {
    const [pageResult, setPageResult] = useState()
    const [canvasSet, setCanvasSet] = useState(false)
    //gpt code to mimic the json struct used by build ui
    function htmlToJson(element, alreadyCreated, parentId = null) {
        //console.log(element)
        //console.log(element.attributes)
        if (element.tagName.toLowerCase() == "div" || element.tagName.toLowerCase() == "nav") {
            const jsonNode = {
                id: alreadyCreated ? element.id : generateUniqueId(),
                type: "Section", //alreadyCreated ? "Section" : "Canvas"
                props: {
                    style:  alreadyCreated ?  {
                    } : { "width": "74.9%", "height": "43.5%", "text-align": "center"}, 
                },
                childIds: [],
                parentId: parentId
            };
            
             // Collect attributes and styles
        Array.from(element.attributes).forEach(attr => {
            if (attr.name === 'style') {
                if (alreadyCreated) {
                    if (!jsonNode.props.class) {
                        jsonNode.props.style = {"width": "74.9%", "height": "507px", "top": "328px"};
                    } else if (jsonNode.props.class =="mainBanner") {
                        jsonNode.props.style = {"width":"100%","height":"200px","backgroundColor":"#ffffff","position":"absolute","left":"0px","top":"0px","backgroundUrl":"https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com/static/media/download.18167bdd7767ec7ecad5.png","backgroundPosition":"100%"};
                    } else if (jsonNode.props.class=="specialnavbar") {
                        jsonNode.props.style = {"width": "100%", "height": "187px", "top": "0px", "left":"0px"}
                    } else{
                        jsonNode.props.style = styleToObject(attr.value);
                    }
                   
                } else {
                   
                }
                
            } else {
                jsonNode.props[attr.name] = attr.value;
            }
        });
    
        // Handle text nodes
        if (element.tagName.toLowerCase() === 'p') {
            jsonNode.props.text = element.textContent;
        }
        element.id=jsonNode.id;
    
        // Recursively process child elements
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) { // Element nodes only
                const childNode = htmlToJson(child, false, jsonNode.id);
                jsonNode.childIds.push(childNode.id);
            }
        });
    
        return jsonNode;
        } else if (element.tagName.toLowerCase()=="p" || element.tagName.toLowerCase().includes("h")) {
            const jsonNode = {
                id: alreadyCreated ? element.id : generateUniqueId(),
                type: "Text",
                props: {
                    style: {},
                },
                childIds: [],
                parentId: parentId
            };
             // Collect attributes and styles
        Array.from(element.attributes).forEach(attr => {
            if (attr.name === 'style') {
                if (jsonNode.props.text == "accounts") {
                    jsonNode.props.style =  {"top": "67px", "left": "978px"}
                } else if ( element.tagName.toLowerCase().includes("h")) {
                    jsonNode.props.style =  {"top": "67px", "left": "978px", "font-size":"25px"}
                } else {
                    jsonNode.props.style = styleToObject(attr.value);
                }
               
            } else {
                jsonNode.props[attr.name] = attr.value;
            }
        });
    
        // Handle text nodes
        if (element.tagName.toLowerCase() === 'p' || element.tagName.toLowerCase().includes("h")) {
            jsonNode.props.text = element.textContent;
        }
        element.id=jsonNode.id;
    
        // Recursively process child elements
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) { // Element nodes only
                const childNode = htmlToJson(child, false, jsonNode.id);
                jsonNode.childIds.push(childNode.id);
            }
        });
    
        return jsonNode;
        } else {
            const jsonNode = {
                id:  alreadyCreated ? element.id : generateUniqueId(),
                type: element.tagName == "A" ? "Link" : element.tagName == "BUTTON" ? "Button" : element.tagName == "IMG" ? "Image" : element.tagName == "SECTION" ? "Section" : element.tagName,
                props: {
                    style: {},
                },
                childIds: [],
                parentId: parentId
            };
             // Collect attributes and styles
        Array.from(element.attributes).forEach(attr => {
            if (attr.name === 'style') {
                if(jsonNode.props.src?.includes("static")) {
                    jsonNode.props.style = {"top": "3px", "left":"571px"}
                } else {
                    jsonNode.props.style = styleToObject(attr.value);
                }
                
               
            } else if (attr.name =="src" && attr.value.includes("static")) {
                jsonNode.props[attr.name] = "https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com" + attr.value;
                jsonNode.props.style = {"top": "3px", "left":"571px"}
            } else {
                jsonNode.props[attr.name] = attr.value;
            }
        });
    
        // Handle text nodes
        if (element.tagName.toLowerCase() === 'p' || element.tagName.toLowerCase() === 'button' || element.tagName.toLowerCase() === 'a') {
            jsonNode.props.text = element.textContent;
        }
        element.id=jsonNode.id;
    
        // Recursively process child elements
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) { // Element nodes only
                const childNode = htmlToJson(child, false, jsonNode.id);
                jsonNode.childIds.push(childNode.id);
            }
        });
    
        return jsonNode;
        }
        
       

        
    
       
    }
    
    function styleToObject(styleString) {
        const styles = {};
        styleString.split(';').forEach(style => {
            const [key, value] = style.split(':').map(item => item.trim());
            if (key && value) {
                styles[key] = value;
            }
        });
        return styles;
    }
    
    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Main function to convert HTML to JSON
    function convertHtmlToJson(doc) {
        //const parser = new DOMParser();
        //const doc = parser.parseFromString(htmlString, 'text/html');
        console.log(doc.body.childNodes[1].childNodes[0])
        const rootElement = doc.body.childNodes[1].childNodes[0];
    
        const jsonTree = {
            root: '',
            byIds: {},
            meta: {},
            index: {},
            index_list:{"selected":[]}
        };
    
        const rootNode = htmlToJson(rootElement);
        //setCanvasSet(true)
        jsonTree.root = rootNode.id;
        jsonTree.index["panel"] =  rootNode.id
        jsonTree.meta[rootNode.id] = {"id": rootNode.id}
        jsonTree.byIds[rootNode.id] = rootNode;
    
        function traverse(node) {
            node.childIds.forEach(childId => {
                //console.log(doc.getElementById(childId))
                const childNode = htmlToJson(doc.getElementById(childId), true, node.id);
                jsonTree.meta[childId] = {"id": childId}
                jsonTree.byIds[childId] = childNode;
                traverse(childNode);
            });
        }
    
        traverse(rootNode);
    
        return jsonTree;
    }

    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    async function getHTMLFileFromWebsite() {
        //setS3Config("mamaisonrose-20240718114542-hostingbucket-dev", "static") bg example: https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com/static/media/download.18167bdd7767ec7ecad5.png
        const file ="https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com/index.html" 
        const file2 = "https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com/static/js/main.aec6b021.js"
        const file3 = "https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com/static/css/main.8dcbcb75.css"
        const file4 = "https://dev.d3a8jyligdd6fg.amplifyapp.com/"

         //lazy(() => import("css/parse"));

        API.post("server", "/get-website", {body:{url:file4}}).then((response) => {
            fetch(file3).then((res) => res.text()).then(async(text3) =>  {
                const parsedCSS  = css_parser(text3)
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.dom, 'text/html');

                //const inlinedHtml = await inlineCss(htmlString, { url: '/', extraCss: text3 });
                
                // Iterate over the rules
                parsedCSS.stylesheet.rules.forEach(rule => {
                    if (rule.type === 'rule') {
                        // Get the selectors and declarations
                        const { selectors, declarations } = rule;
                        selectors.forEach(selector => {
                            // Get all elements that match the selector
                            try{
                                const elements = doc.querySelectorAll(selector);
                                elements.forEach(element => {
                                    //console.log("got here")
                                    // Apply each declaration as an inline style
                                    declarations.forEach(declaration => {
                                        element.style[declaration.property] = declaration.value;
                                    });
                                });

                            } catch(e) {
                                console.log(e)
                            }
                            
                        });
                    }
                });

                //console.log(doc)
                const jsonResult = convertHtmlToJson(doc);
                console.log(jsonResult)
                setPageResult(jsonResult)
            })
            
        })

       


        
        /*fetch(file4).then((res) => res.text()).then((text) => {
            console.log(text)
        })*/
          
        
        
    /*fetch(file).then((res) => res.text()).then((text) => {
            console.log(text)
            const parts2 = text.split(`<script defer="defer" src="/static/js/main.aec6b021.js"></script><link href="/static/css/main.8dcbcb75.css" rel="stylesheet">`)
            fetch(file2).then((res) => res.text()).then((text2) => {
               
                    let fullfile = parts2[0] + `<style>`+ text3 + `</style>` + parts2[1]
                    fullfile = fullfile.split("</body>")
                    fullfile = fullfile[0] + `<script>` + text2 + `</script>` + "</body>" + fullfile[1]

                    //const htmlString = ReactDOMServer.renderToString(doc) doc maid of full file
                    /*<StaticRouter location={"/"} context={context}> 
                            <Home />
                        </StaticRouter> 
                    //const parser = new DOMParser();
                    //const doc = parser.parseFromString(fullfile, 'text/html');
                    //console.log(doc.body)
                   
                    const context = {};
                    function App() {
                        return (
                            <html lang="en">
                            <head>
                                <meta charset="utf-8" />
                                
                                <title>Ma Maison Rose</title>
                            </head>
                            <body>
                                <noscript>You need to enable JavaScript to run this app.</noscript>
                                <div id="root"></div>
                                
                            </body>
                            </html>
                            )
                          
                    }
                    async function handler() {
                        const htmlString = await ReactDOMServer.renderToReadableStream(
                            <StaticRouter location={"/"} context={context}> 
                                <App/>
                            </StaticRouter>
                        , {bootstrapScriptContent: text2});
                        return new Response(htmlString, {
                          headers: { 'content-type': 'text/html' },
                        }).text();
                      }
                    
                   
                    handler().then((response) => { //.then((res) => { res.body })
                        console.log(response)
                    })

                    /*fullfile = fullfile.split('<div id="root"></div>')
                    fullfile = fullfile[0] + `<div id="root">${htmlString}</div>` + fullfile[1]

                    const parsedCSS  = css.parse(text3)
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(fullfile, 'text/html');

                    //const inlinedHtml = await inlineCss(htmlString, { url: '/', extraCss: text3 });
                    
                    // Iterate over the rules
                    parsedCSS.stylesheet.rules.forEach(rule => {
                        if (rule.type === 'rule') {
                            // Get the selectors and declarations
                            const { selectors, declarations } = rule;
                            selectors.forEach(selector => {
                                // Get all elements that match the selector
                                try{
                                    const elements = doc.querySelectorAll(selector);
                                    elements.forEach(element => {
                                        //console.log("got here")
                                        // Apply each declaration as an inline style
                                        declarations.forEach(declaration => {
                                            element.style[declaration.property] = declaration.value;
                                        });
                                    });

                                } catch(e) {
                                    console.log(e)
                                }
                                
                            });
                        }
                    });

                    console.log(doc)*/
                
                    
                    //fullfile.replace('<div id="root"></div>', `<div id="root">${htmlString}</div>`);
                    //console.log(fullfile)
                    /*const parser = new DOMParser();
                    const doc = parser.parseFromString(fullfile, 'text/html');
                    console.log(doc)
                    //const jsonResult = convertHtmlToJson(doc); 
                    //console.log(jsonResult)
                    //setPageResult(jsonResult)
                })
            })
            //const jsonResult = convertHtmlToJson(text);
            //setPageResult(jsonResult)
            //console.log(JSON.stringify(jsonResult, null, 2))

        })*/
            
        

    }
    
    

    useEffect(()=> {
        // Example usage
        /*const htmlString = '<div style="width: 100%; height: 100%;"><p style="color: red;">Hello World</p></div>';
        const jsonResult = convertHtmlToJson(htmlString);
        setPageResult(jsonResult)
        console.log(JSON.stringify(jsonResult, null, 2));*/
        //getHTMLFileFromWebsite()
        console.log(demo2)

    }, [setPageResult, setCanvasSet])
       
    return (  demo2 ? <Builder
        initialTree = {demo2}
        initialHistoryLimit = {9999}
        initialBatchTime = {3000}
        initialBatchTimeLimit = {6000}
    >
        {children}
    </Builder> : (<div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                    </div>) )
}

export default DemoBuilder;