import { browser, driver, expect } from '@wdio/globals';
import CandidatesPage from '../page_objects/candidates.page';
import { Key } from 'webdriverio';

const testDataPath="tests/browserstack_automation/capabilities/";
const fs=require('fs');
const assert = require('assert');
const titleStr=" Candiates - weVote";
const waitTime = 8000;


//Candidates_006
it('verifyPageHeaders_AllPossibleHeaders', async () => {
  let jsonObjH=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC001.json'));
  const expectedHeaders=jsonObjH[0].HeadersText;
  let jsonObj=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC002.json'));
  const expectedStates=jsonObj[0].States;
  console.log("All States: "+allStates);
  await expectedStates.forEach(async (state)=>{
        console.log("State: "+state);          
        await CandidatesPage.stateSelect.selectByVisibleText(state);
        await driver.pause(100);
        let actualHeaders=await CandidatesPage.getpageHeaders();
        await actualHeaders.forEach(async (header)=>{
              let headerText=await header.getText();
              console.log("HT: "+headerText);
              assert(expectedHeaders.includes(headerText),"Header section -> '"+headerText +"'  .. does not match with any of the expected Headers."); 
            });
        //await driver.pause(6000);
      });
  });

//Candidates_002
it('verifyStateNamesPresentforChooseState', async () => {
    await CandidatesPage.load();
    await CandidatesPage.stateSelect.click();
    await driver.pause(waitTime);
    const options=await CandidatesPage.getstateSelectOptions();
   // let jsonObj=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC002.json'));
    const expectedStates=jsonObj[0].States;
    console.log("Expected: "+expectedStates);
    let actualStates=[];
    await options.forEach(async (option)=>{
      let stateName=await option.getText();
      if (! stateName.includes("Choose state")){
          actualStates.push(stateName);
        }
    });
    await expectedStates.forEach((state)=>{
          assert(actualStates.includes(state),"State -> '"+state +"'  .. not found on the Choose state Dropdown Options .");
          //console.log("State: "+state);
          });
  });

//Candidates_003
let stateNames=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC003.json'));
stateNames.forEach(({stateCode,stateText}) => {
it('verifyTitleWhenStateSelected', async () => {
    await CandidatesPage.load();
    await CandidatesPage.stateSelect.selectByAttribute('value',stateCode);
    const expectedTitle=stateText+titleStr;
    let actualTitle=await driver.getTitle();
    console.log(actualTitle);
    expect(actualTitle.match(expectedTitle));
  });
});

//Candidates_004
it('verifyTabSelectionSates', async () => {
  await CandidatesPage.load();
  await driver.pause(waitTime);
  await browser.keys(Key.Tab);
  await browser.keys(Key.Tab);
  await expect (CandidatesPage.stateSelect).toBeFocused();
  await driver.pause(waitTime);
});

//Candidates_005
it('verifyTabSearch', async () => {
  await CandidatesPage.load();
  await driver.pause(waitTime);
  await browser.keys(Key.Tab);
  await browser.keys(Key.Tab);
  await browser.keys(Key.Tab);
  await expect (CandidatesPage.searchBox).toBeFocused();
  await driver.pause(waitTime);
});

//Candidates_006
let names=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC006.json'));
names.forEach(({name}) => {
it('verifySearchName_UpperCase', async () => {
  await CandidatesPage.load();
  await driver.pause(waitTime);
  await CandidatesPage.searchBox.setValue((name.toString()).toUpperCase());
  await driver.pause(waitTime);
});



});


