import { $, $$, driver } from '@wdio/globals';
import Page from './page';
import TopNavigation from './topnavigation';

class CandidatesPage extends Page {
  async load () {
    await super.open('');
    await driver.maximizeWindow();
    await TopNavigation.toggleCandidatesTab();
  }

  get stateSelect () {
    return $("//select[@id='outlined-age-native-simple']");
  }

  get stateSelectOptions () {
    return $$("//select[@id='outlined-age-native-simple']//option");
  }

  get pageHeaders () {
    return $$('h2#whatIsHappeningTitle');
  }

  get CandidateCardList () {
    return $$("//div[contains(@id,'cardForListBodyWrapper')]");
  }

  get CandidateSupportButtonList () {
    return $$("button[id*='itemActionBarSupportButton'][id*='desktop']");
  }

  get supportTooltip () {
    return $('div#supportButtonTooltip');
  }

  get opposeTooltip () {
    return $('div#opposeButtonTooltip');
  }

  get scrollRight () {
    return $('div#candidateRightArrowDesktop');
  }


  async getCandidateCardCandidateName(cardId) {
    const candidate = await $(`//div[@id='${cardId}']//a[@id='candidateCardDisplayName' or @id='representativeCardDisplayName']`);
    const candidateName = await candidate.getText();
    return candidateName;
  }

  async getCandidateCardState(cardId) {
    const candidate = await $(`//div[@id='${cardId}']//div[contains(@id,'stateName')]`);
    const stateText = await candidate.getText();
    return stateText;
  }

  async getCandidateCardPartyName (cardId) {
    const candidateParty = await $(`//div[@id='${cardId}']//div[contains(@class,'PoliticalParty')]`);
    const candidatePartyExists = await candidateParty.isExisting();
    if (candidatePartyExists) {
      const partyText = await candidateParty.getText();
      return partyText;
    } else {
      return null;
    }
  }

  async getCandidateCardOffice (cardId) {
    const candidateOffice = await $(`//div[@id='${cardId}']//div[contains(@class,'OfficeNameWrapper')]/div`);
    const officeText = candidateOffice.getText();
    return officeText;
  }

  async getCandidateCardChoose (cardId) {
    return  $(`div#${cardId} button[id*='itemActionBarSupport'][id*='desktop']`);
  }

  async getCandidateCardOppose (cardId) {
    return  $(`div#${cardId} button[id*='itemActionBarOppose'][id*='desktop']`);
  }

  async getCandidateCardHelpWinButton (cardId) {
    return $(`div#${cardId} button[id*='itemActionBarHelpThemWinButton'][id*='desktop']`);
  }

  async getCandidateCardHelpDefeatButton (cardId) {
    return $(`div#${cardId} button[id*='itemActionBarHelpDefeatButton'][id*='desktop']`);
  }
}
export default new CandidatesPage();
