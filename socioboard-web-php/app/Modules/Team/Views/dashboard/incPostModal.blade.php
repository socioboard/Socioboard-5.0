<div class="modal fade" id="postModal" tabindex="-1" role="dialog" aria-labelledby="postModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header p-1 bg-light"><h5 class="modal-title">Create post</h5>
                <button type="button" id="modalButtonClose" class="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-2">
                <form id="picuploadform" method="post" enctype='multipart/form-data'
                      action="/view-facebook-feeds/{{$account_id}}/postFiles" onsubmit="return false;"/>

                <div id="socialDoubledContainer"></div>
                {{--
                <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                    <ol class="carousel-indicators">
                        <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                        <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                        <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
                    </ol>
                    <div class="carousel-inner" style="height: 200px;">
                        <div class="carousel-item active"><img src="//i.imgur.com/TkgPTzV.png" class="d-block w-100"
                                                               alt="..."></div>
                        <div class="carousel-item">
                            <div class="video_dailymotion">
                                <video poster="//i.imgur.com/4zzdRB3h.jpg" muted="muted" autoplay="autoplay"
                                       loop="loop" class="video_width_full">
                                    <source src="https://i.imgur.com/MHybvto_lq.mp4" type="video/mp4">
                                </video>
                            </div>
                        </div>
                        <div class="carousel-item"><img src="//i.imgur.com/4TOGZkH.jpg" class="d-block w-100"
                                                        alt="..."></div>
                    </div>
                    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button"
                       data-slide="prev"> <span class="carousel-control-prev-icon" aria-hidden="true"></span> <span
                                class="sr-only">Previous</span> </a> <a class="carousel-control-next"
                                                                        href="#carouselExampleIndicators"
                                                                        role="button" data-slide="next"> <span
                                class="carousel-control-next-icon" aria-hidden="true"></span> <span class="sr-only">Next</span>
                    </a>
                </div>
                --}}

                <div class="form-group">
                    <textarea class="form-control border border-light" id="normal_post_area" rows="3"
                              placeholder="Write something !" required></textarea>
                </div>

                <div class="row">
                    <div class="col-12" id="">
                        <ul id="media-list" class="clearfix">
                            <li class="myupload">
                                <span>
                                    <i class="fa fa-plus" aria-hidden="true"></i>
                                    <input type="file" click-type="type2" id="picupload" name="content"
                                           class="picupload" multiple/>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr/>

                <div class="row">
                    <div class="col-md-12">
                        <button type="button" class="btn btn-fb btn-sm all_social_btn"> Add Accounts</button>
                        <div class="all_social_div">
                            <div>

                                <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                    @foreach($socioboard_accounts as $key => $account)
                                        <li class="nav-item">
                                            <a class="nav-link @if ($loop->index == 0) active @endif" id="pills-{{$key}}-profile-tab"
                                               data-toggle="pill" href="#pills-{{$key}}-profile"
                                               role="tab" aria-controls="pills-{{$key}}-profile"
                                               aria-selected="true"><i class="fab fa-{{$key}}"></i></a>
                                        </li>
                                    @endforeach
                                </ul>

                                <div class="tab-content" id="pills-tabContent">

                                    @foreach($socioboard_accounts as $key => $account)
                                    <div class="tab-pane fade @if ($loop->index == 0) show active @endif" id="pills-{{$key}}-profile" role="tabpanel" aria-labelledby="pills-{{$key}}-profile-tab">
                                        <div class="card margin-top-10">
                                            <div class="card-body bg-white p-2">
                                                <h6><b>Choose {{$key}} Pages for posting</b></h6>
                                                <div>
                                                    @if ( sizeof((array)$socioboard_accounts->$key) ==0 )
                                                        There are no available unlocked accounts in your team
                                                    @else
                                                        <ul class="list-group" id="media-popup-fb-accounts">
                                                            @foreach($socioboard_accounts->$key as $profile)
                                                                {{-- <pre>{{print_r($fb_profile)}}</pre>--}}
                                                                <li class="list-group-item page_list">
                                                                    <div class="media">
                                                                        <img class="mr-3 pp_50 rounded-circle" src="{{$profile->profile_pic_url}}" alt="page title"/>
                                                                        <div class="media-body">
                                                                        <span class="float-right badge badge-light">
                                                                            <div class="custom-control custom-checkbox">
                                                                                <input type="checkbox" class="custom-control-input"
                                                                                       id="fbPage{{$profile->account_id}}" data-account-id="{{$profile->account_id}}"
                                                                                       @if ($profile->account_id == $account_id) checked @endif />
                                                                                <label class="custom-control-label" for="fbPage{{$profile->account_id}}">
                                                                                    <span style="display: flex; margin-top: 6px;">Add</span>
                                                                                </label>
                                                                            </div>
                                                                        </span>
                                                                            <h5 class="mt-2 mb-0 page_name">{{$profile->first_name}}  {{$profile->last_name}}</h5>
                                                                            {{-- <b style="font-size: 12px;">Follower:</b> abcdef --}}
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            @endforeach
                                                        </ul>
                                                    @endif
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    @endforeach
                                    {{--
                                    <div class="tab-pane fade" id="pills-twitter-profile" role="tabpanel" aria-labelledby="pills-twitter-profile-tab">
                                        <div class="card margin-top-10">
                                            <div class="card-body bg-white p-2"><h6><b>Choose Twitter profile for posting</b></h6>
                                                <div>
                                                    <ul class="list-group">
                                                        <li class="list-group-item page_list">
                                                            <div class="media">
                                                                <img class="mr-3 pp_50 rounded-circle" src="../../assets/imgs/64x64.jpg" alt="page title"/>
                                                                <div class="media-body">
                                                                        <span class="float-right badge badge-light">
                                                                            <div class="custom-control custom-checkbox">
                                                                                <input type="checkbox" class="custom-control-input" id="twtPage1"/>
                                                                                <label class="custom-control-label" for="twtPage1">
                                                                                    <span style="display: flex; margin-top: 6px;">Add</span>
                                                                                </label>
                                                                            </div>
                                                                        </span>
                                                                    <h5 class="mt-2 mb-0 page_name"> Chanchal Santra </h5> <b style="font-size: 12px;">Follower:</b> 1m
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="list-group-item page_list">
                                                            <div class="media">
                                                                <img class="mr-3 pp_50 rounded-circle" src="../../assets/imgs/64x64.jpg" alt="page title"/>
                                                                <div class="media-body">
                                                                    <span class="float-right badge badge-light">
                                                                        <div class="custom-control custom-checkbox">
                                                                            <input type="checkbox" class="custom-control-input" id="twtPage2"/>
                                                                            <label class="custom-control-label" for="twtPage2">
                                                                                <span style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                    <h5 class="mt-2 mb-0 page_name"> Chanchal Santra </h5> <b style="font-size: 12px;">Follower:</b> 1m
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="list-group-item page_list">
                                                            <div class="media">
                                                                <img
                                                                        class="mr-3 pp_50 rounded-circle"
                                                                        src="../../assets/imgs/64x64.jpg"
                                                                        alt="page title"/>
                                                                <div class="media-body"><span
                                                                            class="float-right badge badge-light"> <div
                                                                                class="custom-control custom-checkbox"> <input
                                                                                    type="checkbox"
                                                                                    class="custom-control-input"
                                                                                    id="twtPage3"/> <label
                                                                                    class="custom-control-label"
                                                                                    for="twtPage3"><span
                                                                                        style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                    <h5 class="mt-2 mb-0 page_name"> Chanchal
                                                                        Santra </h5> <b style="font-size: 12px;">Follower:</b>
                                                                    1m
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    --}}

                                    <div class="tab-pane fade" id="pills-linkedin-profile" role="tabpanel"
                                         aria-labelledby="pills-linkedin-profile-tab">
                                        <div class="card margin-top-10">
                                            <div class="card-body bg-white p-2"><h6><b>Choose Linkedin Profile and
                                                        Pages for posting</b></h6>
                                                <div>
                                                    <ul class="list-group">
                                                        <li class="list-group-item page_list">
                                                            <div class="media"><img
                                                                        class="mr-3 pp_50 rounded-circle"
                                                                        src="../../assets/imgs/64x64.jpg"
                                                                        alt="page title"/>
                                                                <div class="media-body"><span
                                                                            class="float-right badge badge-light"> <div
                                                                                class="custom-control custom-checkbox"> <input
                                                                                    type="checkbox"
                                                                                    class="custom-control-input"
                                                                                    id="inPage1"/> <label
                                                                                    class="custom-control-label"
                                                                                    for="inPage1"><span
                                                                                        style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                    <h5 class="mt-2 mb-0 page_name"> Chanchal
                                                                        Santra </h5> <b style="font-size: 12px;">Follower:</b>
                                                                    1m
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="list-group-item page_list">
                                                            <div class="media"><img
                                                                        class="mr-3 pp_50 rounded-circle"
                                                                        src="../../assets/imgs/64x64.jpg"
                                                                        alt="page title"/>
                                                                <div class="media-body"><span
                                                                            class="float-right badge badge-light"> <div
                                                                                class="custom-control custom-checkbox"> <input
                                                                                    type="checkbox"
                                                                                    class="custom-control-input"
                                                                                    id="inPage2"/> <label
                                                                                    class="custom-control-label"
                                                                                    for="inPage2"><span
                                                                                        style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                    <h5 class="mt-2 mb-0 page_name"> Chanchal
                                                                        Santra </h5> <b style="font-size: 12px;">Follower:</b>
                                                                    1m
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="list-group-item page_list">
                                                            <div class="media"><img
                                                                        class="mr-3 pp_50 rounded-circle"
                                                                        src="../../assets/imgs/64x64.jpg"
                                                                        alt="page title"/>
                                                                <div class="media-body"><span
                                                                            class="float-right badge badge-light"> <div
                                                                                class="custom-control custom-checkbox"> <input
                                                                                    type="checkbox"
                                                                                    class="custom-control-input"
                                                                                    id="inPage3"/> <label
                                                                                    class="custom-control-label"
                                                                                    for="inPage3"><span
                                                                                        style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                    <h5 class="mt-2 mb-0 page_name"> Chanchal
                                                                        Santra </h5> <b style="font-size: 12px;">Follower:</b>
                                                                    1m
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="pills-pinterest-profile" role="tabpanel"
                                         aria-labelledby="pills-pinterest-profile-tab">
                                        <div class="card margin-top-10">
                                            <div class="card-body bg-white p-2"><h6><b>Choose Pinterest Profile for
                                                        posting</b></h6>
                                                <div class="accordion" id="accordionExample">
                                                    <div class="card border-0">
                                                        <div class="card-header bg-danger text-white p-1 m-0"
                                                             id="headingOne" style="cursor: pointer;">
                                                            <div data-toggle="collapse" data-target="#profile_pin_1"
                                                                 aria-expanded="true" aria-controls="profile_pin_1">
                                                                <div class="media"><img
                                                                            src="../../assets/imgs/bydefault.png"
                                                                            class="mr-3 pp_50 rounded-circle"
                                                                            alt="avatar"/>
                                                                    <div class="media-body"><h5 class="mt-0 mb-0">
                                                                            Chanchal</h5> <span>2</span> boards
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div id="profile_pin_1" class="collapse show"
                                                             aria-labelledby="headingOne"
                                                             data-parent="#accordionExample">
                                                            <div class="card-body p-2">
                                                                <ul class="list-group">
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media"><img
                                                                                    class="mr-3 pp_50 rounded-circle"
                                                                                    src="../../assets/imgs/64x64.jpg"
                                                                                    alt="page title"/>
                                                                            <div class="media-body"><span
                                                                                        class="float-right badge badge-light"> <div
                                                                                            class="custom-control custom-checkbox"> <input
                                                                                                type="checkbox"
                                                                                                class="custom-control-input"
                                                                                                id="pin_board_1"/> <label
                                                                                                class="custom-control-label"
                                                                                                for="pin_board_1"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                                <h5 class="mt-2 mb-0 page_name">
                                                                                    board name one </h5> <b
                                                                                        style="font-size: 12px;">pin:</b>
                                                                                14
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media"><img
                                                                                    class="mr-3 pp_50 rounded-circle"
                                                                                    src="../../assets/imgs/64x64.jpg"
                                                                                    alt="page title"/>
                                                                            <div class="media-body"><span
                                                                                        class="float-right badge badge-light"> <div
                                                                                            class="custom-control custom-checkbox"> <input
                                                                                                type="checkbox"
                                                                                                class="custom-control-input"
                                                                                                id="pin_board_2"/> <label
                                                                                                class="custom-control-label"
                                                                                                for="pin_board_2"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                                <h5 class="mt-2 mb-0 page_name">
                                                                                    board name one </h5> <b
                                                                                        style="font-size: 12px;">pin:</b>
                                                                                14
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media"><img
                                                                                    class="mr-3 pp_50 rounded-circle"
                                                                                    src="../../assets/imgs/64x64.jpg"
                                                                                    alt="page title"/>
                                                                            <div class="media-body"><span
                                                                                        class="float-right badge badge-light"> <div
                                                                                            class="custom-control custom-checkbox"> <input
                                                                                                type="checkbox"
                                                                                                class="custom-control-input"
                                                                                                id="pin_board_3"/> <label
                                                                                                class="custom-control-label"
                                                                                                for="pin_board_3"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                                <h5 class="mt-2 mb-0 page_name">
                                                                                    board name one </h5> <b
                                                                                        style="font-size: 12px;">pin:</b>
                                                                                14
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card border-0">
                                                        <div class="card-header bg-danger text-white p-1 m-0"
                                                             id="headingTwo" style="cursor: pointer;">
                                                            <div data-toggle="collapse" data-target="#profile_pin_2"
                                                                 aria-expanded="true" aria-controls="profile_pin_2">
                                                                <div class="media"><img
                                                                            src="../../assets/imgs/bydefault.png"
                                                                            class="mr-3 pp_50 rounded-circle"
                                                                            alt="avatar"/>
                                                                    <div class="media-body"><h5 class="mt-0 mb-0">
                                                                            Socioboard </h5> <span>3</span> boards
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div id="profile_pin_2" class="collapse"
                                                             aria-labelledby="headingTwo"
                                                             data-parent="#accordionExample">
                                                            <div class="card-body p-2">
                                                                <ul class="list-group">
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media"><img
                                                                                    class="mr-3 pp_50 rounded-circle"
                                                                                    src="../../assets/imgs/64x64.jpg"
                                                                                    alt="page title"/>
                                                                            <div class="media-body"><span
                                                                                        class="float-right badge badge-light"> <div
                                                                                            class="custom-control custom-checkbox"> <input
                                                                                                type="checkbox"
                                                                                                class="custom-control-input"
                                                                                                id="pin_board_21"/> <label
                                                                                                class="custom-control-label"
                                                                                                for="pin_board_21"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                                <h5 class="mt-2 mb-0 page_name">
                                                                                    board name one </h5> <b
                                                                                        style="font-size: 12px;">pin:</b>
                                                                                14
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media"><img
                                                                                    class="mr-3 pp_50 rounded-circle"
                                                                                    src="../../assets/imgs/64x64.jpg"
                                                                                    alt="page title"/>
                                                                            <div class="media-body"><span
                                                                                        class="float-right badge badge-light"> <div
                                                                                            class="custom-control custom-checkbox"> <input
                                                                                                type="checkbox"
                                                                                                class="custom-control-input"
                                                                                                id="pin_board_22"/> <label
                                                                                                class="custom-control-label"
                                                                                                for="pin_board_22"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                                <h5 class="mt-2 mb-0 page_name">
                                                                                    board name one </h5> <b
                                                                                        style="font-size: 12px;">pin:</b>
                                                                                14
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media"><img
                                                                                    class="mr-3 pp_50 rounded-circle"
                                                                                    src="../../assets/imgs/64x64.jpg"
                                                                                    alt="page title"/>
                                                                            <div class="media-body"><span
                                                                                        class="float-right badge badge-light"> <div
                                                                                            class="custom-control custom-checkbox"> <input
                                                                                                type="checkbox"
                                                                                                class="custom-control-input"
                                                                                                id="pin_board_23"/> <label
                                                                                                class="custom-control-label"
                                                                                                for="pin_board_23"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label> </div></span>
                                                                                <h5 class="mt-2 mb-0 page_name">
                                                                                    board name one </h5> <b
                                                                                        style="font-size: 12px;">pin:</b>
                                                                                14
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" id="modalButtonDraft" class="btn btn-secondary" data-dismiss="modal"
                        data-role="draft">Draft
                </button>
                <button type="button" id="modalButtonSend" class="btn btn-primary" data-role="send">Send</button>
            </div>
        </div>
    </div>
</div>