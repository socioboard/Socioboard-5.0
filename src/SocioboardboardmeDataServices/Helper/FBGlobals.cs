using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FaceDominator;

namespace FaceDominator
{
    /// <summary>
    /// Globals is implemented as a singleton. It contains all the Facebook Urls, Parsed Data and Post Data
    /// Globals is Thread Safe.
    /// </summary>
    public class FBGlobals
    {
        /// <summary>
        /// Contains all the accounts and related Information
        /// </summary>       
        // DBC Setting

        public static string dbcUserName = string.Empty;
        public static string dbcPassword = string.Empty;

        public enum PostLikeReaction { Like, Love, Haha, Wow, Sad, Angry };


        public static Dictionary<string, FacebookUser> loadedAccountsDictionary = new Dictionary<string, FacebookUser>();

        public static List<string> listAccounts = new List<string>();

        public readonly string fbhomeurl = "https://www.facebook.com/";
        public readonly string fbloginurl = "https://www.facebook.com/ajax/register.php?__a=4&post_form_id=";
        public readonly string fbsignupurl = "https://www.facebook.com/ajax/register.php?__a=4&post_form_id=";
        public readonly string fbProfileUrl = "https://www.facebook.com/profile.php?id=";
        public readonly string fbgraphUrl = "https://graph.facebook.com/";
        public readonly string fbeventsUrl = "https://www.facebook.com/events/";
        public readonly string fbMessagesUrl = "https://www.facebook.com/messages/";
        public readonly string fbvideosUrl = "https://www.facebook.com/videos/";
        public readonly string fbLoginPhpUrl = "https://www.facebook.com/login.php";
        public readonly string fbWelcomeUrl = "https://www.facebook.com/?sk=welcome";
        public readonly string fbWhatIsMyIpUrl="https://www.whatismyip.com";
        public readonly string fbAllFriendsUrl = "https://www.facebook.com/ajax/browser/list/allfriends/";
        public readonly string fbAllFriendsUIdUrl = "https://www.facebook.com/ajax/browser/list/allfriends/?uid=";
        public readonly string fbAjaxTimelineTakeAction="https://www.facebook.com/ajax/timeline/take_action_on_story.php";
        public readonly string fbajaxTimelineAll_activity = "https://www.facebook.com/ajax/timeline/all_activity";
        public readonly string fbfacebookSearchPhpQUrl = "https://www.facebook.com/search.php?q=";
       


        public readonly string urlPostTimeLineManageProfile = "https://www.facebook.com/ajax/timeline/activate.php?action=activate&ref=profile_megaphone&__a=1";
        public readonly string urlGetActivateTimeLineManageProfile = "https://www.facebook.com/ajax/timeline/activate.php?action=activate&ref=profile_megaphone&__a=1";
        public readonly string urlPostEducationManageProfile = "https://www.facebook.com/ajax/profile/edit/save_education.php?__a=1";
        public readonly string urlPostCurrentCityAndHomeTownManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?__a=1";
        public readonly string urlPostURLfreshBooksManageProfile = "https://www.facebook.com/ajax/typeahead/record_basic_metrics.php";
        public readonly string urlPostUrlAboutYouManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/bio.php?__a=1";
        public readonly string urlPostUrlWorkIdManageProfile = "https://www.facebook.com/ajax/profile/edit/add_work.php?__a=1";
        public readonly string urlPostUrlWorkManageProfile = "https://www.facebook.com/ajax/profile/edit/add_work.php?__a=1";
        public readonly string urlPostUrlWorkDoneManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/eduwork.php?done=1&__a=1";
        public readonly string urlPostURLQuotationsManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/quotes.php";
        public readonly string urlPostDataUrlBasicInfoManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/basic_info.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageProfileAjaxUpdateUrl ="https://www.facebook.com/ajax/presence/update.php";
        public readonly string urlPostDataUrlBasicInfoManageEditProfileQuotesUrl="https://www.facebook.com/ajax/timeline/edit_profile/quotes.php?__user=";
        public readonly string urlPostDataUrlBasicInfoManageTimelineEditProfileContact="https://www.facebook.com/ajax/timeline/edit_profile/contact_info.php";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileBio="https://www.facebook.com/ajax/timeline/edit_profile/bio.php?__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileHometown="https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?ref=about_tab&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearchEduworkInference ="https://www.facebook.com/ajax/typeahead/search/eduwork/inference.php?context=hub_current_city&profilesection=14002&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearchEduworkInferenceHometown="https://www.facebook.com/ajax/typeahead/search/eduwork/inference.php?context=hub_hometown&profilesection=14001&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileBasicInfo="https://www.facebook.com/ajax/timeline/edit_profile/basic_info.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileEduWork="https://www.facebook.com/ajax/timeline/edit_profile/eduwork.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearchPhpValue="https://www.facebook.com/ajax/typeahead/search.php?value=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearch="https://www.facebook.com/ajax/typeahead/search.php?__a=1&value=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileBioUser="https://www.facebook.com/ajax/timeline/edit_profile/bio.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineAppCollectionItemStandardCurationSurfaceCollectionId="https://www.facebook.com/ajax/timeline/app_collection_item/standard_in_house_og/curation?surface_collection_id=14";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineAppCollectionItemAddFbpageSurfaceCollection="https://www.facebook.com/ajax/timeline/app_collection_item/add/fbpage/?surface_collection_id=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileEditAddExperience= "https://www.facebook.com/ajax/profile/edit/add_experience.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileEditSaveExperience="https://www.facebook.com/ajax/profile/edit/save_experience.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileEditSaveMediaSection ="https://www.facebook.com/ajax/profile/edit/save_media_section.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileFavoritesUrl="https://www.facebook.com/ajax/timeline/edit_profile/favorites.php?done_edit=1&__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineEditProfileHometownUrl="https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineEditProfileHomeTownAboutTabFieldTypeCurrentCityUrl="https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?ref=about_tab&field_type=current_city";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineEditProfileAboutTabFieldTypeHomeTownUrl="https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?ref=about_tab&field_type=hometown";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileAllajaxpipeAjaxpipeToken ="https://www.facebook.com/ajax/pagelet/generic.php/TimelineProfileAllActivityPagelet?ajaxpipe=1&ajaxpipe_token=";

        public readonly string urlPostUrlFriendRequestFirstFriendManager = "https://www.facebook.com/ajax/friends/lists/flyout_content.php?__a=1";
        public readonly string urlPostUrlFriendRequestSecondFriendManager = "https://www.facebook.com/ajax/friends/status.php?__a=1";
        public readonly string urlPostUrlFriendRequestThirdFriendManager = "https://www.facebook.com/ajax/add_friend/action.php?__a=1";
        public readonly string urlPostAddFriendUrlFriendManager = "https://www.facebook.com/ajax/add_friend/action.php";
        public readonly string urlPostAjaxReqsurlFriendManager = "https://www.facebook.com/ajax/reqs.php";
        public readonly string urlGetReqsurlFriendManager = "https://www.facebook.com/reqs.php";
        public readonly string urlGetSentReqsurlFriendManager = "https://www.facebook.com/friends/requests/?fcref=jwl&outgoing=1";
        public readonly string urlGetSearchFriendsFriendManager = "https://www.facebook.com/search/ajax/more.php?offsets[pps]=0&pagesize=100&q=";

        public readonly string createHotmailcheckppsecure = "https://login.live.com/ppsecure/post.srf?ru=http://mail.live.com/?";
        public readonly string createHotmailSignupUrl = "https://signup.live.com/signup.aspx?";
        public readonly string createHotmailInboxUrl = "https://mail.live.com/?rru=inbox";
        public readonly string createHotmailLogoutUrl = "https://co116w.col116.mail.live.com/mail/logout.aspx";
        public readonly string createHotmailMSNUrl = "https://in.msn.com/";
        public readonly string createHotmailSignUpInboxUrl = "https://signup.live.com/signup.aspx?ru=http%3a%2f%2fmail.live.com%2f%3frru%3dinbox&wa=wsignin1.0&rpsnv=11&ct=1261772379&rver=6.0.5285.0&wp=MBI&wreply=http:%2F%2Fmail.live.com%2Fdefault.aspx&lc=1033&id=64855&mkt=en-us&bk=1261772380&rollrs=12&lic=1";

        public readonly string PageManagerAjaxPosterUrl = "https://www.facebook.com/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet?";
        public readonly string PageManagerPagesGetting= "https://www.facebook.com/pages/getting_started?page_id=";
        public readonly string PageManagerPageIdentitySwitchPhp= "https://www.facebook.com/identity_switch.php";
        public readonly string PageManagerPageAjaxComposerx1 = "https://www.facebook.com/ajax/composerx/attachment/media/chooser/?composerurihash=1";
        public readonly string PageManagerPageAjaxComposerx2="https://www.facebook.com/ajax/composerx/attachment/media/upload/?composerurihash=2";
        public readonly string pageManagerFanPageScraperSearchResultUrl="http://www.facebook.com/search/results.php?q=";

        public readonly string PageManagerFanPageLikerstrUrlAed = "https://www.facebook.com/ai.php?";
        public readonly string PageManagerFanPageLikerpostURL1st = "https://www.facebook.com/ajax/pages/fan_status.php?__a=1";
        public readonly string PageManagerFanPageLikerFanStatus = "https://www.facebook.com/ajax/pages/fan_status.php";
        public readonly string PageManagerFanPageLikerpostURL2nd = "https://www.facebook.com/ajax/pages/fetch_app_column.php?__a=1";
        public readonly string PageManagerFanPageGetsharerAppId = "https://www.facebook.com/ajax/sharer/?s=18&appid=";
        public readonly string PageManagerFanPagePostSharerSubmit = "https://www.facebook.com/ajax/sharer/submit/";
        public readonly string PageManagerFanPageLikerPostpostResponse1 = "https://www.facebook.com/ajax/like/tooltip.php?comment_fbid=";
        public readonly string PageManagerFanPageLikerPostpostResponse2 = "https://www.facebook.com/ajax/ufi/like.php";
        public readonly string PageManagerFanPageLikerPostpostResponse = "https://www.facebook.com/ajax/ufi/modify.php?__a=1";
        public readonly string PageManagerFanPageLikerGetResponse = "https://www.facebook.com/ai.php?aed=";
        public readonly string PageManagerFanPageLikerPostcommentResponse = "https://www.facebook.com/ajax/ufi/add_comment.php";
        public readonly string PageManagerFanPageLikerGetScripUrl = "https://www.facebook.com/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet?ajaxpipe=1&ajaxpipe_token=";
        public readonly string PageManagerFanPageLikerGetFmqDefaultJPG = "https://external.ak.fbcdn.net/safe_image.php?d=AQBdnjAKYo8Xiw7k&url=http%3A%2F%2Fi1.ytimg.com%2Fvi%2FLj0q5O59D2E%2Fmqdefault.jpg";
        public readonly string PageManagerFanPageLikerGetUtoCRPNG = "https://static.ak.fbcdn.net/rsrc.php/v2/yh/r/rkQF27utoCR.png";
        public readonly string PageManagerFanPageInviter= "https://www.facebook.com/ajax/pages/invite/send_single/";

        public readonly string EventInviterPostAjaxJoinPHP = "https://www.facebook.com/ajax/events/permalink/join.php";
        public readonly string EventInviterGetAjaxChoosePlan_Id = "https://www.facebook.com/ajax/choose/?type=plan&plan_id=";
        public readonly string EventInviterGetAjaxIncludeAllPlan_Id = "https://www.facebook.com/ajax/plans/typeahead/invite.php?include_all=true&plan_id=";
        public readonly string EventInviterPostAjaxInvitePlan_Id = "https://www.facebook.com/ajax/events/permalink/invite.php?plan_id=";
        public readonly string EventInviterGetAjaxEvent_membersid = "https://www.facebook.com/ajax/browser/list/event_members/?id=";


        public readonly string EventCreatorGetCreateEventUrl = "https://www.facebook.com/events/calendar";
        public readonly string EventCreatorGetAjaxCreateEventDialogUrl = "https://www.facebook.com/ajax/plans/create/dialog.php?__asyncDialog=1&__user=";
        public readonly string EventCreatorPostAjaxCreateEventSaveUrl = "https://www.facebook.com/ajax/plans/create/save.php";


        public readonly string MessageScraperGetMessagesActionReadUrl = "https://www.facebook.com/messages/?action=read&tid=id.";
        public readonly string MessageScraperGetMessagesUrl = "https://www.facebook.com/messages/";
        public readonly string MessageScraperPostAjaxMercuryThreadInfoUrl = "https://www.facebook.com/ajax/mercury/thread_info.php";
        public readonly string MessageScraperGetAjaxMessagingOffsetLimitUrl = "https://www.facebook.com/ajax/messaging/async.php?sk=inbox&offset=0&limit=";
        public readonly string MessageScraperGetAjaxMessagingOffsetUrl = "https://www.facebook.com/ajax/messaging/async.php?sk=inbox&offset=";
        public readonly string MessageScraperPostAjaxMercuryThreadListInfoUrl = "https://www.facebook.com/ajax/mercury/thread_info.php";


        public readonly string GroupInviterPostAjaxGroupsMembersAddUrl = "https://www.facebook.com/ajax/groups/members/add_post.php";


        public readonly string PhotoTaggingPostAjaxTagsAlbumUrl = "https://www.facebook.com/ajax/photos/photo/tags/tags_album.php?__a=1";
        public readonly string PhotoTaggingPostAjaxPhotoTaggingAjaxUrl = "https://www.facebook.com/ajax/photo_tagging_ajax.php?__a=1";

                                                                   
        public readonly string MessageReplyGetAjaxAsyncDialogUrl = "https://www.facebook.com/ajax/messaging/async.php?action=composerDialog&__a=1&causal_element=js_3&__asyncDialog=3&__user=";
        public readonly string MessageReplyPostAjaxMessagingSendUrl = "https://www.facebook.com/ajax/messaging/send.php?__a=1";
        public readonly string MessageReplyPostAjaxMessagingPhp = "https://www.facebook.com/ajax/messaging/async.php?sk=inbox&action=read&tid=id.331895363542575&page&query&__a=1";
                                                                      

        public readonly string WallPosterPostAjaxUpdateStatusUrl = "https://www.facebook.com/ajax/updatestatus.php?__a=1";
        public readonly string WallPosterGetAjaxSatusIsAugmentationUrl = "https://www.facebook.com/ajax/metacomposer/attachment/status/status.php?isAugmentation=true&targetid=";
        public readonly string WallPosterGetAjaxScraperUrl = "https://www.facebook.com/ajax/metacomposer/attachment/link/scraper.php?scrape_url=";
        public readonly string WallPosterGetAjaxComposerScraperUrl = "https://www.facebook.com/ajax/composerx/attachment/link/scraper/?scrape_url=";
        public readonly string WallPosterGetSafeImageUrl = "https://external.ak.fbcdn.net/safe_image.php?d=AQD9xXmNexloERcj&url=http%3A%2F%2Fwww.google.co.in%2Fimages%2Fgoogle_favicon_128.png";
        public readonly string WallPosterPostAjaxProfileComposerUrl = "https://www.facebook.com/ajax/profile/composer.php";
        public readonly string WallPosterPostAjaxBzUrl ="https://www.facebook.com/ajax/bz";


        public readonly string PostPicOnWallPostAjaxComposeUriHashUrl = "https://www.facebook.com/ajax/composerx/attachment/media/chooser/?composerurihash=1";
        public readonly string PostPicOnWallPostUploadPhotosUrl = "https://upload.facebook.com/media/upload/photos/composer/?__user=";
        public readonly string PostPicOnWallPostAjaxCitySharerResetUrl = "https://www.facebook.com/ajax/places/city_sharer_reset.php";


        public readonly string CommentLikerPostAjaxFacbookLikeUrl  ="https://www.facebook.com/ajax/ufi/like.php";
        public readonly string CommentLikerPostAjaxFacbookModifyUrl = "https://www.facebook.com/ajax/ufi/modify.php?__a=1";
        public readonly string CommentLikerPostAjaxFacbookAddCommentUrl = "https://www.facebook.com/ajax/ufi/add_comment.php";
        public readonly string CommentLikerPostAjaxFacbookLikeCommentUrl = "https://www.facebook.com/ajax/like/tooltip.php?comment_fbid=";
        public readonly string CommentLikerGetSafeImageUrl = "https://external.ak.fbcdn.net/safe_image.php?d=AQBdnjAKYo8Xiw7k&url=http%3A%2F%2Fi1.ytimg.com%2Fvi%2FLj0q5O59D2E%2Fmqdefault.jpg";
        public readonly string CommentLikerGetFbsdnImageUrl = "https://static.ak.fbcdn.net/rsrc.php/v2/yh/r/rkQF27utoCR.png";
        public readonly string CommentLikerGetFbAIUrl ="https://www.facebook.com/ai.php?aed=";
        public readonly string CommentLikerPostajaxGenricUrl = "https://www.facebook.com/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet?ajaxpipe=1&ajaxpipe_token=";


        public readonly string ResendConfirmationEmaiSetingAccountSectionUrl = "https://www.facebook.com/settings?tab=account&section=email&view";
        public readonly string ResendConfirmationEmaiSetingAccountResendUrl = "https://www.facebook.com/ajax/settings/account/email/resend.php";

        public readonly string AccountVerificationCheckpointUrl = "https://www.facebook.com/checkpoint/";
        public readonly string AccountVerificationCheckpointNextUrl ="https://www.facebook.com/checkpoint/?next";
        public readonly string AccountVerificationLoginPhpAttempt = "https://www.facebook.com/login.php?login_attempt=1&lwv=110";
        public readonly string AccountVerificationSetingUrl = "https://www.facebook.com/settings?ref=mb";
        public readonly string AccountVerificationRecaptchaApiChallengeUrl = "https://www.google.com/recaptcha/api/challenge?k=";
        public readonly string AccountVerificationRecaptchaApiImageUrl = "https://www.google.com/recaptcha/api/image?c=";
        public readonly string AccountVerificationCaptchaTfimageUrl = "https://www.facebook.com/captcha/tfbimage.php";
        public readonly string AccountVerificationCaptchaTfbimageChallengeUrl = "https://www.facebook.com/captcha/tfbimage.php?captcha_challenge_code=";
        public readonly string AccountVerificationCheckFacebookAccountsidentifyPhpUrl = "https://www.facebook.com/help/identify.php?ctx=recover";
        public readonly string AccountVerificationCheckFacebookAccountsAjaxLoginHelpUrl = "https://www.facebook.com/ajax/login/help/identify.php?ctx=recover";
        public readonly string AccountVerificationCheckFacebookAccountsLoginIdentifyUrl= "https://www.facebook.com/login/identify?ctx=recover";
        public readonly string AccountVerificationCheckRecoverInitiateUrl="https://www.facebook.com/recover/initiate";
        public readonly string AccountVerificationRemoveMobileFromSettingMobileUrl = "https://www.facebook.com/settings?tab=mobile";
        public readonly string AccountVerificationRemoveMobileFromSettingAjaxMobileSetingDeleteUrl = "https://www.facebook.com/ajax/settings/mobile/delete_phone.php";
        public readonly string AccountVerificationRemoveMobileFromSettingAjaxMobileDeletePhoneUrl = "https://www.facebook.com/ajax/settings/mobile/remove_dialog.php";
        public readonly string AccountVerificationRemoveMobileFromSettingTabMobileURL = "https://www.facebook.com/settings?tab=mobile";
        public readonly string AccountVerificationRemoveMobileFromSettingAjaxMobileActivate= "https://www.facebook.com/ajax/mobile/activate.php";
        public readonly string AccountVerificationPhpEmail ="http://www.facebook.com/c.php?email=";

        public readonly string AccountAjaxTimelineEditProfileFavorites ="https://www.facebook.com/ajax/timeline/edit_profile/favorites.php?start_edit=1&__a=1&__user=";


        public readonly string AccountEditProfileNameUrl ="https://www.facebook.com/settings?tab=account&section=name&view";
        public readonly string AccountEditProfileNameSettingTabUrl ="https://www.facebook.com/settings?ref=mb#!/settings?tab=account&section=name&view";
        public readonly string AccountEditProfileNameAjaxSettingAccountUrl = "https://www.facebook.com/ajax/settings/account/name.php";

       
        public readonly string GroupsGroupCampaignManagerGetFaceBookUrl = "https://www.facebook.com/home.php";
        public readonly string GroupsGroupCampaignManagerGetFaceBookWithouthomeUrl = "https://www.facebook.com";
        public readonly string GroupsGroupCampaignManagerGetFaceBookBookMarksUrl = "https://www.facebook.com/bookmarks/groups";
        public readonly string GroupsGroupCampaignManagerGetFaceBookGroupUrl = "https://www.facebook.com/groups/";
        public readonly string GroupsGroupCampaignManagerGetAjaxMentionBootStrapUrl = "https://www.facebook.com/ajax/typeahead/groups/mentions_bootstrap?group_id=";
        public readonly string GroupsGroupCampaignManagerGetAjaxEmiEndPhpUrl = "https://www.facebook.com/ajax/emu/end.php?eid=AQJPY1oZvpxtguzZFFcGB_X1akeo1QcuR55TGjKxH3ZIT8MwbEmwBlpfBosJcfxbTP7NGeh8LgrN9VwuQBjqV2f6pt_Lku4Dbut4pJQ2esIVtKrssyAzyBEACW5qNbWQ8JDb9mOSSQOFhcPRXzKddRwda5B5TLorSpYw-vPSBuh4gow0Ml79aVsqS89cNrOjwehbckLpQs6MPzDOsokDqSvVtLugdNHm-BkXS3oKpgcmjMpaep4Q5VgWpPDiRFE6qzIAiEByBrDRniBh6lMmKeO5nCuSYdr7H0J1l02XwDC0-RjP6rVnIUtfqHIYNZrf7ZdOHALy1yEvGpQC2bUvZKU8XAftXOvfZXzeYiISEib9jJJlYvTu0sYmjx1HEx9tNJxLYBcesCco3ctI4wU3yZOuIoRbDKVjlOP8M86m3fh2wthrVl1f4dvW6IH3qeSu1wgkwFVD4n40CnsxrYdmJb0o-VRS3uldi5CbE2O0wXju777Xiif_rVUpaFYBGBs_1iBrIU-qtVUlq47BjUtRZL6RNG7xWcVly6e5gsfVN_xdm07mx56Dr7BByCBejZ0ar1WoGIR-9kdjXWc0PslX81cni2TAy1ybXfQRGRp5spho3kiCsrVKatvqFm86qgOBgFfXn7YWr9HTrk3XJTb2aPYr7zM2sE-mogf62f99BsMpKsI4nkjOxs37gdBz_k6jtJVVWklOFn-GmpPyPEdQScv0RDdIrzuMNs2WU20HpLzALpUpE3MI3frFchX2SOf57ZjnLJJJj60uEemeCvdVbXQY4H5PSjeEZPdV201_d33WCbLSEMOWHuodaccKidgYbFMyZ7K7Z24VchKpl4YG6oenekc7VIHxcOfLNaMUti1sGYfDLK5HjVW59_8FOM4D3xR_irePOkVOv_u8CgeZCinq55UoVa6mZtC50kcZj8Oowg&f=0&ui=6005004892746-id_4ff190ed406890d02607358&en=fad_hide&ed=true&a=1&__user=";
        public readonly string GroupsGroupCampaignManagerGetAjaxMetacomposerStatusUrl = "https://www.facebook.com/ajax/metacomposer/attachment/status/status.php?isAugmentation=true&targetid=";


        public readonly string GroupsGroupCampaignManagerPostAjaxUpdateStatusUrl = "https://www.facebook.com/ajax/updatestatus.php?__a=1";
        public readonly string GroupsGroupCampaignManagerPostAjaxDialogPostUrl = "https://www.facebook.com/ajax/composerx/attachment/media/chooser/?composerurihash=0";
        public readonly string GroupsGroupCampaignManagerPostUploadPhotosPostUrl = "https://upload.facebook.com/media/upload/photos/composer/?__a=1&__adt=6&__iframe=true&__user=100004608395129";
        public readonly string GroupsGroupCampaignManagerPostUpdateStatusUrl = "https://www.facebook.com/ajax/updatestatus.php";
        public readonly string GroupsGroupCampaignManagerPostLinkScraperUrl = "https://www.facebook.com/ajax/composerx/attachment/link/scraper/?scrape_url=";
        public readonly string GroupsGroupCampaignManagerPostAjaxProfileComposerUrl = "https://www.facebook.com/ajax/profile/composer.php"; 
        public readonly string GroupsGroupCampaignManagerPostAjaxBrowserListGroupMemberUrl = "https://www.facebook.com/ajax/browser/list/group_members/?id=";
        public readonly string GroupsGroupCampaignManagerPostAjaxgenericPhpTimelineProfileAllActivityPagelet ="https://www.facebook.com/ajax/pagelet/generic.php/TimelineProfileAllActivityPagelet?ajaxpipe=1&ajaxpipe_token=";

        public readonly string GroupGroupRequestManagerAjaxGroupsMembership = "https://www.facebook.com/ajax/groups/membership/r2j.php?__a=1";

        public readonly string GroupPostAndDeleteCommentUrl = "https://www.facebook.com/ajax/ufi/add_comment.php";
        public readonly string GroupPostAndDeleteAjaxufidelete_commentUrl= "https://www.facebook.com/ajax/ufi/delete_comment.php";

        public readonly string GroupAjaxTimelineDeleteConfirm = "https://www.facebook.com/ajax/timeline/delete/confirm";
        public readonly string GroupAjaxTimelineDeleteIdentifier = "https://www.facebook.com/ajax/timeline/delete?identifier=";

        public readonly string FriendInfoScraperGetAjaxAllFriendsUrl = "https://www.facebook.com/ajax/pagelet/generic.php/AllFriendsAppCollectionPagelet?data=";


        public readonly string PageFanPageUrlComposerPhpUrl = "https://www.facebook.com/ajax/profile/composer.php";
        public readonly string PageFanPageUrlComposeLinkScraper = "https://www.facebook.com/ajax/composerx/attachment/link/scraper/?scrape_url=";
        public readonly string pageFanPageUrlAjaxMetacomposerLinkUrl="https://www.facebook.com/ajax/metacomposer/attachment/link/scraper.php?scrape_url=";
        public readonly string pageFanPageAjaxMetaComposerTargetidUrl="https://www.facebook.com/ajax/metacomposer/attachment/status/status.php?isAugmentation=true&targetid=";
        public readonly string pageFanPageAjaxPagesFetchColumnPhp="https://www.facebook.com/ajax/pages/fetch_app_column.php?__a=1";
        public readonly string pageFanPagePosterUpdateStatusPhp ="https://www.facebook.com/ajax/updatestatus.php?__a=1";
        public readonly string pageFanPagePosterAjaxPagesFanStatusPhp ="https://www.facebook.com/ajax/pages/fan_status.php?__a=1";
        public readonly string PageFanPagePosterAjaxUfiCommentLikePhp="https://www.facebook.com/ajax/ufi/comment_like.php";
        public readonly string PagePagePosterAjaxUfiLikePhp = "https://www.facebook.com/ajax/ufi/like.php";

        public readonly string PageManagerPagePosterAjaxAjaxPresenceReconnectPhp = "https://www.facebook.com/ajax/presence/reconnect.php?__user=";
        public readonly string PageManagerPageAjaxMercury="https://www.facebook.com/ajax/mercury/thread_sync.php";

       



        #region AccountFraming
        public static bool chkBox_Account_AccountFraming_AccountFramingCheckUnique = false;
        public static bool chkBox_Account_AccountFraming_AutoAcceptFriend = false;
        public static string txt_Account_AccountFraming_NoOfAcceptFriendCount = "5";

        public static bool chkBox_Account_AccountFraming_RandomCommentOnFriendPhoto = false;
        public static string txt_Account_AccountFraming_RandomCommentOnFriendPhoto_Count = "5";

        public static bool chkBox_Account_AccountFraming_RandomLikeOnFriendPhoto = false;
        public static string txt_Account_AccountFraming_RandomLikeOnFriendPhoto_Count = "5";

        public static bool chkBox_Account_AccountFraming_RandomUpdateOnOwnWall = false;
        public static string txt_Account_AccountFraming_NoOfUpdateOnOwnWallCount = "5";

        public static bool chkBox_Account_AccountFraming_LikeOnPagePost = false;
        public static string txt_Account_AccountFraming_NoOfLikeOnPagePostCount = "5";

        public static int AccountFrameworkNoOfhtreads = 5;
        public static int AccountFrameworkMaxDelay = 20;
        public static int AccountFrameworkMinDelay = 10;



 #endregion

        #region Page_Module

        public static List<string> lst_UniqueFanPageReviewDetails = new List<string>();

        #endregion



        //String Flag values

        public readonly string registrationSuccessString = "\"registration_succeeded\":true";
        public readonly string registrationErrorString = "\"error\":";

        public readonly string fdhomepath = @"C:\FaceDominator3.0";
        public readonly string fddatapath = @"C:\FaceDominator3.0\Data";
        public readonly string fddbfilename = @"\FaceDominator.db";
     
        public bool isfreeversion = false;


        /// <summary>
        /// Singleton object declaration.
        /// </summary>
        
        private static volatile FBGlobals globals = null;
        private static object syncRoot = new object(); 

        
        public static FBGlobals Instance
        {
            get
            {
                lock (syncRoot)
                {
                    if (globals == null)
                    {
                        globals = new FBGlobals();
                        
                    }
                }
            return globals;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        private FBGlobals()
        {

        }       
    }
}



namespace FaceDominator2
{
    /// <summary>
    /// Globals is implemented as a singleton. It contains all the Facebook Urls, Parsed Data and Post Data
    /// Globals is Thread Safe.
    /// </summary>
    public class FBGlobalsNew
    {
        /// <summary>
        /// Contains all the accounts and related Information
        /// </summary>       
        // DBC Setting

        public static string dbcUserName = string.Empty;
        public static string dbcPassword = string.Empty;


        public static Dictionary<string, FacebookUser> loadedAccountsDictionary = new Dictionary<string, FacebookUser>();

        public static List<string> listAccounts = new List<string>();

        public static string fbhomeurl = "https://www.facebook.com/";
        public readonly string fbloginurl = "https://www.facebook.com/ajax/register.php?__a=4&post_form_id=";
        public readonly string fbsignupurl = "https://www.facebook.com/ajax/register.php?__a=4&post_form_id=";
        public readonly string fbProfileUrl = "https://www.facebook.com/profile.php?id=";
        public readonly string fbgraphUrl = "https://graph.facebook.com/";
        public readonly string fbeventsUrl = "https://www.facebook.com/events/";
        public readonly string fbMessagesUrl = "https://www.facebook.com/messages/";
        public readonly string fbvideosUrl = "https://www.facebook.com/videos/";
        public readonly string fbLoginPhpUrl = "https://www.facebook.com/login.php";
        public readonly string fbWelcomeUrl = "https://www.facebook.com/?sk=welcome";
        public readonly string fbWhatIsMyIpUrl = "https://www.whatismyip.com";
        public readonly string fbAllFriendsUrl = "https://www.facebook.com/ajax/browser/list/allfriends/";
        public readonly string fbAllFriendsUIdUrl = "https://www.facebook.com/ajax/browser/list/allfriends/?uid=";
        public readonly string fbAjaxTimelineTakeAction = "https://www.facebook.com/ajax/timeline/take_action_on_story.php";
        public readonly string fbajaxTimelineAll_activity = "https://www.facebook.com/ajax/timeline/all_activity";
        public readonly string fbfacebookSearchPhpQUrl = "https://www.facebook.com/search.php?q=";



        public readonly string urlPostTimeLineManageProfile = "https://www.facebook.com/ajax/timeline/activate.php?action=activate&ref=profile_megaphone&__a=1";
        public readonly string urlGetActivateTimeLineManageProfile = "https://www.facebook.com/ajax/timeline/activate.php?action=activate&ref=profile_megaphone&__a=1";
        public readonly string urlPostEducationManageProfile = "https://www.facebook.com/ajax/profile/edit/save_education.php?__a=1";
        public readonly string urlPostCurrentCityAndHomeTownManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?__a=1";
        public readonly string urlPostURLfreshBooksManageProfile = "https://www.facebook.com/ajax/typeahead/record_basic_metrics.php";
        public readonly string urlPostUrlAboutYouManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/bio.php?__a=1";
        public readonly string urlPostUrlWorkIdManageProfile = "https://www.facebook.com/ajax/profile/edit/add_work.php?__a=1";
        public readonly string urlPostUrlWorkManageProfile = "https://www.facebook.com/ajax/profile/edit/add_work.php?__a=1";
        public readonly string urlPostUrlWorkDoneManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/eduwork.php?done=1&__a=1";
        public readonly string urlPostURLQuotationsManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/quotes.php";
        public readonly string urlPostDataUrlBasicInfoManageProfile = "https://www.facebook.com/ajax/timeline/edit_profile/basic_info.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageProfileAjaxUpdateUrl = "https://www.facebook.com/ajax/presence/update.php";
        public readonly string urlPostDataUrlBasicInfoManageEditProfileQuotesUrl = "https://www.facebook.com/ajax/timeline/edit_profile/quotes.php?__user=";
        public readonly string urlPostDataUrlBasicInfoManageTimelineEditProfileContact = "https://www.facebook.com/ajax/timeline/edit_profile/contact_info.php";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileBio = "https://www.facebook.com/ajax/timeline/edit_profile/bio.php?__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileHometown = "https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?ref=about_tab&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearchEduworkInference = "https://www.facebook.com/ajax/typeahead/search/eduwork/inference.php?context=hub_current_city&profilesection=14002&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearchEduworkInferenceHometown = "https://www.facebook.com/ajax/typeahead/search/eduwork/inference.php?context=hub_hometown&profilesection=14001&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileBasicInfo = "https://www.facebook.com/ajax/timeline/edit_profile/basic_info.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileEduWork = "https://www.facebook.com/ajax/timeline/edit_profile/eduwork.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearchPhpValue = "https://www.facebook.com/ajax/typeahead/search.php?value=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTypeaheadSearch = "https://www.facebook.com/ajax/typeahead/search.php?__a=1&value=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineEditProfileBioUser = "https://www.facebook.com/ajax/timeline/edit_profile/bio.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineAppCollectionItemStandardCurationSurfaceCollectionId = "https://www.facebook.com/ajax/timeline/app_collection_item/standard_in_house_og/curation?surface_collection_id=14";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimelineAppCollectionItemAddFbpageSurfaceCollection = "https://www.facebook.com/ajax/timeline/app_collection_item/add/fbpage/?surface_collection_id=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileEditAddExperience = "https://www.facebook.com/ajax/profile/edit/add_experience.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileEditSaveExperience = "https://www.facebook.com/ajax/profile/edit/save_experience.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileEditSaveMediaSection = "https://www.facebook.com/ajax/profile/edit/save_media_section.php?__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileFavoritesUrl = "https://www.facebook.com/ajax/timeline/edit_profile/favorites.php?done_edit=1&__a=1";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineEditProfileHometownUrl = "https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?__a=1&__user=";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineEditProfileHomeTownAboutTabFieldTypeCurrentCityUrl = "https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?ref=about_tab&field_type=current_city";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineEditProfileAboutTabFieldTypeHomeTownUrl = "https://www.facebook.com/ajax/timeline/edit_profile/hometown.php?ref=about_tab&field_type=hometown";
        public readonly string urlPostDataUrlBasicInfoManageAjaxTimeLineProfileAllajaxpipeAjaxpipeToken = "https://www.facebook.com/ajax/pagelet/generic.php/TimelineProfileAllActivityPagelet?ajaxpipe=1&ajaxpipe_token=";

        public readonly string urlPostUrlFriendRequestFirstFriendManager = "https://www.facebook.com/ajax/friends/lists/flyout_content.php?__a=1";
        public readonly string urlPostUrlFriendRequestSecondFriendManager = "https://www.facebook.com/ajax/friends/status.php?__a=1";
        public readonly string urlPostUrlFriendRequestThirdFriendManager = "https://www.facebook.com/ajax/add_friend/action.php?__a=1";
        public readonly string urlPostAddFriendUrlFriendManager = "https://www.facebook.com/ajax/add_friend/action.php";
        public readonly string urlPostAjaxReqsurlFriendManager = "https://www.facebook.com/ajax/reqs.php";
        public readonly string urlGetReqsurlFriendManager = "https://www.facebook.com/reqs.php";
        public readonly string urlGetSentReqsurlFriendManager = "https://www.facebook.com/friends/requests/?fcref=jwl&outgoing=1";
        public readonly string urlGetSearchFriendsFriendManager = "https://www.facebook.com/search/ajax/more.php?offsets[pps]=0&pagesize=100&q=";

        public readonly string createHotmailcheckppsecure = "https://login.live.com/ppsecure/post.srf?ru=http://mail.live.com/?";
        public readonly string createHotmailSignupUrl = "https://signup.live.com/signup.aspx?";
        public readonly string createHotmailInboxUrl = "https://mail.live.com/?rru=inbox";
        public readonly string createHotmailLogoutUrl = "https://co116w.col116.mail.live.com/mail/logout.aspx";
        public readonly string createHotmailMSNUrl = "https://in.msn.com/";
        public readonly string createHotmailSignUpInboxUrl = "https://signup.live.com/signup.aspx?ru=http%3a%2f%2fmail.live.com%2f%3frru%3dinbox&wa=wsignin1.0&rpsnv=11&ct=1261772379&rver=6.0.5285.0&wp=MBI&wreply=http:%2F%2Fmail.live.com%2Fdefault.aspx&lc=1033&id=64855&mkt=en-us&bk=1261772380&rollrs=12&lic=1";

        public readonly string PageManagerAjaxPosterUrl = "https://www.facebook.com/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet?";
        public readonly string PageManagerPagesGetting = "https://www.facebook.com/pages/getting_started?page_id=";
        public readonly string PageManagerPageIdentitySwitchPhp = "https://www.facebook.com/identity_switch.php";
        public readonly string PageManagerPageAjaxComposerx1 = "https://www.facebook.com/ajax/composerx/attachment/media/chooser/?composerurihash=1";
        public readonly string PageManagerPageAjaxComposerx2 = "https://www.facebook.com/ajax/composerx/attachment/media/upload/?composerurihash=2";
        public readonly string pageManagerFanPageScraperSearchResultUrl = "http://www.facebook.com/search/results.php?q=";

        public readonly string PageManagerFanPageLikerstrUrlAed = "https://www.facebook.com/ai.php?";
        public readonly string PageManagerFanPageLikerpostURL1st = "https://www.facebook.com/ajax/pages/fan_status.php?__a=1";
        public readonly string PageManagerFanPageLikerFanStatus = "https://www.facebook.com/ajax/pages/fan_status.php";
        public readonly string PageManagerFanPageLikerpostURL2nd = "https://www.facebook.com/ajax/pages/fetch_app_column.php?__a=1";
        public readonly string PageManagerFanPageGetsharerAppId = "https://www.facebook.com/ajax/sharer/?s=18&appid=";
        public readonly string PageManagerFanPagePostSharerSubmit = "https://www.facebook.com/ajax/sharer/submit/";
        public readonly string PageManagerFanPageLikerPostpostResponse1 = "https://www.facebook.com/ajax/like/tooltip.php?comment_fbid=";
        public readonly string PageManagerFanPageLikerPostpostResponse2 = "https://www.facebook.com/ajax/ufi/like.php";
        public readonly string PageManagerFanPageLikerPostpostResponse = "https://www.facebook.com/ajax/ufi/modify.php?__a=1";
        public readonly string PageManagerFanPageLikerGetResponse = "https://www.facebook.com/ai.php?aed=";
        public readonly string PageManagerFanPageLikerPostcommentResponse = "https://www.facebook.com/ajax/ufi/add_comment.php";
        public readonly string PageManagerFanPageLikerGetScripUrl = "https://www.facebook.com/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet?ajaxpipe=1&ajaxpipe_token=";
        public readonly string PageManagerFanPageLikerGetFmqDefaultJPG = "https://external.ak.fbcdn.net/safe_image.php?d=AQBdnjAKYo8Xiw7k&url=http%3A%2F%2Fi1.ytimg.com%2Fvi%2FLj0q5O59D2E%2Fmqdefault.jpg";
        public readonly string PageManagerFanPageLikerGetUtoCRPNG = "https://static.ak.fbcdn.net/rsrc.php/v2/yh/r/rkQF27utoCR.png";
        public readonly string PageManagerFanPageInviter = "https://www.facebook.com/ajax/pages/invite/send_single/";

        public readonly string EventInviterPostAjaxJoinPHP = "https://www.facebook.com/ajax/events/permalink/join.php";
        public readonly string EventInviterGetAjaxChoosePlan_Id = "https://www.facebook.com/ajax/choose/?type=plan&plan_id=";
        public readonly string EventInviterGetAjaxIncludeAllPlan_Id = "https://www.facebook.com/ajax/plans/typeahead/invite.php?include_all=true&plan_id=";
        public readonly string EventInviterPostAjaxInvitePlan_Id = "https://www.facebook.com/ajax/events/permalink/invite.php?plan_id=";
        public readonly string EventInviterGetAjaxEvent_membersid = "https://www.facebook.com/ajax/browser/list/event_members/?id=";


        public readonly string EventCreatorGetCreateEventUrl = "https://www.facebook.com/events/calendar";
        public readonly string EventCreatorGetAjaxCreateEventDialogUrl = "https://www.facebook.com/ajax/plans/create/dialog.php?__asyncDialog=1&__user=";
        public readonly string EventCreatorPostAjaxCreateEventSaveUrl = "https://www.facebook.com/ajax/plans/create/save.php";


        public readonly string MessageScraperGetMessagesActionReadUrl = "https://www.facebook.com/messages/?action=read&tid=id.";
        public readonly string MessageScraperGetMessagesUrl = "https://www.facebook.com/messages/";
        public readonly string MessageScraperPostAjaxMercuryThreadInfoUrl = "https://www.facebook.com/ajax/mercury/thread_info.php";
        public readonly string MessageScraperGetAjaxMessagingOffsetLimitUrl = "https://www.facebook.com/ajax/messaging/async.php?sk=inbox&offset=0&limit=";
        public readonly string MessageScraperGetAjaxMessagingOffsetUrl = "https://www.facebook.com/ajax/messaging/async.php?sk=inbox&offset=";
        public readonly string MessageScraperPostAjaxMercuryThreadListInfoUrl = "https://www.facebook.com/ajax/mercury/thread_info.php";


        public readonly string GroupInviterPostAjaxGroupsMembersAddUrl = "https://www.facebook.com/ajax/groups/members/add_post.php";


        public readonly string PhotoTaggingPostAjaxTagsAlbumUrl = "https://www.facebook.com/ajax/photos/photo/tags/tags_album.php?__a=1";
        public readonly string PhotoTaggingPostAjaxPhotoTaggingAjaxUrl = "https://www.facebook.com/ajax/photo_tagging_ajax.php?__a=1";


        public readonly string MessageReplyGetAjaxAsyncDialogUrl = "https://www.facebook.com/ajax/messaging/async.php?action=composerDialog&__a=1&causal_element=js_3&__asyncDialog=3&__user=";
        public readonly string MessageReplyPostAjaxMessagingSendUrl = "https://www.facebook.com/ajax/messaging/send.php?__a=1";
        public readonly string MessageReplyPostAjaxMessagingPhp = "https://www.facebook.com/ajax/messaging/async.php?sk=inbox&action=read&tid=id.331895363542575&page&query&__a=1";


        public readonly string WallPosterPostAjaxUpdateStatusUrl = "https://www.facebook.com/ajax/updatestatus.php?__a=1";
        public readonly string WallPosterGetAjaxSatusIsAugmentationUrl = "https://www.facebook.com/ajax/metacomposer/attachment/status/status.php?isAugmentation=true&targetid=";
        public readonly string WallPosterGetAjaxScraperUrl = "https://www.facebook.com/ajax/metacomposer/attachment/link/scraper.php?scrape_url=";
        public readonly string WallPosterGetAjaxComposerScraperUrl = "https://www.facebook.com/ajax/composerx/attachment/link/scraper/?scrape_url=";
        public readonly string WallPosterGetSafeImageUrl = "https://external.ak.fbcdn.net/safe_image.php?d=AQD9xXmNexloERcj&url=http%3A%2F%2Fwww.google.co.in%2Fimages%2Fgoogle_favicon_128.png";
        public readonly string WallPosterPostAjaxProfileComposerUrl = "https://www.facebook.com/ajax/profile/composer.php";
        public readonly string WallPosterPostAjaxBzUrl = "https://www.facebook.com/ajax/bz";


        public readonly string PostPicOnWallPostAjaxComposeUriHashUrl = "https://www.facebook.com/ajax/composerx/attachment/media/chooser/?composerurihash=1";
        public readonly string PostPicOnWallPostUploadPhotosUrl = "https://upload.facebook.com/media/upload/photos/composer/?__user=";
        public readonly string PostPicOnWallPostAjaxCitySharerResetUrl = "https://www.facebook.com/ajax/places/city_sharer_reset.php";


        public readonly string CommentLikerPostAjaxFacbookLikeUrl = "https://www.facebook.com/ajax/ufi/like.php";
        public readonly string CommentLikerPostAjaxFacbookModifyUrl = "https://www.facebook.com/ajax/ufi/modify.php?__a=1";
        public readonly string CommentLikerPostAjaxFacbookAddCommentUrl = "https://www.facebook.com/ajax/ufi/add_comment.php";
        public readonly string CommentLikerPostAjaxFacbookLikeCommentUrl = "https://www.facebook.com/ajax/like/tooltip.php?comment_fbid=";
        public readonly string CommentLikerGetSafeImageUrl = "https://external.ak.fbcdn.net/safe_image.php?d=AQBdnjAKYo8Xiw7k&url=http%3A%2F%2Fi1.ytimg.com%2Fvi%2FLj0q5O59D2E%2Fmqdefault.jpg";
        public readonly string CommentLikerGetFbsdnImageUrl = "https://static.ak.fbcdn.net/rsrc.php/v2/yh/r/rkQF27utoCR.png";
        public readonly string CommentLikerGetFbAIUrl = "https://www.facebook.com/ai.php?aed=";
        public readonly string CommentLikerPostajaxGenricUrl = "https://www.facebook.com/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet?ajaxpipe=1&ajaxpipe_token=";


        public readonly string ResendConfirmationEmaiSetingAccountSectionUrl = "https://www.facebook.com/settings?tab=account&section=email&view";
        public readonly string ResendConfirmationEmaiSetingAccountResendUrl = "https://www.facebook.com/ajax/settings/account/email/resend.php";

        public readonly string AccountVerificationCheckpointUrl = "https://www.facebook.com/checkpoint/";
        public readonly string AccountVerificationCheckpointNextUrl = "https://www.facebook.com/checkpoint/?next";
        public readonly string AccountVerificationLoginPhpAttempt = "https://www.facebook.com/login.php?login_attempt=1&lwv=110";
        public readonly string AccountVerificationSetingUrl = "https://www.facebook.com/settings?ref=mb";
        public readonly string AccountVerificationRecaptchaApiChallengeUrl = "https://www.google.com/recaptcha/api/challenge?k=";
        public readonly string AccountVerificationRecaptchaApiImageUrl = "https://www.google.com/recaptcha/api/image?c=";
        public readonly string AccountVerificationCaptchaTfimageUrl = "https://www.facebook.com/captcha/tfbimage.php";
        public readonly string AccountVerificationCaptchaTfbimageChallengeUrl = "https://www.facebook.com/captcha/tfbimage.php?captcha_challenge_code=";
        public readonly string AccountVerificationCheckFacebookAccountsidentifyPhpUrl = "https://www.facebook.com/help/identify.php?ctx=recover";
        public readonly string AccountVerificationCheckFacebookAccountsAjaxLoginHelpUrl = "https://www.facebook.com/ajax/login/help/identify.php?ctx=recover";
        public readonly string AccountVerificationCheckFacebookAccountsLoginIdentifyUrl = "https://www.facebook.com/login/identify?ctx=recover";
        public readonly string AccountVerificationCheckRecoverInitiateUrl = "https://www.facebook.com/recover/initiate";
        public readonly string AccountVerificationRemoveMobileFromSettingMobileUrl = "https://www.facebook.com/settings?tab=mobile";
        public readonly string AccountVerificationRemoveMobileFromSettingAjaxMobileSetingDeleteUrl = "https://www.facebook.com/ajax/settings/mobile/delete_phone.php";
        public readonly string AccountVerificationRemoveMobileFromSettingAjaxMobileDeletePhoneUrl = "https://www.facebook.com/ajax/settings/mobile/remove_dialog.php";
        public readonly string AccountVerificationRemoveMobileFromSettingTabMobileURL = "https://www.facebook.com/settings?tab=mobile";
        public readonly string AccountVerificationRemoveMobileFromSettingAjaxMobileActivate = "https://www.facebook.com/ajax/mobile/activate.php";
        public readonly string AccountVerificationPhpEmail = "http://www.facebook.com/c.php?email=";

        public readonly string AccountAjaxTimelineEditProfileFavorites = "https://www.facebook.com/ajax/timeline/edit_profile/favorites.php?start_edit=1&__a=1&__user=";


        public readonly string AccountEditProfileNameUrl = "https://www.facebook.com/settings?tab=account&section=name&view";
        public readonly string AccountEditProfileNameSettingTabUrl = "https://www.facebook.com/settings?ref=mb#!/settings?tab=account&section=name&view";
        public readonly string AccountEditProfileNameAjaxSettingAccountUrl = "https://www.facebook.com/ajax/settings/account/name.php";


        public readonly string GroupsGroupCampaignManagerGetFaceBookUrl = "https://www.facebook.com/home.php";
        public readonly string GroupsGroupCampaignManagerGetFaceBookWithouthomeUrl = "https://www.facebook.com";
        public readonly string GroupsGroupCampaignManagerGetFaceBookBookMarksUrl = "https://www.facebook.com/bookmarks/groups";
        public readonly string GroupsGroupCampaignManagerGetFaceBookGroupUrl = "https://www.facebook.com/groups/";
        public readonly string GroupsGroupCampaignManagerGetAjaxMentionBootStrapUrl = "https://www.facebook.com/ajax/typeahead/groups/mentions_bootstrap?group_id=";
        public readonly string GroupsGroupCampaignManagerGetAjaxEmiEndPhpUrl = "https://www.facebook.com/ajax/emu/end.php?eid=AQJPY1oZvpxtguzZFFcGB_X1akeo1QcuR55TGjKxH3ZIT8MwbEmwBlpfBosJcfxbTP7NGeh8LgrN9VwuQBjqV2f6pt_Lku4Dbut4pJQ2esIVtKrssyAzyBEACW5qNbWQ8JDb9mOSSQOFhcPRXzKddRwda5B5TLorSpYw-vPSBuh4gow0Ml79aVsqS89cNrOjwehbckLpQs6MPzDOsokDqSvVtLugdNHm-BkXS3oKpgcmjMpaep4Q5VgWpPDiRFE6qzIAiEByBrDRniBh6lMmKeO5nCuSYdr7H0J1l02XwDC0-RjP6rVnIUtfqHIYNZrf7ZdOHALy1yEvGpQC2bUvZKU8XAftXOvfZXzeYiISEib9jJJlYvTu0sYmjx1HEx9tNJxLYBcesCco3ctI4wU3yZOuIoRbDKVjlOP8M86m3fh2wthrVl1f4dvW6IH3qeSu1wgkwFVD4n40CnsxrYdmJb0o-VRS3uldi5CbE2O0wXju777Xiif_rVUpaFYBGBs_1iBrIU-qtVUlq47BjUtRZL6RNG7xWcVly6e5gsfVN_xdm07mx56Dr7BByCBejZ0ar1WoGIR-9kdjXWc0PslX81cni2TAy1ybXfQRGRp5spho3kiCsrVKatvqFm86qgOBgFfXn7YWr9HTrk3XJTb2aPYr7zM2sE-mogf62f99BsMpKsI4nkjOxs37gdBz_k6jtJVVWklOFn-GmpPyPEdQScv0RDdIrzuMNs2WU20HpLzALpUpE3MI3frFchX2SOf57ZjnLJJJj60uEemeCvdVbXQY4H5PSjeEZPdV201_d33WCbLSEMOWHuodaccKidgYbFMyZ7K7Z24VchKpl4YG6oenekc7VIHxcOfLNaMUti1sGYfDLK5HjVW59_8FOM4D3xR_irePOkVOv_u8CgeZCinq55UoVa6mZtC50kcZj8Oowg&f=0&ui=6005004892746-id_4ff190ed406890d02607358&en=fad_hide&ed=true&a=1&__user=";
        public readonly string GroupsGroupCampaignManagerGetAjaxMetacomposerStatusUrl = "https://www.facebook.com/ajax/metacomposer/attachment/status/status.php?isAugmentation=true&targetid=";


        public readonly string GroupsGroupCampaignManagerPostAjaxUpdateStatusUrl = "https://www.facebook.com/ajax/updatestatus.php?__a=1";
        public readonly string GroupsGroupCampaignManagerPostAjaxDialogPostUrl = "https://www.facebook.com/ajax/composerx/attachment/media/chooser/?composerurihash=0";
        public readonly string GroupsGroupCampaignManagerPostUploadPhotosPostUrl = "https://upload.facebook.com/media/upload/photos/composer/?__a=1&__adt=6&__iframe=true&__user=100004608395129";
        public readonly string GroupsGroupCampaignManagerPostUpdateStatusUrl = "https://www.facebook.com/ajax/updatestatus.php";
        public readonly string GroupsGroupCampaignManagerPostLinkScraperUrl = "https://www.facebook.com/ajax/composerx/attachment/link/scraper/?scrape_url=";
        public readonly string GroupsGroupCampaignManagerPostAjaxProfileComposerUrl = "https://www.facebook.com/ajax/profile/composer.php";
        public readonly string GroupsGroupCampaignManagerPostAjaxBrowserListGroupMemberUrl = "https://www.facebook.com/ajax/browser/list/group_members/?id=";
        public readonly string GroupsGroupCampaignManagerPostAjaxgenericPhpTimelineProfileAllActivityPagelet = "https://www.facebook.com/ajax/pagelet/generic.php/TimelineProfileAllActivityPagelet?ajaxpipe=1&ajaxpipe_token=";

        public readonly string GroupGroupRequestManagerAjaxGroupsMembership = "https://www.facebook.com/ajax/groups/membership/r2j.php?__a=1";

        public readonly string GroupPostAndDeleteCommentUrl = "https://www.facebook.com/ajax/ufi/add_comment.php";
        public readonly string GroupPostAndDeleteAjaxufidelete_commentUrl = "https://www.facebook.com/ajax/ufi/delete_comment.php";

        public readonly string GroupAjaxTimelineDeleteConfirm = "https://www.facebook.com/ajax/timeline/delete/confirm";
        public readonly string GroupAjaxTimelineDeleteIdentifier = "https://www.facebook.com/ajax/timeline/delete?identifier=";

        public readonly string FriendInfoScraperGetAjaxAllFriendsUrl = "https://www.facebook.com/ajax/pagelet/generic.php/AllFriendsAppCollectionPagelet?data=";


        public readonly string PageFanPageUrlComposerPhpUrl = "https://www.facebook.com/ajax/profile/composer.php";
        public readonly string PageFanPageUrlComposeLinkScraper = "https://www.facebook.com/ajax/composerx/attachment/link/scraper/?scrape_url=";
        public readonly string pageFanPageUrlAjaxMetacomposerLinkUrl = "https://www.facebook.com/ajax/metacomposer/attachment/link/scraper.php?scrape_url=";
        public readonly string pageFanPageAjaxMetaComposerTargetidUrl = "https://www.facebook.com/ajax/metacomposer/attachment/status/status.php?isAugmentation=true&targetid=";
        public readonly string pageFanPageAjaxPagesFetchColumnPhp = "https://www.facebook.com/ajax/pages/fetch_app_column.php?__a=1";
        public readonly string pageFanPagePosterUpdateStatusPhp = "https://www.facebook.com/ajax/updatestatus.php?__a=1";
        public readonly string pageFanPagePosterAjaxPagesFanStatusPhp = "https://www.facebook.com/ajax/pages/fan_status.php?__a=1";
        public readonly string PageFanPagePosterAjaxUfiCommentLikePhp = "https://www.facebook.com/ajax/ufi/comment_like.php";
        public readonly string PagePagePosterAjaxUfiLikePhp = "https://www.facebook.com/ajax/ufi/like.php";

        public readonly string PageManagerPagePosterAjaxAjaxPresenceReconnectPhp = "https://www.facebook.com/ajax/presence/reconnect.php?__user=";
        public readonly string PageManagerPageAjaxMercury = "https://www.facebook.com/ajax/mercury/thread_sync.php";





        #region AccountFraming
        public static bool chkBox_Account_AccountFraming_AccountFramingCheckUnique = false;
        public static bool chkBox_Account_AccountFraming_AutoAcceptFriend = false;
        public static string txt_Account_AccountFraming_NoOfAcceptFriendCount = "5";

        public static bool chkBox_Account_AccountFraming_RandomCommentOnFriendPhoto = false;
        public static string txt_Account_AccountFraming_RandomCommentOnFriendPhoto_Count = "5";

        public static bool chkBox_Account_AccountFraming_RandomLikeOnFriendPhoto = false;
        public static string txt_Account_AccountFraming_RandomLikeOnFriendPhoto_Count = "5";

        public static bool chkBox_Account_AccountFraming_RandomUpdateOnOwnWall = false;
        public static string txt_Account_AccountFraming_NoOfUpdateOnOwnWallCount = "5";

        public static bool chkBox_Account_AccountFraming_LikeOnPagePost = false;
        public static string txt_Account_AccountFraming_NoOfLikeOnPagePostCount = "5";

        public static int AccountFrameworkNoOfhtreads = 5;
        public static int AccountFrameworkMaxDelay = 20;
        public static int AccountFrameworkMinDelay = 10;



        #endregion


        //String Flag values

        public readonly string registrationSuccessString = "\"registration_succeeded\":true";
        public readonly string registrationErrorString = "\"error\":";

        public readonly string fdhomepath = @"C:\FaceDominator3.0";
        public readonly string fddatapath = @"C:\FaceDominator3.0\Data";
        public readonly string fddbfilename = @"\FaceDominator.db";

        public bool isfreeversion = false;


        /// <summary>
        /// Singleton object declaration.
        /// </summary>

        private static volatile FBGlobalsNew globals = null;
        private static object syncRoot = new object();

       


        public static FBGlobalsNew Instance
        {
            get
            {
                lock (syncRoot)
                {
                    if (globals == null)
                    {
                        globals = new FBGlobalsNew();

                    }
                }
                return globals;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        private FBGlobalsNew()
        {

        }
    }
}