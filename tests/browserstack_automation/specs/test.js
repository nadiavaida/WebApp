import { browser, driver, expect } from '@wdio/globals';
import CandidatesPage from '../page_objects/candidates.page';
import { Key } from 'webdriverio';

const testDataPath="tests/browserstack_automation/capabilities/";
const fs=require('fs');
const assert = require('assert');
const titleStr=" Candiates - weVote";
const waitTime = 8000;

describe('Candidates Page', () => {

    //Candidates_007
   
    let jsonObjH=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC001.json'));
    const expectedHeaders=jsonObjH[0].HeadersText;
    let jsonObjSt=JSON.parse(fs.readFileSync(testDataPath+'candidatesPage_TC002.json'));
    const allStateNames=(jsonObjSt[0])["States"];
    let stateNamesRandom=[];
    const mandatoryHeader="More Politicians";
   
    for (let cnt=0;cnt<5;cnt++)
    {
        stateNamesRandom.push(allStateNames[Math.floor(Math.random()*allStateNames.length)]);
    }
    stateNamesRandom.forEach((stateText) => {
    it('verifyTitleWhenStateSelected', async () => {
        CandidatesPage.load();
        await driver.pause(waitTime);
        await CandidatesPage.stateSelect.selectByVisibleText(stateText);
        await driver.pause(waitTime);
        let mandatoryHeaderFound=false;
        let actualHeaders=await CandidatesPage.getpageHeaders();
        await actualHeaders.forEach(async (header)=>{
                let headerText=await header.getText();
                if (headerText==mandatoryHeader){
                    mandatoryHeaderFound=true;
                }
                else {
                    mandatoryHeaderFound=false;
                }
                assert(expectedHeaders.includes(headerText),"Header section -> '"+headerText +"'  .. does not match with any of the expected Headers."); 
                });
        assert(mandatoryHeaderFound==true);        
        });
    });
});