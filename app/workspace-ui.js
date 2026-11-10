// Workspace navigation and feedback only. Project data and renderer state stay in their existing owners.
function initializeWorkspaceUI(){
 const verify=$('verifyWorkspace'),audit=$('productionAudit');
 verify.onclick=()=>{audit.open=true;audit.scrollIntoView({block:'nearest'});$('startAudit').focus({preventScroll:true});};
 const state=$('previewState'),status=$('controllerStatus');
 const updateConnection=()=>{
  const text=status.textContent;
  const next=text.startsWith('Live ·')?'connected':text.includes('preview')||text.includes('simulated')?'preview':'waiting';
  if(state.dataset.state!==next)state.dataset.state=next;
 };
 new MutationObserver(updateConnection).observe(status,{childList:true});updateConnection();
 const targets={returnToEditor:'Choose a different starting skin',background:'Toggle the preview backdrop; exported overlays stay transparent',moveController:'Drag the whole overlay. Arrow keys nudge; Shift moves 10 pixels.',moveArtwork:'Drag your wordmark or logo independently of the controller',startEditing:'Apply the previewed skin. Your previous design stays available through Undo.'};
 for(const[id,title]of Object.entries(targets))$(id).title=title;
}
