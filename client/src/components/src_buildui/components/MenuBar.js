import {useState, useEffect, useRef} from "react";
import {useBuilder} from "build-ui";
import {unstable_batchedUpdates as batch} from "react-dom";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import useExporter from "../hooks/useExporter";
import useStyle from "./style/MenuBar";
import {API} from 'aws-amplify'

const MenuBar = ({
    className,
    ...props
}) => {
    const builder = useBuilder();
    const exporter = useExporter();

    const saver = useRef();
    const exporterHTML = useRef();
    const exporterCSS = useRef();

    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [saveLink, setSaveLink] = useState(null);
    const [htmlLink, setHTMLLink] = useState(null);
    const [cssLink, setCSSLink] = useState(null);

    const [file, setFile] = useState(null);

    // console.log(builder.history);
    const {
        handleRedo,
        handleUndo,
        json,
        loadTree,
        canRedo,
        canUndo,
    } = builder;

    const handleSave = () => {
        const file ="https://mamaisonrose-20240718114542-hostingbucket-dev.s3.ca-central-1.amazonaws.com/index.html" 
        //var id = "id" + Math.random().toString(16).slice(2)
        let generatedJS = "";
        let fullfile = []
        const content = json();
        console.log(content.byIds["_tqqb2e7w5"].props.text)
        fetch(file).then((res) => res.text()).then((text) => {
            if (content.byIds["_pz3cuk8fa"].props.text !== "Mercredi : 11 à 17h") {
                generatedJS += ` document.getElementById("ouverture-1").innerHTML = "${content.byIds["_pz3cuk8fa"].props.text}";`
            }
            if (content.byIds["_2k3ador0g"].props.text !== "Jeudi : 11 à 17h") {
                generatedJS += ` document.getElementById("ouverture-2").innerHTML = "${content.byIds["_2k3ador0g"].props.text}";`
            }
            if (content.byIds["_hvjs9f0f2"].props.text !== "Vendredi : 11 à 17h") {
                generatedJS += ` document.getElementById("ouverture-3").innerHTML = "${content.byIds["_hvjs9f0f2"].props.text}";`
            }
            if (content.byIds["_tqqb2e7w5"].props.text !== "Samedi : 10 à 17h") {
                generatedJS += ` document.getElementById("ouverture-4").innerHTML = "${content.byIds["_tqqb2e7w5"].props.text}";`
            }
            if (content.byIds["_d4nuoyd22"].props.text !== "Dimanche : 10 à 17h") {
                generatedJS += ` document.getElementById("ouverture-5").innerHTML = "${content.byIds["_d4nuoyd22"].props.text}";`
            }
            if (content.byIds["_cswt4ivfg"].props.text !== "3849 Chemin de Tilly Saint-Antoine-de-Tilly QC , G0S 2C0 418-609-2475") {
                generatedJS += ` document.getElementById("address").innerHTML = "${content.byIds["_cswt4ivfg"].props.text}";`
            }
            if (content.byIds["_f76sdpdvu"].props.text !== "Ma Maison Rose") {
                generatedJS += ` document.getElementById("title2").innerHTML = "${content.byIds["_f76sdpdvu"].props.text}";`
            }

            if (text.includes("<script>")) { // already have some js 
                fullfile = text.split("<script>")
                let already_generated_js = fullfile[1].split("</script>")
                already_generated_js[0] = already_generated_js[0].toString().slice(0, -2) // open the function
                already_generated_js[0] += generatedJS + "})"
                fullfile = fullfile[0] + `<script>${already_generated_js[0]}</script>` + already_generated_js[1] 
                console.log(fullfile)
                console.log("got script")
                API.post('server', "/updateWebsite", {body: {html:fullfile, bucketName: "mamaisonrose-20240718114542-hostingbucket-dev", distributionId: "E2ZZU63TAQDMZ9"}} ).then((response) => {
                    console.log(response)
                    alert("Updated Website!")
                })
            } else { // no script file
                fullfile = text.split("</body>")
                fullfile = fullfile[0] + `<script>  window.addEventListener('load', function () {` + generatedJS + `})</script>` + "</body>" + fullfile[1]
                console.log(fullfile)
                API.post('server', "/updateWebsite", {body: {html:fullfile, bucketName: "mamaisonrose-20240718114542-hostingbucket-dev", distributionId: "E2ZZU63TAQDMZ9"}} ).then((response) => {
                    console.log(response)
                    alert("Updated Website!")
                })
            }
            
           
        })

        //send it to ipfs with the id of the new created user, then redirect it to the seller's page
        //const file = new Blob([content], {type: 'application/json'});
        //const link = URL.createObjectURL(file);
        //setSaveLink(link);
        //setSaving(true);
        //window.location.replace("/seller/" + id)
    }

    const handleLoad = event => {
        const file = event.target.files[0];
        event.target.value = null;
        if (!file) return;
        // Must manage with effect
        // since reading file
        // will be done async.
        setFile(file);        
    }

    const handleExport = () => {
        exporter.handleExport();
        setExporting(true);
    }

    useEffect(() => {
        if (!saving) return;
        saver.current.click();
        URL.revokeObjectURL(saveLink);
        setSaving(false);
    }, [saving, saveLink]);

    useEffect(() => {
        if (!file) return;
        const content = file.text();
        content.then(text => JSON.parse(text))
        .then(tree => batch(() => {
            loadTree(tree);
            setFile(null);
        })).catch();
    });
    /**
     * mapping important variables
     *  
     * id: '_pz3cuk8fa', text: 'Mercredi : 11 à 17h' ouverture-1
     * _2k3ador0g: Jeudi : 11 à 17h ouverture-2
     * _hvjs9f0f2: Vendredi : 11 à 17h ouverture-3
     * id: '_tqqb2e7w5', text: 'Samedi : 10 à 17h ouverture-4
     * id: '_d4nuoyd22', text: 'Dimanche : 10 à 17h' ouverture-5
     * id: '_cswt4ivfg', text: '3849 Chemin de Tilly Saint-Antoine-de-Tilly QC , G0S 2C0 418-609-2475'}
     * id: '_f76sdpdvu', text: 'Ma Maison Rose'
     * 
     * when exporting 1: create a js script to update the texts and push it to the html string
     * upload the new index.html to s3
     * example: document.getElementById("ouverture-1").innerHTML = ""
     *  <script>
        window.addEventListener('load', function () {
          document.getElementById("ouverture-1").innerHTML="test";
        })
       
        
      </script>

     */

    const css = exporter.css;
    const html = exporter.html;
    useEffect(() => {
        if (!exporting) return;
        if (css) {
            const file = new Blob([css], {type: 'text/css'});
            const link = URL.createObjectURL(file);
            setCSSLink(link);
            setExporting(false);
        }
        if (html) {
            const formatHTML = (html, css) => (
                '<html>' +
                '<head> <style>' + css + '</style></head>' +
                '<body>' + html + '</body>' +
                '</html>'
            );
            const formattedHTML = formatHTML(html, css);
            const file = new Blob([formattedHTML], {type: 'text/html'});
            const link = URL.createObjectURL(file);
            setHTMLLink(link);
            setExporting(false);
        }
    }, [
        html, 
        css, 
        exporting,
    ]);

    useEffect(() => {
        if (!htmlLink) return;
        exporterHTML.current.click();
        URL.revokeObjectURL(htmlLink);
        setHTMLLink(null);
    }, [htmlLink]);

    useEffect(() => {
        if (!cssLink) return;
        exporterCSS.current.click();
        URL.revokeObjectURL(cssLink);
        setCSSLink(null);
    }, [cssLink]);


    const classes = useStyle();
    const classAll = clsx(
        className,
        classes.menu
    );
    return <div 
        {...props}
        className = {classAll}
    >

        <Button
            color = 'primary'
            variant = 'outlined'
            className = {clsx(classes.action, classes.button)}
            onClick = {handleRedo}
            disabled = {!canRedo}
        >
            Redo
        </Button>

        <Button
            color = 'primary'
            variant = 'outlined'
            className = {clsx(classes.action, classes.button)}
            onClick = {handleUndo}
            disabled = {!canUndo}
        >
            Undo
        </Button>

        <Button 
            color = 'primary'
            variant = 'outlined'
            onClick = {handleSave}
            className = {clsx(classes.action, classes.button)}
        >
            Save 
        </Button>
        <a
            hidden = {true}
            download = {true}
            href = {saveLink}
            ref = {saver}
        />

        <Button 
            component = 'label'
            color = 'primary'
            variant = 'outlined'
            className = {clsx(classes.action, classes.button)}
        >
            Load
            <input
                hidden = {true}
                type = 'file'
                name = 'load_tree'
                onInput = {handleLoad}
            />
        </Button>

        <Button 
            color = 'primary'
            variant = 'outlined'
            onClick = {handleExport}
            className = {clsx(classes.action, classes.button)}
        >
            Export
        </Button>
        <a
            hidden = {true}
            download = {true}
            href = {htmlLink}
            ref = {exporterHTML}
        />
        <a
            hidden = {true}
            download = {true}
            href = {cssLink}
            ref = {exporterCSS}
        />

    </div>
}

export default MenuBar;