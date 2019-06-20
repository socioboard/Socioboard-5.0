<nav id="sidebar">
    <div id="dismiss">
        <i class="fas fa-arrow-left"></i>
    </div>

    <div class="sidebar-header">
        <h3>SocioBoard</h3>
    </div>

    <ul class="list-unstyled">
        <li class="active">
            <a href="{{env('APP_URL')}}dashboard/{{session()->get('team')['teamSocialAccountDetails'][0][0]->team_id}}">Dashboard</a>
        </li>
        <li>
            <a href="#engagementSubmenu" data-toggle="collapse" aria-expanded="false" title="You can see and perform activities for twitter accounts">Engagement</a>
            <ul class="collapse list-unstyled" id="engagementSubmenu">
                <li>
                    <a href="#" title="Here you can see the Twitter account Message of Mention, Retweet, and New followers. You can perform additionally Task and Filter according to your Message type">Twitter
                        Analytics</a>
                </li>
                <li>
                    <a href="#" title="You can send messages and also see your Twitter account Direct Messages. You are also allowed to add a task">Twitter
                        Inbox</a>
                </li>
                <li>
                    <a href="#" title="You can see all the tasks which are assigned by you and your team members. You can perform additionally Reply, Delete and complete the Task">My
                        Task</a>
                </li>
                <li>
                    <a href="#" title="Where user can see the comments and manage them for Admin Youtube accounts and Youtube accounts of the group members">Youtube
                        Inbox </a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#feedsSubmenu" data-toggle="collapse" aria-expanded="false" title="You can see all posts of the respective profiles">Feeds</a>
            <ul class="collapse list-unstyled" id="feedsSubmenu">
                <li>
                    <a href="#" title="Facebook Live Feeds is constantly updating the list of stories in the middle of your homepage. Live Feeds includes status updates, photos, videos, and links activity">Facebook</a>
                </li>
                <li>
                    <a href="#" title="You can see your followers and following tweets. In addition, you can perform Re-tweet, Make Favorite, Sent Message, Spam, Reply, Task, Re-socio, and Reconnect">Twitter</a>
                </li>
                <li>
                    <a href="#" title="Instagram Feed page displays all the live activities been performed in Instagram like images, videos. In addition, you can Like, Comment, and create Task for the team members">Instagram</a>
                </li>
                <li>
                    <a href="#" title="you can see your YouTube channel and watch or upload videos. Additional tasks like adding a comment, sort and Upload a new video">Youtube</a>
                </li>
                <li>
                    <a href="#" title="You can find the page posts in LinkedIn page which is done through socioboard and LinkedIn page. In addition, you can add Comments and assign task to your team members">Linkedin</a>
                </li>
                <li>
                    <a href="#" title="You can see your Google Plus account live feeds and the Number of comment, like and share. You can also perform Reconnect, filter, and Re-socio">Google-plus</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#publishingSubmenu" data-toggle="collapse" aria-expanded="false" title="Using Socioboard publishing tool, a user can 'Schedule Messages', save them to 'Drafts', maintain 'SocioQueue' where they can edit or delete their Scheduled Messages and can check 'Calendar view' where they can see the detailed list of posts scheduled with date and time">Publishing</a>
            <ul class="collapse list-unstyled" id="publishingSubmenu">
                <li>
                    <a href="{{env('APP_URL')}}publish" title="Users Can Schedule Messages here by 'Selecting Profiles' which they need to post">Schedule
                        Messages</a>
                </li>
                <li>
                    <a href="#" title="The 'Scheduled Messages' will appear here in the Queue until the time of publishing, Providing Options to users like Edit or Delete the Schedules">SocioQueue</a>
                </li>
                <li>
                    <a href="#" title="Users Can Schedule Messages on day basis here by 'Selecting Profiles' which they need to post">Day
                        Wise SocioQueue</a>
                </li>
                <li>
                    <a href="#" title="The Posts which are Saved to 'Drafts' will appear here, providing user options to Edit, Delete or Schedule the Stored Drafts">Drafts</a>
                </li>
                <li>
                    <a href="#" title="Users can view details of their posts made through their 'Socioboard' account, it provides a detailed description of Posts, Date and Time of Schedules done">Calendar
                        View</a>
                </li>
                <li>
                    <a href="#" title="You can see all your history for sent messages which are done through socioboard like (Compose, Schedule, Re-socio). In addition, you can Filter these Messages">History</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#ContentStudioSubmenu" data-toggle="collapse" aria-expanded="false" title="You will get details about 'Most Shared' Content and 'Trending Now' Topics">Content
                Studio</a>
            <ul class="collapse list-unstyled" id="ContentStudioSubmenu">
                <li>
                    <a href="#" title="You will get details about 'Most shared' Feeds from Facebook, Linkedin, Twitter, Pinterest and Google Plus Networks">Most
                        Shared</a>
                </li>
                <li>
                    <a href="#" title="The Trending data from Social Networks will be shown here, and users can also search topics by giving keyword there">Trending
                        Now</a>
                </li>
                <li>
                    <a href="#" title="You can see the list of all posts in the queue which are shared via shareathon From 'Most shared' and 'Trending Now' Features, and have a choice to Edit or Delete the selected Feed">Shareathon
                        Queue</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#DiscoverySubmenu" data-toggle="collapse" aria-expanded="false" title="You can 'Search' by giving Keywords, and can find 'Group Post' of similar interests and can see the 'Suggestions' where a user can find Followers and Following list in all the social media profiles">Discovery</a>
            <ul class="collapse list-unstyled" id="DiscoverySubmenu">
                <li>
                    <a href="#DiscoverySearchSubmenu" data-toggle="collapse" aria-expanded="false" title="You can find people or interests from different Networks by providing a keyword">Search</a>
                    <ul class="collapse list-unstyled" id="DiscoverySearchSubmenu">
                        <li>
                            <a href="#" title="By Searching a Keyword here, the user can get details about that keyword from Twitter, Google Plus, and Instagram Networks">Discovery</a>
                        </li>
                        <li>
                            <a href="#" title="Here the user can Enter a Keyword of interest and can also choose feeds from an area or place of their interest">Smart
                                Search</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#DiscoveryGroupPostSubmenu" data-toggle="collapse" aria-expanded="false">Group Post</a>
                    <ul class="collapse list-unstyled" id="DiscoveryGroupPostSubmenu">
                        <li>
                            <a href="#" title="Here users can enter a keyword they can get the posts of their interest from a Facebook network which are posted through socioboard and can Schedule or Compose them to their profiles by 1-Click">Facebook
                                Group Post</a>
                        </li>
                        <li>
                            <a href="#" title="Here users by entering a keyword they can get the posts of their interest from Linkedin Network which is posted through Socioboard and can schedule or Compose them to their profiles by 1-Click">LinkedIn
                                Group Post</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </li>
        <li>
            <a href="#AutomateRssFeedsSubmenu" data-toggle="collapse" aria-expanded="false">AutoMate Rss Feeds</a>
            <ul class="collapse list-unstyled" id="AutomateRssFeedsSubmenu">
                <li>
                    <a href="#" title="In this module, we have all the latest topics and trending keywords based on which we can schedule or compose in the content feed">Content
                        Feeds</a>
                </li>
                <li>
                    <a href="#" title="In this module, you can Automate the RSS feeds with respective profiles. Here you need to select profile's, add RSS Feeds URL based on what you want to automate next. Click on schedule and it will post respective data in chosen profiles">Automate
                        Rss Feeds</a>
                </li>
                <li>
                    <a href="#" title="You can verify the schedule RSS feeds that in which profiles the RSS feeds is posted and what message is posted and RSS Feeds URL w.r.t the profiles">Posted
                        Rss Feeds</a>
                </li>
                <li>
                    <a href="#" title="When you schedule RSS feeds in AutoMate RSS Feeds sub-module, it comes to RSS Queue">Rss
                        Queue</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#ShareathonSubmenu" data-toggle="collapse" aria-expanded="false" title="This is the feature which allows users to Automate FB Page Posts, FB Groups, Pages, and Timeline of our FB profiles Connected with Socioboard">Shareathon</a>
            <ul class="collapse list-unstyled" id="ShareathonSubmenu">
                <li>
                    <a href="#" title="It automates feeds from Selected page to the FB Account Timeline that is Connected with Socioboard">Page
                        Shareathon</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#ImageLibrarySubmenu" data-toggle="collapse" aria-expanded="false" title="Here you can upload the image and GIF files">Image
                Library</a>
            <ul class="collapse list-unstyled" id="ImageLibrarySubmenu">
                <li>
                    <a href="#" title="Here you can upload the image and GIF files by clicking upload Image which is not accessible to your team members">Private
                        Library</a>
                </li>
                <li>
                    <a href="#" title="Here you can upload the image and GIF files by clicking upload Image which is accessible to your team members">Public
                        Library</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#">Board Me</a>
        </li>
    </ul>
</nav>