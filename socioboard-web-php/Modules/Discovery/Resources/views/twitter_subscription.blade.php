@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Twitter</title>
@endsection
@section('content')

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->

            <div class="container-fluid">
                <div class="text-center card-title font-weight-bolder mt-3">
                    <h2>Find the best Twitter influencers for your business.</h2>
                </div>
                @if($accountId !== '')
                <script>
                    var twtId = <?php echo $accountId ?>;
                </script>
                @endif
                @if($twitterAccounts !== null)
                <div class="row d-flex align-items-center justify-content-center filterDiv">
                    <div class="col-md-3">
                        <div class="form-group mb-0">
                            <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 selectDiv" name="twitter_id" id="twitter_id" onchange="change(this)">
                                @foreach($twitterAccounts['account'] as $twitter)
                                    <option value="{{$twitter->account_id}}">{{$twitter->user_name}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="form-group mb-0">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="keyword" id="keyword"
                                       autocomplete="off" placeholder="Search by username" />
                                <span><i class="fa fa-search"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button type="reset" class="btn font-weight-bolder px-8 twitter-subscription-btn" onclick="searchUser()">Search</button>
                    </div>
                    <div class="col-md-2">
                        <ul class="nav nav-bold nav-pills px-8 subscription-view" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active show" data-toggle="tab" href="#twittersubscription-grid"><i class="fas fa-th gridView"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-toggle="tab" href="#twittersubscription-list"><i class="fas fa-list listView"></i></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <br>
                    <div id="processing" class="col-md-7 ml-auto" style="alignment: center"></div>
                <!--begin::Content-->
                <div class="tab-content">
                    <!--begin::Tabpane-->
                    <div class="tab-pane active show" id="twittersubscription-grid" role="tabpanel">
                        <div class="row" id="appendData">

                        </div>
                        <div id="loaders" style="alignment: center">

                        </div>
                    </div>
                    <!--end::Tabpane-->

                    <!--begin::Twitter subscription list view-->
                    <div class="tab-pane" id="twittersubscription-list" role="tabpanel">
                        <div class="card mt-15">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-5"></div>
                                    <div class="col-md-2"></div>
                                    <div class="col-md-5">
                                        <div class="row">
                                            <div class="col-md-3">
                                                <div class="twitter-media-title">
                                                    Total tweets
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="twitter-media-title">
                                                    Followers
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="twitter-media-title">
                                                    Following
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div id="list_view">
                                </div>
                            </div>

                        </div>
                    </div>
                    <!--end::Twitter subscription list view-->
                </div>
                @else
                    <div class="card-body noTwitterAccountsDivAdded">
                        <div class="text-center">
                            <div class="symbol symbol-150">
                                <img src="/media/svg/illustrations/no-feeds.svg" class="">
                            </div>
                            <h6>Currently no Twitter accounts added. Please add twitter accounts to proceed</h6>
                        </div>
                    </div>
                    @endif
                <!--end::Content-->
            </div>

            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->

        @endsection

        @section('page-scripts')
            <script type="text/javascript">
                pageId = 1;
                $(document).ready(function () {
                    $("#boards").trigger('click');

                })

                $(document).ready(function () {
                    $("#discovery").trigger('click');
                    let keywordValue = "politics";
                   getInfluencers(twtId, keywordValue, pageId);
                })
                function getInfluencers(id, keywordValue , pageId){
                    $.ajax({
                        type: "get",
                        url: "/discovery/get-twitter-influencers",
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        beforeSend: function () {
                            $('#processing').empty().append('<h3><i class="fa fa-spinner fa-spin"></i>&nbsp;Loading...</h3>');
                        },
                        data: {id, keywordValue, pageId},
                        success: function (response) {
                            $('#processing').empty();
                            let appendData = [];
                            let appendList = [];
                            response.data.data.map(data => {
                                let screenname = "'" + data.screen_name + "'";
                                appendData += '<div class="col-md-6 col-lg-4 col-xl-3">\n' +
                                    '                                <div class="card twittersubscription-card">\n' +
                                    '                                    <div class="twitter-card">\n' +
                                    '                                        <img src="'+data.profile_image_url+'" class="card-img-top" alt="...">\n' +
                                    '                                    </div>\n' +
                                    '                                    <div class="card-body p-3">\n' +
                                    '                                        <div class="text-center">\n' +
                                    '                                            <h4 class="card-title mb-2">'+data.screen_name+' <i class="fas fa-check-circle"></i>\n' +
                                    '                                            </h4>\n' +
                                    '                                        </div>\n' +
                                    '                                        <div class="text-center">\n' +
                                    data.name +
                                    '                                        </div>\n' +
                                    '                                        <hr />\n' +
                                    '                                        <div class="d-flex justify-content-center social-subscriptions">\n' +
                                    '                                            <div class="social-subscriptions-inner">\n' +
                                    '                                                <div class="start-item text-center">\n' +
                                    '                                                    <div class="start-item-name">\n' +
                                    '                                                        <p class="mb-1">Tweets</p>\n' +
                                    '                                                    </div>\n' +
                                    '                                                    <div class="start-item-value">\n' +
                                    '                                                        <h3 class="font-weight-bolder font-size-lg">'+data.statuses_count+'</h3>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="start-item text-center">\n' +
                                    '                                                    <div class="start-item-name">\n' +
                                    '                                                        <p class="mb-1">Followers</p>\n' +
                                    '                                                    </div>\n' +
                                    '                                                    <div class="start-item-value">\n' +
                                    '                                                        <h3 class="font-weight-bolder font-size-lg">'+data.followers_count+'</h3>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="start-item text-center">\n' +
                                    '                                                    <div class="start-item-name">\n' +
                                    '                                                        <p class="mb-1">Following</p>\n' +
                                    '                                                    </div>\n' +
                                    '                                                    <div class="start-item-value">\n' +
                                    '                                                        <h3 class="font-weight-bolder font-size-lg">'+data.friends_count+'</h3>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>\n' +
                                    '                                        <hr />\n' +
                                    '                                        <div class="twitter-social-icons mb-3">\n' +
                                    '<div id="follow_status'+data.screen_name+'">' +
                                    (data.following === true ? '<a onclick=\"unfollowUser('+screenname+')\" class=\"btn social-icons followButtonDiv\"><i class=\"fas fa-user-check\" ></i>following</a>\n' : ' <a onclick="followUser('+screenname+')" class="btn social-icons"><i class="fas fa-user-plus" ></i>follow</a>\n') +
                                    '</div>' +
                                    '                                       </div>\n' +
                                    '                                    </div>\n' +
                                    '                                </div>\n' +
                                    '                            </div>';

                                appendList += ' <div class="row d-flex align-items-center twitter-wrapper">\n' +
                                    '                                    <div class="col-md-5">\n' +
                                    '                                        <div class="d-flex align-items-center">\n' +
                                    '                                            <div class="twitter-card">\n' +
                                    '                                                <img src="'+data.profile_image_url+'" class="card-img-top" alt="...">\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="twiiter-details">\n' +
                                    '                                                <div>\n' +
                                    '                                                    <h4 class="card-title mb-2">'+data.screen_name+' <i class="fas fa-check-circle"></i>\n' +
                                    '                                                    </h4>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="">\n' +
                                    data.name +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>\n' +
                                    '                                    </div>\n' +
                                    '                                    <div class="col-md-2">\n' +
                                    '                                        <div class="twitter-social-icons mb-3">\n' +
                                    '<div id="follow_statuss'+data.screen_name+'">' +
                                    (data.following === true ? '<a onclick=\"unfollowUser('+screenname+')\" class="social-icons followButtonDiv"><i class="fas fa-user-check"></i> Following</a>\n' : '<a onclick="followUser('+screenname+')" class="social-icons"><i class="fas fa-user-plus"></i> follow</a>\n')+
                                    '</div>' +
                                    '            </div>\n' +
                                    '                                    </div>\n' +
                                    '                                    <div class="col-md-5">\n' +
                                    '                                        <div class="row">\n' +
                                    '                                            <div class="col-md-3">\n' +
                                    '                                                <div class="twitter-media">\n' +
                                    '                                                    <b>'+data.statuses_count+'</b>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="col-md-3">\n' +
                                    '                                                <div class="twitter-media">\n' +
                                    '                                                    <b>'+data.followers_count+'</b>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="col-md-3">\n' +
                                    '                                                <div class="twitter-media">\n' +
                                    '                                                    <b>'+data.friends_count+'</b>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>\n' +
                                    '                                    </div>\n' +
                                    '                                </div>\n' +
                                    '                                </div>';

                            })
                            $('#appendData').empty().append(appendData)
                            $('#list_view').empty().append(appendList)

                        },
                        error: function (error) {
                            $('#processing').empty();
                        },
                    });
                }

                function searchUser() {
                   let id =  $('#twitter_id').val();
                   let keywordValue =  $('#keyword').val();
                   if (keywordValue === ""){
                       toastr.error('Please enter the keyword for searching');
                   }
                   let pageId = 1
                    getInfluencers(id, keywordValue, pageId);
                }

                function followUser(screenName) {
                    let status = 'follow';
                    let id =  $('#twitter_id').val();
                    let name = "'" + screenName + "'";
                    $.ajax({
                        type: "get",
                        url: "/discovery/follow-twitter-influencers-by-username",
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        data: {screenName,status,id},
                        success: function (response) {
                            if (response.code === 200){
                                toastr.success(response.message);
                                $('#follow_status'+screenName).empty().append('<a onclick="unfollowUser('+name+')" class="btn social-icons followButtonDiv"><i class="fas fa-user-check" ></i>Following</a>')
                                $('#follow_statuss'+screenName).empty().append('<a onclick="unfollowUser('+name+')" class="social-icons followButtonDiv"><i class="fas fa-user-check"></i> Following</a>')
                            }
                        },
                        error: function (error) {
                            $('#processing').empty();
                        },
                    });
                }

                function unfollowUser(screenName) {
                    let status = 'unfollow';
                    let name = "'" + screenName + "'";
                    let id =  $('#twitter_id').val();
                    $.ajax({
                        type: "get",
                        url: "/discovery/follow-twitter-influencers-by-username",
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        data: {screenName,status,id},
                        success: function (response) {
                            if (response.code === 200){
                                $('#follow_status'+screenName).empty().append('<a onclick="followUser('+name+')" class="btn social-icons"><i class="fas fa-user-plus" ></i>follow</a>')
                                $('#follow_statuss'+screenName).empty().append('<a onclick="followUser('+name+')" class="social-icons"><i class="fas fa-user-plus"></i> follow</a>')
                                toastr.success(response.message);
                            }
                        },
                        error: function (error) {
                            $('#processing').empty();
                        },
                    });
                }

                function getScrollXY() {
                    let scrOfX = 0, scrOfY = 0;
                    if (typeof (window.pageYOffset) == 'number') {
                        //Netscape compliant
                        scrOfY = window.pageYOffset;
                        scrOfX = window.pageXOffset;
                    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                        //DOM compliant
                        scrOfY = document.body.scrollTop;
                        scrOfX = document.body.scrollLeft;
                    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                        //IE6 standards compliant mode
                        scrOfY = document.documentElement.scrollTop;
                        scrOfX = document.documentElement.scrollLeft;
                    }
                    return [scrOfX, scrOfY];
                }

                function getDocHeight() {
                    let D = document;
                    return Math.max(
                        D.body.scrollHeight, D.documentElement.scrollHeight,
                        D.body.offsetHeight, D.documentElement.offsetHeight,
                        D.body.clientHeight, D.documentElement.clientHeight
                    );
                }

                document.addEventListener("scroll", function (event) {
                        if (getDocHeight() === getScrollXY()[1] + window.innerHeight) {
                            pageId++;
                            let twtIds =  $('#twitter_id').val();
                            let keywordValue = $('#keyword').val();
                            let keywordValues = keywordValue=== "" ? "politics" : keywordValue;
                            getNexInfluencers(twtIds, keywordValues, pageId);
                    }

                });

                function getNexInfluencers(id, keywordValue , pageId) {
                    $.ajax({
                        type: "get",
                        url: "/discovery/get-twitter-influencers",
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        beforeSend: function () {
                            $('#loaders').empty().append('<div class="d-flex justify-content-center" id="loaderr" >\n' +
                                '        <div class="spinner-border" role="status"  id="loaderiss" style="display: none; alignment: center">\n' +
                                '            <span class="sr-only">Loading...</span>\n' +
                                '        </div>\n' +
                                '\n' +
                                '        </div>');
                            $(".spinner-border").css("display", "block");
                        },
                        data: {id, keywordValue, pageId},
                        success: function (response) {
                            $('#processing').empty();
                            let appendData = [];
                            let appendList = [];
                            response.data.data.map(data => {
                                let screenname = "'" + data.screen_name + "'";
                                appendData += '<div class="col-md-6 col-lg-4 col-xl-3">\n' +
                                    '                                <div class="card twittersubscription-card">\n' +
                                    '                                    <div class="twitter-card">\n' +
                                    '                                        <img src="'+data.profile_image_url+'" class="card-img-top" alt="...">\n' +
                                    '                                    </div>\n' +
                                    '                                    <div class="card-body p-3">\n' +
                                    '                                        <div class="text-center">\n' +
                                    '                                            <h4 class="card-title mb-2">'+data.screen_name+' <i class="fas fa-check-circle"></i>\n' +
                                    '                                            </h4>\n' +
                                    '                                        </div>\n' +
                                    '                                        <div class="text-center">\n' +
                                    data.name +
                                    '                                        </div>\n' +
                                    '                                        <hr />\n' +
                                    '                                        <div class="d-flex justify-content-center social-subscriptions">\n' +
                                    '                                            <div class="social-subscriptions-inner">\n' +
                                    '                                                <div class="start-item text-center">\n' +
                                    '                                                    <div class="start-item-name">\n' +
                                    '                                                        <p class="mb-1">Tweets</p>\n' +
                                    '                                                    </div>\n' +
                                    '                                                    <div class="start-item-value">\n' +
                                    '                                                        <h3 class="font-weight-bolder font-size-lg">'+data.statuses_count+'</h3>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="start-item text-center">\n' +
                                    '                                                    <div class="start-item-name">\n' +
                                    '                                                        <p class="mb-1">Followers</p>\n' +
                                    '                                                    </div>\n' +
                                    '                                                    <div class="start-item-value">\n' +
                                    '                                                        <h3 class="font-weight-bolder font-size-lg">'+data.followers_count+'</h3>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="start-item text-center">\n' +
                                    '                                                    <div class="start-item-name">\n' +
                                    '                                                        <p class="mb-1">Following</p>\n' +
                                    '                                                    </div>\n' +
                                    '                                                    <div class="start-item-value">\n' +
                                    '                                                        <h3 class="font-weight-bolder font-size-lg">'+data.friends_count+'</h3>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>\n' +
                                    '                                        <hr />\n' +
                                    '                                        <div class="twitter-social-icons mb-3">\n' +
                                    '<div id="follow_status'+data.screen_name+'">' +
                                    (data.following === true ? '<a onclick=\"unfollowUser('+screenname+')\" class=\"btn social-icons followButtonDiv\"><i class=\"fas fa-user-check\" ></i>following</a>\n' : ' <a onclick="followUser('+screenname+')" class="btn social-icons"><i class="fas fa-user-plus" ></i>follow</a>\n') +
                                    '</div>' +
                                    '                                       </div>\n' +
                                    '                                    </div>\n' +
                                    '                                </div>\n' +
                                    '                            </div>';

                                appendList += ' <div class="row d-flex align-items-center twitter-wrapper">\n' +
                                    '                                    <div class="col-md-5">\n' +
                                    '                                        <div class="d-flex align-items-center">\n' +
                                    '                                            <div class="twitter-card">\n' +
                                    '                                                <img src="'+data.profile_image_url+'" class="card-img-top" alt="...">\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="twiiter-details">\n' +
                                    '                                                <div>\n' +
                                    '                                                    <h4 class="card-title mb-2">'+data.screen_name+' <i class="fas fa-check-circle"></i>\n' +
                                    '                                                    </h4>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="">\n' +
                                    data.name +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>\n' +
                                    '                                    </div>\n' +
                                    '                                    <div class="col-md-2">\n' +
                                    '                                        <div class="twitter-social-icons mb-3">\n' +
                                    '<div id="follow_statuss'+data.screen_name+'">' +
                                    (data.following === true ? '<a onclick=\"unfollowUser('+screenname+')\" class="social-icons followButtonDiv"><i class="fas fa-user-check"></i> Following</a>\n' : '<a onclick="followUser('+screenname+')" class="social-icons"><i class="fas fa-user-plus"></i> follow</a>\n')+
                                    '</div>' +
                                    '            </div>\n' +
                                    '                                    </div>\n' +
                                    '                                    <div class="col-md-5">\n' +
                                    '                                        <div class="row">\n' +
                                    '                                            <div class="col-md-3">\n' +
                                    '                                                <div class="twitter-media">\n' +
                                    '                                                    <b>'+data.statuses_count+'</b>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="col-md-3">\n' +
                                    '                                                <div class="twitter-media">\n' +
                                    '                                                    <b>'+data.followers_count+'</b>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="col-md-3">\n' +
                                    '                                                <div class="twitter-media">\n' +
                                    '                                                    <b>'+data.friends_count+'</b>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>\n' +
                                    '                                    </div>\n' +
                                    '                                </div>\n' +
                                    '                                </div>';

                            })
                            $('#appendData').append(appendData)
                            $('#list_view').append(appendList)

                        },
                        error: function (error) {
                            $('#processing').empty();
                        },
                    });
                }

                function change(id) {
                    let keywordValue = "politics";
                    let twitterId = id.value;
                    getInfluencers(twitterId, keywordValue, pageId);
                }
            </script>
@endsection