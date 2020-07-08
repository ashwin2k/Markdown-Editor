const marked = require('marked');
const {remote,ipcRenderer, shell}=require('electron');
const path=require('path');
var markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

let filePath=null;
let originalcontent='';
//let isEdited=false;
saveHtmlButton.disabled=false;
var mainprocess=remote.require('./main.js');
const currentWindow=remote.getCurrentWindow();
const updateUI=(isEdited)=>{
  let title=' - Markdown Editor';
  if(filePath){
    title=`${path.basename(filePath)} - ${title}`;
  }
  if(isEdited){
    title=title+'*';
    
  }
  saveMarkdownButton.disabled=!isEdited;

  currentWindow.setTitle(title);
 console.log({isEdited});  
  
};
const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });  
};
openFileButton.addEventListener("click",()=>{
      console.log("clicked");
      
      mainprocess.getfiles();
});
markdownView.addEventListener('keyup', event => {
  var currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);

  
  
  updateUI(currentContent!==originalcontent);

   
});
const saveMarkdwon=()=>{
  console.log("Saving file...");
  mainprocess.saveMarkdown(filePath,markdownView.value);

};
saveMarkdownButton.addEventListener('click',saveMarkdwon);

updateUI();
ipcRenderer.on('save',saveMarkdwon);
ipcRenderer.on('file-opened',(event,file,content)=>{
  filePath=file;
  originalcontent=content;
  updateUI();
  console.log(content);
  markdownView.value=content;
  showFileButton.disabled=!file;
  openInDefaultButton.disabled=!file;

  renderMarkdownToHtml(content);

});
const saveHTML=()=>{
	console.log("Save file initiated...");
	console.log(typeof(markdownView));
	var obj=new Object();
  obj.ds="sss";
  console.log(markdownView.innerHTML);
  
	mainprocess.saveHTML(htmlView.innerHTML);
  
};
saveHtmlButton.addEventListener('click',saveHTML);
ipcRenderer.on('save-HTML',saveHTML);
document.addEventListener('dragstart',event=>{
	event.preventDefault();
});
document.addEventListener('dragover',event=>{
	event.preventDefault();
});
document.addEventListener('drop',event=>{
	event.preventDefault();
});

document.addEventListener('dragleave',event=>{
	event.preventDefault();
});
const getDraggedFile= (event)=>{
  return event.dataTransfer.items[0];
};
const getDroppedFile=(event)=>{
  return event.dataTransfer.files[0];
};
const ifFileTypeSupported= (file)=>{
    return ['text/plain','text/markdown'].includes(file.type);
};
markdownView.addEventListener('dragover',(event)=>{
  const file=getDraggedFile(event);
  console.log(file);
  
  if(ifFileTypeSupported(file)){
    markdownView.classList.add('drag-over');

  }
  else{
    markdownView.classList.add('drag-error');
  }
});
markdownView.addEventListener("dragleave",()=>{
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');

})
markdownView.addEventListener('drop',(event)=>{
  const file=getDroppedFile(event);
  if(ifFileTypeSupported(file)){
    //console.log(file);
    mainprocess.openfile(file.path);
    

  }
  else{
    alert("File type not supported!");
  }
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
})

showFileButton.addEventListener('click',()=>{
  if(!filePath){
    return;
  }
  shell.showItemInFolder(filePath);
});
openInDefaultButton.addEventListener('click',()=>{
	//shell.beep();
	if(!filePath){
		return;
	}
	shell.openItem(filePath)
});