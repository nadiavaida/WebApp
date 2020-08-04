import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AccountCircle } from '@material-ui/icons';
import { Button, AppBar, IconButton, Toolbar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AppActions from '../../actions/AppActions';
import AppStore from '../../stores/AppStore';
import CandidateStore from '../../stores/CandidateStore';
import cookies from '../../utils/cookies';
import { hasIPhoneNotch, historyPush, isCordova, isWebApp } from '../../utils/cordovaUtils';
import HeaderBackToButton from './HeaderBackToButton';
import HeaderBarProfilePopUp from './HeaderBarProfilePopUp';
import HeaderNotificationMenu from './HeaderNotificationMenu';
import MeasureStore from '../../stores/MeasureStore';
import OfficeItem from '../Ballot/OfficeItem';
import OfficeStore from '../../stores/OfficeStore';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import { renderLog } from '../../utils/logging';
import ShareModal from '../Share/ShareModal';
import ShareButtonDesktopTablet from '../Share/ShareButtonDesktopTablet';
import { shortenText, stringContains } from '../../utils/textFormat';
import SignInModal from '../Widgets/SignInModal';
import VoterGuideActions from '../../actions/VoterGuideActions';
import VoterSessionActions from '../../actions/VoterSessionActions';
import VoterStore from '../../stores/VoterStore';
import { voterPhoto } from '../../utils/voterPhoto';

class HeaderBackToBallot extends Component {
  static propTypes = {
    classes: PropTypes.object,
    location: PropTypes.object,
    params: PropTypes.object.isRequired,
    pathname: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      backToCandidateWeVoteId: '',
      backToMeasure: {},
      backToMeasureWeVoteId: '',
      backToVariable: '',
      candidateWeVoteId: '',
      googleCivicElectionId: '',
      measureWeVoteId: '',
      officeName: '',
      officeWeVoteId: '',
      organization: {},
      organizationHasBeenRetrievedOnce: {},
      organizationWeVoteId: '',
      profilePopUpOpen: false,
      shareModalStep: '',
      showShareModal: false,
      showSignInModal: false,
      scrolledDown: false,
      voter: {},
      voterFirstName: '',
    };
    this.toggleAccountMenu = this.toggleAccountMenu.bind(this);
    this.hideAccountMenu = this.hideAccountMenu.bind(this);
    this.hideProfilePopUp = this.hideProfilePopUp.bind(this);
    this.signOutAndHideProfilePopUp = this.signOutAndHideProfilePopUp.bind(this);
    this.toggleProfilePopUp = this.toggleProfilePopUp.bind(this);
    this.toggleSignInModal = this.toggleSignInModal.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
  }

  componentDidMount () {
    // console.log('HeaderBackToBallot componentDidMount, this.props: ', this.props);
    this.appStoreListener = AppStore.addListener(this.onAppStoreChange.bind(this));
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.measureStoreListener = MeasureStore.addListener(this.onMeasureStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.officeStoreListener = OfficeStore.addListener(this.onOfficeStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));

    let candidateWeVoteId;
    let googleCivicElectionId;
    let measureWeVoteId;
    let officeWeVoteId;
    let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (this.props.params) {
      candidateWeVoteId = this.props.params.candidate_we_vote_id || '';
      measureWeVoteId = this.props.params.measure_we_vote_id || '';
      officeWeVoteId = this.props.params.office_we_vote_id || '';
      if (candidateWeVoteId && candidateWeVoteId !== '') {
        const candidate = CandidateStore.getCandidate(candidateWeVoteId);
        // console.log('HeaderBackToBallot, candidateWeVoteId:', candidateWeVoteId, ', candidate:', candidate);
        if (candidate) {
          officeWeVoteId = candidate.contest_office_we_vote_id;
          officeName = candidate.contest_office_name;
          if (VoterStore.electionId()) {
            googleCivicElectionId = VoterStore.electionId();
          } else {
            googleCivicElectionId = candidate.google_civic_election_id;
          }
        } else {
          googleCivicElectionId = VoterStore.electionId();
        }
        this.setState({
          candidateWeVoteId,
          googleCivicElectionId,
          officeName,
          officeWeVoteId,
        });
      } else if (officeWeVoteId && officeWeVoteId !== '') {
        const office = OfficeStore.getOffice(officeWeVoteId);
        if (office) {
          officeName = office.ballot_item_display_name;
          if (VoterStore.electionId()) {
            googleCivicElectionId = VoterStore.electionId();
          } else {
            googleCivicElectionId = office.google_civic_election_id;
          }
        } else {
          googleCivicElectionId = VoterStore.electionId();
        }
        this.setState({
          googleCivicElectionId,
          officeName,
          officeWeVoteId,
        });
      }
      const backToCandidateWeVoteId = this.props.params.back_to_cand_we_vote_id || '';
      const backToMeasureWeVoteId = this.props.params.back_to_meas_we_vote_id || '';
      if (backToMeasureWeVoteId) {
        const backToMeasure = MeasureStore.getMeasure(backToMeasureWeVoteId);
        this.setState({
          backToMeasure,
        });
      }
      const backToVariable = this.props.params.back_to_variable || '';
      organizationWeVoteId = this.props.params.organization_we_vote_id || '';
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== '' && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
        const { organizationHasBeenRetrievedOnce } = this.state;
        organizationHasBeenRetrievedOnce[organizationWeVoteId] = true;
        this.setState({
          organizationHasBeenRetrievedOnce,
        });
      }
      // console.log('backToMeasureWeVoteId: ', backToMeasureWeVoteId);
      this.setState({
        backToCandidateWeVoteId,
        backToMeasureWeVoteId,
        backToVariable,
        measureWeVoteId,
        organization,
        organizationWeVoteId,
      });
    }

    // console.log('candidateWeVoteId: ', candidateWeVoteId);
    // console.log('organizationWeVoteId: ', organizationWeVoteId);

    const weVoteBrandingOffFromUrl = this.props.location.query ? this.props.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    const voter = VoterStore.getVoter();
    const voterFirstName = VoterStore.getFirstName();
    const voterIsSignedIn = voter.is_signed_in;
    const voterPhotoUrlMedium = voter.voter_photo_url_medium;
    this.setState({
      scrolledDown: AppStore.getScrolledDown(),
      shareModalStep: AppStore.shareModalStep(),
      showShareModal: AppStore.showShareModal(),
      showSignInModal: AppStore.showSignInModal(),
      voter,
      voterFirstName,
      voterIsSignedIn,
      voterPhotoUrlMedium,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  // eslint-disable-next-line camelcase,react/sort-comp
  UNSAFE_componentWillReceiveProps (nextProps) {
    // WARN: Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://fb.me/react-unsafe-component-lifecycles for details.
    // console.log('HeaderBackToBallot componentWillReceiveProps, nextProps: ', nextProps);
    let candidateWeVoteId;
    let googleCivicElectionId;
    let measureWeVoteId;
    let officeWeVoteId;
    let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (nextProps.params) {
      candidateWeVoteId = nextProps.params.candidate_we_vote_id || '';
      measureWeVoteId = this.props.params.measure_we_vote_id || '';
      officeWeVoteId = nextProps.params.office_we_vote_id || '';
      if (candidateWeVoteId && candidateWeVoteId !== '') {
        const candidate = CandidateStore.getCandidate(candidateWeVoteId);
        // console.log('HeaderBackToBallot, candidateWeVoteId:', candidateWeVoteId, ', candidate:', candidate);
        if (candidate) {
          officeWeVoteId = candidate.contest_office_we_vote_id;
          officeName = candidate.contest_office_name;
          if (VoterStore.electionId()) {
            googleCivicElectionId = VoterStore.electionId();
          } else {
            googleCivicElectionId = candidate.google_civic_election_id;
          }
        } else {
          googleCivicElectionId = VoterStore.electionId();
        }
        this.setState({
          candidate,
          candidateWeVoteId,
          googleCivicElectionId,
          officeName,
          officeWeVoteId,
        });
      } else if (officeWeVoteId && officeWeVoteId !== '') {
        const office = OfficeStore.getOffice(officeWeVoteId);
        if (office) {
          officeName = office.ballot_item_display_name;
          if (VoterStore.electionId()) {
            googleCivicElectionId = VoterStore.electionId();
          } else {
            googleCivicElectionId = office.google_civic_election_id;
          }
        } else {
          googleCivicElectionId = VoterStore.electionId();
        }
        this.setState({
          googleCivicElectionId,
          officeName,
          officeWeVoteId,
        });
      }
      const backToCandidateWeVoteId = nextProps.params.back_to_cand_we_vote_id || '';
      const backToMeasureWeVoteId = nextProps.params.back_to_meas_we_vote_id || '';
      if (backToMeasureWeVoteId) {
        const backToMeasure = MeasureStore.getMeasure(backToMeasureWeVoteId);
        this.setState({
          backToMeasure,
        });
      }
      const backToVariable = nextProps.params.back_to_variable || '';
      organizationWeVoteId = nextProps.params.organization_we_vote_id || '';
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== '' && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        if (!this.localOrganizationHasBeenRetrievedOnce(organizationWeVoteId)) {
          OrganizationActions.organizationRetrieve(organizationWeVoteId);
          const { organizationHasBeenRetrievedOnce } = this.state;
          organizationHasBeenRetrievedOnce[organizationWeVoteId] = true;
          this.setState({
            organizationHasBeenRetrievedOnce,
          });
        }
      }
      // console.log('backToMeasureWeVoteId: ', backToMeasureWeVoteId);
      this.setState({
        backToCandidateWeVoteId,
        backToMeasureWeVoteId,
        backToVariable,
        measureWeVoteId,
        organization,
        organizationWeVoteId,
      });
    }

    // console.log('organizationWeVoteId: ', organizationWeVoteId);

    const weVoteBrandingOffFromUrl = nextProps.location.query ? nextProps.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    const voter = VoterStore.getVoter();
    const voterFirstName = VoterStore.getFirstName();
    const voterIsSignedIn = voter.is_signed_in;
    const voterPhotoUrlMedium = voter.voter_photo_url_medium;
    this.setState({
      shareModalStep: AppStore.shareModalStep(),
      showShareModal: AppStore.showShareModal(),
      voter,
      voterFirstName,
      voterIsSignedIn,
      voterPhotoUrlMedium,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if not needed
    if (this.state.backToCandidateWeVoteId !== nextState.backToCandidateWeVoteId) {
      // console.log('this.state.backToCandidateWeVoteId: ', this.state.backToCandidateWeVoteId, ', nextState.backToCandidateWeVoteId', nextState.backToCandidateWeVoteId);
      return true;
    }
    if (this.state.backToMeasureWeVoteId !== nextState.backToMeasureWeVoteId) {
      // console.log('this.state.backToMeasureWeVoteId: ', this.state.backToMeasureWeVoteId, ', nextState.backToMeasureWeVoteId', nextState.backToMeasureWeVoteId);
      return true;
    }
    if (this.state.backToVariable !== nextState.backToVariable) {
      // console.log('this.state.backToVariable: ', this.state.backToVariable, ', nextState.backToVariable', nextState.backToVariable);
      return true;
    }
    if (this.state.candidateWeVoteId !== nextState.candidateWeVoteId) {
      // console.log('this.state.candidateWeVoteId: ', this.state.candidateWeVoteId, ', nextState.candidateWeVoteId', nextState.candidateWeVoteId);
      return true;
    }
    if (this.state.googleCivicElectionId !== nextState.googleCivicElectionId) {
      // console.log('this.state.googleCivicElectionId: ', this.state.googleCivicElectionId, ', nextState.googleCivicElectionId', nextState.googleCivicElectionId);
      return true;
    }
    if (this.state.measureWeVoteId !== nextState.measureWeVoteId) {
      // console.log('this.state.measureWeVoteId: ', this.state.measureWeVoteId, ', nextState.measureWeVoteId', nextState.measureWeVoteId);
      return true;
    }
    if (this.state.officeName !== nextState.officeName) {
      // console.log('this.state.officeName: ', this.state.officeName, ', nextState.officeName', nextState.officeName);
      return true;
    }
    if (this.state.officeWeVoteId !== nextState.officeWeVoteId) {
      // console.log('this.state.officeWeVoteId: ', this.state.officeWeVoteId, ', nextState.officeWeVoteId', nextState.officeWeVoteId);
      return true;
    }
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId: ', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId', nextState.organizationWeVoteId);
      return true;
    }
    if (this.state.profilePopUpOpen !== nextState.profilePopUpOpen) {
      // console.log('this.state.profilePopUpOpen: ', this.state.profilePopUpOpen, ', nextState.profilePopUpOpen', nextState.profilePopUpOpen);
      return true;
    }
    if (this.state.scrolledDown !== nextState.scrolledDown) {
      // console.log('this.state.scrolledDown: ', this.state.scrolledDown, ', nextState.scrolledDown', nextState.scrolledDown);
      return true;
    }
    if (this.state.showModalStep !== nextState.showModalStep) {
      // console.log('this.state.showModalStep: ', this.state.showModalStep, ', nextState.showModalStep', nextState.showModalStep);
      return true;
    }
    if (this.state.showShareModal !== nextState.showShareModal) {
      // console.log('this.state.showShareModal: ', this.state.showShareModal, ', nextState.showShareModal', nextState.showShareModal);
      return true;
    }
    if (this.state.showSignInModal !== nextState.showSignInModal) {
      // console.log('this.state.showSignInModal: ', this.state.showSignInModal, ', nextState.showSignInModal', nextState.showSignInModal);
      return true;
    }
    if (this.state.voterFirstName !== nextState.voterFirstName) {
      // console.log('this.state.voterFirstName: ', this.state.voterFirstName, ', nextState.voterFirstName', nextState.voterFirstName);
      return true;
    }
    const { voter, voterIsSignedIn, voterPhotoUrlMedium } = this.state;
    const { voter: nextVoter, voterIsSignedIn: nextVoterIsSignedIn, voterPhotoUrlMedium: nextVoterPhotoUrlMedium } = nextState;
    if (!voter && nextVoter) {
      // console.log('FIRST VOTER, voter: ', voter, ', nextVoter: ', nextVoter);
      return true;
    }
    if (voterIsSignedIn !== nextVoterIsSignedIn) {
      // console.log('voterIsSignedIn: ', voterIsSignedIn, ', nextVoterIsSignedIn: ', nextVoterIsSignedIn);
      return true;
    }
    if (voterPhotoUrlMedium !== nextVoterPhotoUrlMedium) {
      // console.log('voterPhotoUrlMedium: ', voterPhotoUrlMedium, ', nextVoterPhotoUrlMedium: ', nextVoterPhotoUrlMedium);
      return true;
    }
    // console.log('shouldComponentUpdate false');
    return false;
  }

  componentWillUnmount () {
    // this.ballotStoreListener.remove();
    this.appStoreListener.remove();
    this.candidateStoreListener.remove();
    this.measureStoreListener.remove();
    this.organizationStoreListener.remove();
    this.officeStoreListener.remove();
    this.voterStoreListener.remove();
  }

  onAppStoreChange () {
    this.setState({
      scrolledDown: AppStore.getScrolledDown(),
      shareModalStep: AppStore.shareModalStep(),
      showShareModal: AppStore.showShareModal(),
      showSignInModal: AppStore.showSignInModal(),
    });
  }

  onCandidateStoreChange () {
    const { candidateWeVoteId } = this.state;
    let { googleCivicElectionId, officeWeVoteId } = this.state;
    // console.log('Candidate onCandidateStoreChange');
    let officeName;
    if (candidateWeVoteId && candidateWeVoteId !== '') {
      const candidate = CandidateStore.getCandidate(candidateWeVoteId);
      // console.log('HeaderBackToBallot -- onCandidateStoreChange, candidateWeVoteId:', this.state.candidateWeVoteId, ', candidate:', candidate);
      if (candidate) {
        officeWeVoteId = candidate.contest_office_we_vote_id;
        officeName = candidate.contest_office_name;
        if (VoterStore.electionId()) {
          googleCivicElectionId = VoterStore.electionId();
        } else {
          googleCivicElectionId = candidate.google_civic_election_id;
        }
      } else {
        googleCivicElectionId = VoterStore.electionId();
      }
      this.setState({
        candidate,
        googleCivicElectionId,
        officeName,
        officeWeVoteId,
      });
    } else if (officeWeVoteId && officeWeVoteId !== '') {
      const office = OfficeStore.getOffice(officeWeVoteId);
      if (office) {
        officeName = office.ballot_item_display_name;
        if (VoterStore.electionId()) {
          googleCivicElectionId = VoterStore.electionId();
        } else {
          googleCivicElectionId = office.google_civic_election_id;
        }
      } else {
        googleCivicElectionId = VoterStore.electionId();
      }
      this.setState({
        googleCivicElectionId,
        officeName,
      });
    } else {
      googleCivicElectionId = VoterStore.electionId();
      this.setState({
        googleCivicElectionId,
      });
    }
  }

  onMeasureStoreChange () {
    const { backToMeasureWeVoteId } = this.state;
    if (backToMeasureWeVoteId && backToMeasureWeVoteId !== '') {
      const backToMeasure = MeasureStore.getMeasure(backToMeasureWeVoteId);
      this.setState({
        backToMeasure,
      });
    }
  }

  onOrganizationStoreChange () {
    const { organizationWeVoteId } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
    });
  }

  onOfficeStoreChange () {
    const { officeWeVoteId } = this.state;
    let { googleCivicElectionId } = this.state;
    let officeName;
    if (officeWeVoteId && officeWeVoteId !== '') {
      const office = OfficeStore.getOffice(officeWeVoteId);
      // googleCivic = office ? office.ballot_item_display_name : '';
      if (office) {
        officeName = office.ballot_item_display_name;
        if (VoterStore.electionId()) {
          googleCivicElectionId = VoterStore.electionId();
        } else {
          googleCivicElectionId = office.google_civic_election_id;
        }
      } else {
        googleCivicElectionId = VoterStore.electionId();
      }
    } else {
      googleCivicElectionId = VoterStore.electionId();
    }

    this.setState({
      googleCivicElectionId,
      officeName,
    });
  }

  onVoterStoreChange () {
    const voter = VoterStore.getVoter();
    const voterFirstName = VoterStore.getFirstName();
    const voterIsSignedIn = voter.is_signed_in;
    const voterPhotoUrlMedium = voter.voter_photo_url_medium;
    const googleCivicElectionId = VoterStore.electionId();
    this.setState({
      googleCivicElectionId,
      voter,
      voterFirstName,
      voterIsSignedIn,
      voterPhotoUrlMedium,
    });
  }

  getOfficeLink () {
    if (this.state.organizationWeVoteId && this.state.organizationWeVoteId !== '') {
      return `/office/${this.state.officeWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      return `/office/${this.state.officeWeVoteId}/b/btdb`; // back-to-default-ballot
    }
  }

  getVoterGuideLink () {
    const { googleCivicElectionId, organizationWeVoteId } = this.state;
    return `/voterguide/${organizationWeVoteId}/ballot/election/${googleCivicElectionId}`;
  }

  closeShareModal = () => {
    AppActions.setShowShareModal(false);
    AppActions.setShareModalStep('');
    const { pathname } = this.props;
    if (stringContains('/modal/share', pathname) && isWebApp()) {
      const pathnameWithoutModalShare = pathname.replace('/modal/share', '');
      // console.log('navigation closeShareModal ', pathnameWithoutModalShare);
      historyPush(pathnameWithoutModalShare);
    }
  }

  closeSignInModal () {
    AppActions.setShowSignInModal(false);
  }

  transitionToYourVoterGuide () {
    const { voter } = this.state;
    // Positions for this organization, for this voter / election
    OrganizationActions.positionListForOpinionMaker(voter.linked_organization_we_vote_id, true);

    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(voter.linked_organization_we_vote_id, false, true);
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuideFollowersRetrieve(voter.linked_organization_we_vote_id);
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(voter.linked_organization_we_vote_id);
    this.setState({ profilePopUpOpen: false });
  }

  hideAccountMenu () {
    this.setState({ profilePopUpOpen: false });
  }

  toggleAccountMenu () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleProfilePopUp () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleSignInModal () {
    const { showSignInModal } = this.state;
    this.setState({ profilePopUpOpen: false });
    AppActions.setShowSignInModal(!showSignInModal);
  }

  hideProfilePopUp () {
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideProfilePopUp () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  localOrganizationHasBeenRetrievedOnce (organizationWeVoteId) {
    if (organizationWeVoteId) {
      const { organizationHasBeenRetrievedOnce } = this.state;
      return organizationHasBeenRetrievedOnce[organizationWeVoteId];
    }
    return false;
  }

  render () {
    renderLog('HeaderBackToBallot');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      backToCandidateWeVoteId, backToMeasure, backToMeasureWeVoteId, backToVariable,
      candidate, googleCivicElectionId, measureWeVoteId, officeName, officeWeVoteId,
      organization, organizationWeVoteId, profilePopUpOpen, scrolledDown, showSignInModal,
      shareModalStep, showShareModal, voter, voterFirstName, voterIsSignedIn,
    } = this.state;
    const voterPhotoUrlMedium = voterPhoto(voter);
    const { classes, pathname } = this.props;

    // console.log('HeaderBackToBallot googleCivicElectionId:', googleCivicElectionId);

    let backToLink;
    let backToLinkText;
    if (backToCandidateWeVoteId) {
      backToLink = `/candidate/${backToCandidateWeVoteId}/b/${backToVariable}`;
    } else if (backToMeasureWeVoteId) {
      backToLink = `/measure/${backToMeasureWeVoteId}/b/${backToVariable}`;
    } else if ((backToVariable === 'bto' || backToVariable === 'btdo') && !backToCandidateWeVoteId) { // back-to-default-office
      backToLink = this.getOfficeLink();
    } else if (organizationWeVoteId && candidate && candidate.google_civic_election_id) {
      backToLink = this.getVoterGuideLink(); // Default to this when there is an organizationWeVoteId
    } else if (googleCivicElectionId) {
      backToLink = `/ballot/election/${googleCivicElectionId}`;
    } else if (measureWeVoteId) {
      backToLink = `/ballot#${measureWeVoteId}`;
    } else {
      backToLink = '/ballot'; // Default to this
    }

    if (backToCandidateWeVoteId) {
      if (candidate && candidate.ballot_item_display_name) {
        backToLinkText = candidate.ballot_item_display_name;
      } else {
        backToLinkText = 'Back to Candidate';
      }
    } else if (backToMeasureWeVoteId) {
      if (backToMeasure && backToMeasure.ballot_item_display_name) {
        backToLinkText = backToMeasure.ballot_item_display_name;
      } else {
        backToLinkText = 'Back to Measure';
      }
    } else if (backToVariable === 'bto' || backToVariable === 'btdo') { // back-to-default-office
      if (officeName) {
        backToLinkText = `${officeName}`; // Back to
      } else {
        backToLinkText = 'Back';
      }
    } else if (organization && organization.organization_name) {
      backToLinkText = `${organization.organization_name}`; // Back to
    } else {
      backToLinkText = 'Ballot'; // Back to
    }

    const headerClassName = (function header () {
      let cname = 'page-header';
      if (stringContains('/office', pathname.toLowerCase())) {
        if (isWebApp()) {
          cname = 'page-header page-header__back-to-ballot';
        } else if (hasIPhoneNotch()) {
          cname = 'page-header page-header__back-to-ballot-cordova  page-header__cordova-iphonex';
        } else {
          cname = 'page-header page-header__back-to-ballot-cordova  page-header__cordova';
        }
      }
      return cname;
    }());

    let appBarClasses;
    const onCandidateOrMeasureRoute = stringContains('/candidate/', pathname.toLowerCase()) || stringContains('/measure/', pathname.toLowerCase());
    if (scrolledDown && onCandidateOrMeasureRoute) {
      appBarClasses = { root: classes.noBoxShadow };
    }

    const cordovaOverrides = isWebApp() ? {} : { marginLeft: 0, padding: '4px 0 0 8px', right: 'unset' };

    return (
      <AppBar className={headerClassName} color="default" classes={appBarClasses} style={cordovaOverrides}>
        <Toolbar className="header-toolbar header-backto-toolbar" disableGutters>
          <HeaderBackToButton
            backToLink={backToLink}
            backToLinkText={backToLinkText}
            id="backToLinkTabHeader"
          />

          <NotificationsAndProfileWrapper className="u-cursor--pointer">
            <HeaderNotificationMenu />
            {voterIsSignedIn ? (
              <span onClick={this.toggleAccountMenu}>
                {voterPhotoUrlMedium ? (
                  <span
                    id="profileAvatarHeaderBar"
                    className={`header-nav__avatar-container ${isCordova() ? 'header-nav__avatar-cordova' : undefined}`}
                    onClick={this.toggleProfilePopUp}
                  >
                    <img
                      className="header-nav__avatar"
                      src={voterPhotoUrlMedium}
                      height={34}
                      width={34}
                      alt="Your Settings"
                    />
                  </span>
                ) : (
                  <span>
                    <IconButton
                      classes={{ root: classes.iconButtonRoot }}
                      id="profileAvatarHeaderBar"
                      onClick={this.toggleProfilePopUp}
                    >
                      <FirstNameWrapper>
                        {shortenText(voterFirstName, 9)}
                      </FirstNameWrapper>
                      <AccountCircle />
                    </IconButton>
                  </span>
                )
                }
                {profilePopUpOpen && (
                  <HeaderBarProfilePopUp
                    hideProfilePopUp={this.hideProfilePopUp}
                    onClick={this.toggleProfilePopUp}
                    profilePopUpOpen={profilePopUpOpen}
                    signOutAndHideProfilePopUp={this.signOutAndHideProfilePopUp}
                    toggleProfilePopUp={this.toggleProfilePopUp}
                    toggleSignInModal={this.toggleSignInModal}
                    transitionToYourVoterGuide={this.transitionToYourVoterGuide}
                    voter={voter}
                    weVoteBrandingOff={this.state.we_vote_branding_off}
                  />
                )}
              </span>
            ) : (
              <Button
                className="header-sign-in"
                classes={{ root: classes.headerButtonRoot }}
                color="primary"
                id="signInHeaderBar"
                onClick={this.toggleSignInModal}
                variant="text"
              >
                Sign In
              </Button>
            )}
          </NotificationsAndProfileWrapper>
        </Toolbar>
        {stringContains('/office', pathname.toLowerCase())  && officeName && (
          <OfficeNameWrapper className="header-toolbar">
            <OfficeItem
              weVoteId={officeWeVoteId}
              ballotItemDisplayName={officeName}
            />
            <OfficeShareWrapper className="u-show-desktop-tablet">
              <ShareButtonDesktopTablet officeShare />
            </OfficeShareWrapper>
          </OfficeNameWrapper>
        )}
        {showSignInModal && (
          <SignInModal
            show={showSignInModal}
            closeFunction={this.closeSignInModal}
          />
        )}
        {showShareModal && (
          <ShareModal
            voterIsSignedIn={voterIsSignedIn}
            pathname={pathname}
            show={showShareModal}
            shareModalStep={shareModalStep}
            closeShareModal={this.closeShareModal}
          />
        )}
      </AppBar>
    );
  }
}

const styles = theme => ({
  noBoxShadow: {
    boxShadow: '0 0 0 0',
  },
  headerButtonRoot: {
    paddingTop: 2,
    paddingBottom: 2,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    color: 'rgb(6, 95, 212)',
    marginLeft: '1rem',
    outline: 'none !important',
    [theme.breakpoints.down('md')]: {
      marginLeft: '.1rem',
    },
  },
  iconButtonRoot: {
    color: 'rgba(17, 17, 17, .4)',
    outline: 'none !important',
    paddingRight: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
});

const FirstNameWrapper = styled.div`
  font-size: 14px;
  padding-right: 4px;
`;

const NotificationsAndProfileWrapper = styled.div`
  display: flex;
  z-index: 3; //to float above the account/ProfilePopUp menu option grey div
`;

const OfficeNameWrapper = styled.div`
  display: flex;
  margin-left: 30px;
`;

const OfficeShareWrapper = styled.div`
  margin-bottom: 12px;
`;

export default withStyles(styles)(HeaderBackToBallot);
