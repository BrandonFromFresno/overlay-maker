// Existing editor suites resume the current design through the real launch control.
exports.enterStudio=async page=>{
 if(await page.locator('#startView').count()&&await page.locator('#startView').isVisible())await page.locator(await page.locator('#continueEditing').isVisible()?'#continueEditing':'#startEditing').click();
};
