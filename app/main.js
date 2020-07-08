const {app, BrowserWindow,dialog,Menu}=require("electron");
//const export=require("export")
const fs=require("fs");
var mainWindow;
app.on('ready',() =>{
    console.log("Ready");
    mainWindow=new BrowserWindow({show:false});
    Menu.setApplicationMenu(appmenu);
    mainWindow.loadFile('app/index.html');
    mainWindow.on('ready-to-show',()=>{
        mainWindow.show();
        //getfiles();
    })
});
exports.getfiles= ()=>{
    const files=dialog.showOpenDialog({
        properties:['openFile'],
        filters:[{name:'Text files',extensions:['txt']}]
    })
    if(!files)
        return;
    const file=files[0];
    console.log(file);
    openfile(file);

};
exports.saveMarkdown=(file,content)=>{
    if(!file){
        file=dialog.showSaveDialog({
            title:'Save Markdown as',
            defaultPath:app.getPath('desktop'),
            filters:[{
                name:'Markdown files',extensions:['md','markdown','mdown'],

            }]
        
        
        })
    }
    if(!file)
        return;
    fs.writeFileSync(file,content);
    openfile(file);
};
const openfile= (exports.openfile=(file)=>{

    const content =fs.readFileSync(file).toString();
    mainWindow.webContents.send("file-opened",file , content);
    app.addRecentDocument(file);

});
console.log("Starting up...");
exports.saveHTML=(content)=>{
    console.log("Saving file...");
    console.log(content);
    
    var htmlfile=dialog.showSaveDialog({
        title:'Save as HTML',
        defaultPath:app.getPath('documents'),
        filters:[{
            name:'HTML file', extensions:['html']
        }]
    });
    if(!htmlfile)
        return;
    try{
        fs.writeFileSync(htmlfile,content);
    }
    catch(err){
        console.log(err.message);
        
    }

};
const template=[
    {
        label:'File',
        submenu:[{
            label:'Open File',
            accelerator:'CommandOrControl+O',
            click(){
                console.log("Open file");
                exports.getfiles();
                
            },

        },
        {
            label:'Save File',
            accelerator:'CommandOrControl+S',
            click(){
                mainWindow.webContents.send('save');
            }

        },
        {
            label:'Save as HTML',
            accelerator:'CommandOrControl+shift+S',
            click(){
                mainWindow.webContents.send('save-HTML');
            }
        }
           
        ]
    },
    {
        label:'Edit',
        submenu:[ {
            label:'About',
            role:'about'
        },
        {
            label:'Copy',
            role:'copy'
        }]
    }
   
];
if(process.platform==='darwin'){
    const appname='Markdown Editor';
    template.unshift({
        label:appname,
        submenu:[
            {
                label:`About ${appname}`,
            },
            {
                label:'Quit',
            }
        ]
    });
}
const appmenu=Menu.buildFromTemplate(template);
